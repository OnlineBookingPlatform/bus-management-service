import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DTO_RP_Point, DTO_RP_PointName, DTO_RQ_Point } from './point.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Point } from './point.entity';
import { Company } from '../company/company.entity';
import { Province } from '../location/provinces.entity';
import { District } from '../location/districts.entity';
import { Ward } from '../location/wards.entity';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,

    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  async createPoint(data: DTO_RQ_Point): Promise<DTO_RP_Point> {
    console.log('📌 Dữ liệu nhận từ FE:', data);

    const existingCompany = await this.companyRepository.findOne({
      where: { id: data.company_id },
    });
    if (!existingCompany)
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.NOT_FOUND,
      );

    const existingProvince = await this.provinceRepository.findOne({
      where: { id: data.provinces_id },
    });
    if (!existingProvince)
      throw new HttpException(
        'Dữ liệu Tỉnh/Thành phố không tồn tại!',
        HttpStatus.NOT_FOUND,
      );

    const existingDistrict = await this.districtRepository.findOne({
      where: { id: data.districts_id },
    });
    if (!existingDistrict)
      throw new HttpException(
        'Dữ liệu Quận/Huyện không tồn tại!',
        HttpStatus.NOT_FOUND,
      );

    let existingWard = null;
    if (data.wards_id) {
      existingWard = await this.wardRepository.findOne({
        where: { id: data.wards_id },
      });
      if (!existingWard)
        throw new HttpException(
          'Dữ liệu Xã/Phường không tồn tại!',
          HttpStatus.NOT_FOUND,
        );
    }

    console.log('📌 Chuẩn bị tạo bản ghi mới:', {
      name: data.name,
      address: data.address,
      company: existingCompany,
      province: existingProvince,
      district: existingDistrict,
      ward: existingWard,
    });

    try {
      const newPoint = this.pointRepository.create({
        name: data.name,
        address: data.address,
        company: existingCompany,
        province: existingProvince,
        district: existingDistrict,
        ward: existingWard,
      });

      console.log('⏳ Đang lưu vào database...');
      const savedPoint = await this.pointRepository.save(newPoint);
      console.log('✅ Lưu thành công:', savedPoint);

      return {
        id: savedPoint.id,
        name: savedPoint.name,
        address: savedPoint.address,
        provinces_id: savedPoint.province.id,
        districts_id: savedPoint.district.id,
        wards_id: savedPoint.ward ? savedPoint.ward.id : null,
      };
    } catch (error) {
      console.error('❌ Lỗi khi lưu vào database:', error);
      throw new HttpException(
        'Lỗi khi lưu điểm vào hệ thống!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPointsByCompany(id: number): Promise<DTO_RP_Point[]> {
    console.log('📌 Lấy danh sách địa điểm cho công ty:', id);

    const existingCompany = await this.companyRepository.findOne({
      where: { id: id },
    });

    if (!existingCompany) {
      console.error('Company not found!');
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const points = await this.pointRepository.find({
      where: { company: { id: id } },
      relations: ['province', 'district', 'ward'],
    });

    if (!points || points.length === 0) {
      return [];
    }

    console.log('Danh sách địa điểm:', points);

    // Chỉ trả về các trường có trong DTO_RP_Point
    const mappedPoint: DTO_RP_Point[] = points.map((point) => ({
      id: point.id,
      name: point.name,
      address: point.address,
      provinces_id: point.province ? point.province.id : null,
      districts_id: point.district ? point.district.id : null,
      wards_id: point.ward ? point.ward.id : null,
    }));

    console.log('Mapped points:', mappedPoint);
    return mappedPoint;
  }

  async deletePoint(id: number): Promise<void> {
    const existingPoint = await this.pointRepository.findOne({
      where: { id: id },
    });

    if (!existingPoint) {
      throw new HttpException(
        'Dữ liệu địa điểm không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.pointRepository.delete(id);
  }

  async updatePoint(id: number, data: DTO_RQ_Point): Promise<DTO_RP_Point> {
    const existingPoint = await this.pointRepository.findOne({
      where: { id: id },
      relations: ['province', 'district', 'ward'],
    });

    if (!existingPoint) {
      throw new HttpException(
        'Dữ liệu địa điểm không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const province = data.provinces_id
      ? await this.provinceRepository.findOne({
          where: { id: data.provinces_id },
        })
      : existingPoint.province;

    const district = data.districts_id
      ? await this.districtRepository.findOne({
          where: { id: data.districts_id },
        })
      : existingPoint.district;

    const ward = data.wards_id
      ? await this.wardRepository.findOne({ where: { id: data.wards_id } })
      : existingPoint.ward;

    await this.pointRepository.save({
      ...existingPoint,
      ...data,
      province,
      district,
      ward,
    });

    const updatedPoint = await this.pointRepository.findOne({
      where: { id: id },
      relations: ['province', 'district', 'ward'],
    });

    return {
      id: updatedPoint.id,
      name: updatedPoint.name,
      address: updatedPoint.address,
      provinces_id: updatedPoint.province?.id ?? null,
      districts_id: updatedPoint.district?.id ?? null,
      wards_id: updatedPoint.ward?.id ?? null,
    };
  }

  async getPointNameByCompany(id: number): Promise<DTO_RP_PointName[]> {
    const existingCompany = await this.companyRepository.findOne({
      where: { id: id },
    });

    if (!existingCompany) {
      console.error('Company not found!');
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const points = await this.pointRepository.find({
      where: { company: { id: id } },
    });
    
    if (!points || points.length === 0) {
      return [];
    }

    const mappedPoint = points.map((point) => ({
      id: point.id,
      name: point.name,
    }));
    return mappedPoint;
  }
}
