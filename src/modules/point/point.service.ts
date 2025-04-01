import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  DTO_RP_Point,
  DTO_RP_PointName,
  DTO_RP_PointOfRoute,
  DTO_RQ_Point,
  DTO_RQ_PointOfRoute,
} from './point.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Point } from './point.entity';
import { Company } from '../company/company.entity';
import { Province } from '../location/provinces.entity';
import { District } from '../location/districts.entity';
import { Ward } from '../location/wards.entity';
import { Route } from '../route/route.entity';
import { PointOfRoute } from './point_of_route.entity';

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

    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,

    @InjectRepository(PointOfRoute)
    private readonly pointOfRouteRepository: Repository<PointOfRoute>,
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

  async createPointOfRoute(
    data: DTO_RQ_PointOfRoute[],
  ): Promise<DTO_RP_PointOfRoute[]> {
    console.log('📌 Dữ liệu nhận từ FE:', data);

    const results: DTO_RP_PointOfRoute[] = [];

    try {
      for (const item of data) {
        console.log(
          `🔍 Xử lý điểm dừng route_id: ${item.route_id}, point_id: ${item.point_id}`,
        );

        // 1. Kiểm tra các thực thể liên quan (song song)
        const [company, point, route] = await Promise.all([
          this.companyRepository.findOne({ where: { id: item.company_id } }),
          this.pointRepository.findOne({ where: { id: item.point_id } }),
          this.routeRepository.findOne({ where: { id: item.route_id } }),
        ]);

        if (!company) {
          console.error(`❌ Công ty không tồn tại: ${item.company_id}`);
          throw new HttpException(
            `Công ty với id ${item.company_id} không tồn tại!`,
            HttpStatus.NOT_FOUND,
          );
        }

        if (!point) {
          console.error(`❌ Địa điểm không tồn tại: ${item.point_id}`);
          throw new HttpException(
            `Địa điểm với id ${item.point_id} không tồn tại!`,
            HttpStatus.NOT_FOUND,
          );
        }

        if (!route) {
          console.error(`❌ Tuyến đường không tồn tại: ${item.route_id}`);
          throw new HttpException(
            `Tuyến đường với id ${item.route_id} không tồn tại!`,
            HttpStatus.NOT_FOUND,
          );
        }

        // 2. Kiểm tra điểm dừng đã tồn tại trong tuyến chưa
        const existingPointOfRoute = await this.pointOfRouteRepository.findOne({
          where: {
            route: { id: item.route_id },
            point: { id: item.point_id },
          },
          relations: ['point', 'route', 'company'],
        });

        if (existingPointOfRoute) {
          // 3. Kiểm tra thay đổi
          const shouldUpdate =
            existingPointOfRoute.time !== item.time ||
            existingPointOfRoute.display_order !== item.display_order;

          if (shouldUpdate) {
            console.log(
              `🔄 Cập nhật điểm dừng (ID: ${existingPointOfRoute.id})`,
            );
            existingPointOfRoute.time = item.time;
            existingPointOfRoute.display_order = item.display_order;

            await this.pointOfRouteRepository.save(existingPointOfRoute);
          } else {
            console.log(
              `⏩ Bỏ qua (không thay đổi) point_id: ${item.point_id}`,
            );
          }

          results.push(this.mapToResponseDTO(existingPointOfRoute, point.name));
        } else {
          // 4. Tạo mới nếu chưa tồn tại
          console.log(`🆕 Tạo mới điểm dừng cho point_id: ${item.point_id}`);
          const newPointOfRoute = this.pointOfRouteRepository.create({
            time: item.time,
            display_order: item.display_order,
            point,
            route,
            company,
          });

          const savedPoint =
            await this.pointOfRouteRepository.save(newPointOfRoute);
          results.push(this.mapToResponseDTO(savedPoint, point.name));
        }
      }

      console.log(`✅ Hoàn thành xử lý ${results.length} điểm dừng`);
      return results;
    } catch (error) {
      console.error('❌ Lỗi trong quá trình xử lý:', error);
      throw error;
    }
  }

  private mapToResponseDTO(
    pointOfRoute: PointOfRoute,
    pointName: string,
  ): DTO_RP_PointOfRoute {
    return {
      id: pointOfRoute.id,
      name: pointName,
      time: pointOfRoute.time,
      display_order: pointOfRoute.display_order,
      point_id: pointOfRoute.point.id,
      route_id: pointOfRoute.route.id,
      company_id: pointOfRoute.company.id,
    };
  }

  async getPointOfRouteByRoute(id: number): Promise<DTO_RP_PointOfRoute[]> {
    console.log('🔍 Bắt đầu lấy điểm dừng theo tuyến, routeId:', id);

    // 1. Kiểm tra tuyến đường tồn tại
    console.log('📝 Kiểm tra tuyến đường có tồn tại...');
    const existingRoute = await this.routeRepository.findOne({
      where: { id },
    });

    if (!existingRoute) {
      console.error(`❌ Không tìm thấy tuyến đường với id: ${id}`);
      throw new HttpException(
        `Tuyến đường với id ${id} không tồn tại!`,
        HttpStatus.NOT_FOUND,
      );
    }
    console.log('✅ Tuyến đường tồn tại:', existingRoute.name);

    // 2. Lấy điểm dừng của tuyến
    console.log('📝 Lấy danh sách điểm dừng của tuyến...');
    const pointsOfRoute = await this.pointOfRouteRepository.find({
      where: {
        route: { id },
      },
      relations: ['point', 'route', 'company'],
      order: {
        display_order: 'ASC',
      },
    });
    console.log(`✅ Tìm thấy ${pointsOfRoute.length} điểm dừng`);

    // 3. Log chi tiết từng điểm dừng
    console.log('📋 Danh sách điểm dừng (đã sắp xếp theo display_order):');
    pointsOfRoute.forEach((point, index) => {
      console.log(`   ${index + 1}. ${point.point.name} 
        - Thời gian: ${point.time}
        - Thứ tự: ${point.display_order}
        - Địa chỉ: ${point.point.address}
        - ID: ${point.id}`);
    });

    // 4. Map sang DTO
    console.log('🔄 Đang chuyển đổi sang DTO...');
    const result = pointsOfRoute.map((point) => ({
      id: point.id,
      point_id: point.point.id,
      route_id: point.route.id,
      company_id: point.company.id,
      name: point.point.name,
      time: point.time,
      display_order: point.display_order,
    }));
    console.log('✅ Chuyển đổi thành công');

    return result;
  }
}
