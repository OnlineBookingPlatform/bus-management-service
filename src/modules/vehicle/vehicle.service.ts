import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './vehicle.entity';
import { Company } from '../company/company.entity';
import { Repository } from 'typeorm';
import { DTO_RP_Vehicle, DTO_RQ_Vehicle } from './vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  // Tạo phương tiện mới
  // Tạo phương tiện mới
  async createVehicle(vehicle: DTO_RQ_Vehicle): Promise<DTO_RP_Vehicle> {
    try {
      console.log('🔹 [STEP 1] Received Data Vehicle from client:', vehicle);

      // Kiểm tra công ty có tồn tại không
      const existingCompany = await this.companyRepository.findOne({
        where: { id: vehicle.company_id },
      });
      if (!existingCompany) {
        console.error('❌ [ERROR] Công ty không tồn tại:', vehicle.company_id);
        throw new HttpException(
          'Dữ liệu công ty không tồn tại!',
          HttpStatus.NOT_FOUND,
        );
      }
      console.log('✅ [STEP 2] Company found:', existingCompany.id);

      // Kiểm tra biển số xe đã tồn tại trong công ty chưa
      const existingVehicle = await this.vehicleRepository.findOne({
        where: {
          license_plate: vehicle.license_plate,
          company_id: vehicle.company_id,
        },
      });
      if (existingVehicle) {
        console.error(
          `❌ [ERROR] Biển số ${vehicle.license_plate} đã tồn tại trong công ty ${vehicle.company_id}`,
        );
        throw new HttpException(
          `${vehicle.license_plate} đã tồn tại trong công ty!`,
          HttpStatus.CONFLICT, // 409 Conflict
        );
      }
      console.log('✅ [STEP 3] Biển số chưa tồn tại, tiếp tục tạo xe...');

      // Tạo phương tiện mới
      const newVehicle = this.vehicleRepository.create({
        ...vehicle,
        company: existingCompany,
      });
      console.log('🔹 [STEP 4] Created vehicle entity (chưa lưu):', newVehicle);

      // Lưu phương tiện vào database
      const savedVehicle = await this.vehicleRepository.save(newVehicle);
      console.log('✅ [STEP 5] Vehicle saved to database:', savedVehicle.id);

      // Trả về dữ liệu đã lưu
      return {
        id: savedVehicle.id,
        license_plate: savedVehicle.license_plate,
        phone: savedVehicle.phone,
        brand: savedVehicle.brand,
        type: savedVehicle.type,
        color: savedVehicle.color,
        note: savedVehicle.note,
        registration_expiry: savedVehicle.registration_expiry
          ? savedVehicle.registration_expiry.toISOString()
          : null,
        insurance_expiry: savedVehicle.insurance_expiry
          ? savedVehicle.insurance_expiry.toISOString()
          : null,
        status: savedVehicle.status,
        created_at: savedVehicle.created_at.toISOString(),
      };
    } catch (error) {
      console.error('❌ [ERROR] Lỗi khi tạo phương tiện:', error);
      throw new HttpException(
        'Đã xảy ra lỗi khi tạo phương tiện!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lấy danh sách phương tiện theo công ty
  async getVehicleByCompany(companyId: number): Promise<DTO_RP_Vehicle[]> {
    try {
      console.log('🔹 [STEP 1] Received Company ID:', companyId);
      const existingCompany = await this.companyRepository.findOne({
        where: { id: companyId },
      });
      if (!existingCompany) {
        console.error('❌ [ERROR] Công ty không tồn tại:', companyId);
        throw new HttpException(
          'Dữ liệu công ty không tồn tại!',
          HttpStatus.NOT_FOUND,
        );
      }
      console.log('✅ [STEP 2] Company found:', existingCompany.id);
      const vehicles = await this.vehicleRepository.find({
        where: { company_id: companyId },
      });
      console.log('✅ [STEP 3] Vehicles found:', vehicles.length);
      return vehicles.map((vehicle) => ({
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        phone: vehicle.phone,
        brand: vehicle.brand,
        type: vehicle.type,
        color: vehicle.color,
        note: vehicle.note,
        registration_expiry: vehicle.registration_expiry
          ? vehicle.registration_expiry.toISOString()
          : null,
        insurance_expiry: vehicle.insurance_expiry
          ? vehicle.insurance_expiry.toISOString()
          : null,
        status: vehicle.status,
        created_at: vehicle.created_at.toISOString(),
      }));
    } catch (error) {
      console.error('❌ [ERROR] Lỗi khi lấy danh sách phương tiện:', error);
      throw new HttpException(
        'Đã xảy ra lỗi khi lấy danh sách phương tiện!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Xóa phương tiện theo ID
  async deleteVehicle(id: number): Promise<void> {
    try {
      console.log('🔹 [STEP 1] Received Vehicle ID to delete:', id);
      const vehicle = await this.vehicleRepository.findOne({
        where: { id },
      });
      if (!vehicle) {
        console.error('❌ [ERROR] Phương tiện không tồn tại:', id);
        throw new HttpException(
          'Phương tiện không tồn tại!',
          HttpStatus.NOT_FOUND,
        );
      }
      console.log('✅ [STEP 2] Vehicle found:', vehicle.id);

      // Xóa phương tiện
      await this.vehicleRepository.delete(id);
      console.log('✅ [STEP 3] Vehicle deleted successfully:', id);
    } catch (error) {
      console.error('❌ [ERROR] Lỗi khi xóa phương tiện:', error);
      throw new HttpException(
        'Đã xảy ra lỗi khi xóa phương tiện!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Cập nhật phương tiện theo ID
  async updateVehicle(data: {
    id: number;
    data: DTO_RQ_Vehicle;
  }): Promise<DTO_RP_Vehicle> {
    try {
      const existingVehicle = await this.vehicleRepository.findOne({
        where: { id: data.id },
      });
      if (!existingVehicle) {
        console.error('❌ [ERROR] Phương tiện không tồn tại:', data.id);
        throw new HttpException(
          'Phương tiện không tồn tại!',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.vehicleRepository.update(data.id, data.data);
      const updatedVehicle = await this.vehicleRepository.findOne({
        where: { id: data.id },
      });
      return {
        id: updatedVehicle.id,
        license_plate: updatedVehicle.license_plate,
        phone: updatedVehicle.phone,
        brand: updatedVehicle.brand,
        type: updatedVehicle.type,
        color: updatedVehicle.color,
        note: updatedVehicle.note,
        registration_expiry: updatedVehicle.registration_expiry
          ? updatedVehicle.registration_expiry.toISOString()
          : null,
        insurance_expiry: updatedVehicle.insurance_expiry
          ? updatedVehicle.insurance_expiry.toISOString()
          : null,
        status: updatedVehicle.status,
        created_at: updatedVehicle.created_at.toISOString(),
      };
    } catch (error) {
      console.error('❌ [ERROR] Lỗi khi cập nhật phương tiện:', error);
      throw new HttpException(
        'Đã xảy ra lỗi khi cập nhật phương tiện!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
