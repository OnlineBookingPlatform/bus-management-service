import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Company } from '../company/company.entity';
import { DTO_RP_Route, DTO_RP_RouteName, DTO_RQ_Route } from './route.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from './route.entity';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  async getRouteByCompanyId(id: number): Promise<DTO_RP_Route[]> {
    console.log('Received Company ID:', id);

    const existingCompany = await this.companyRepository.findOne({
      where: { id: id },
    });

    if (!existingCompany) {
      console.error('❌ [ERROR] Công ty không tồn tại với ID:', id);
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const routes = await this.routeRepository.find({
      where: { company_id: id },
      order: { display_order: 'ASC' },
    });

    if (!routes || routes.length === 0) {
      return [];
    }
    const mappedRoute = routes.map((route) => {
      return {
        id: route.id,
        name: route.name,
        shorten_name: route.shorten_name,
        base_price: route.base_price,
        status: route.status,
        note: route.note,
        created_at: route.created_at.toISOString(),
      };
    });

    return mappedRoute;
  }

  async createRoute(route: DTO_RQ_Route): Promise<DTO_RP_Route> {
    try {
      // console.log('1. Received data:', JSON.stringify(route, null, 2));

      // Validate input
      if (!route.company_id || !route.name) {
        // console.log('2. Validation failed - missing required fields');
        throw new HttpException(
          'Thiếu thông tin bắt buộc',
          HttpStatus.BAD_REQUEST,
        );
      }

      // console.log('3. Checking company exists...');
      const existingCompany = await this.companyRepository.findOne({
        where: { id: route.company_id },
      });
      // console.log('4. Company found:', existingCompany);

      if (!existingCompany) {
        // console.log('5. Company not found');
        throw new HttpException(
          'Dữ liệu công ty không tồn tại!',
          HttpStatus.NOT_FOUND,
        );
      }

      // console.log('6. Checking duplicate route...');
      const existingRoute = await this.routeRepository.findOne({
        where: {
          name: route.name,
          company_id: route.company_id,
        },
      });
      // console.log('7. Existing route:', existingRoute);

      if (existingRoute) {
        // console.log('8. Duplicate route found');
        throw new HttpException(
          `${route.name} đã tồn tại trong công ty!`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // console.log('9. Getting max display order for company...');
      const maxDisplayOrder = await this.routeRepository
        .createQueryBuilder('route')
        .select('MAX(route.display_order)', 'max')
        .where('route.company_id = :companyId', { companyId: route.company_id })
        .getRawOne();

      const newDisplayOrder = (maxDisplayOrder.max || 0) + 1;
      // console.log('10. New display order:', newDisplayOrder);

      // console.log('11. Creating new route...');
      const newRoute = this.routeRepository.create({
        ...route,
        company: existingCompany,
        display_order: newDisplayOrder,
      });
      // console.log('12. New route object:', newRoute);

      // console.log('13. Saving to database...');
      const savedRoute = await this.routeRepository.save(newRoute);
      // console.log('14. Saved route:', savedRoute);

      return {
        id: savedRoute.id,
        name: savedRoute.name,
        shorten_name: savedRoute.shorten_name,
        base_price: savedRoute.base_price,
        status: savedRoute.status,
        note: savedRoute.note,
        created_at: savedRoute.created_at.toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        'Lỗi hệ thống!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateRoute(id: number, data: DTO_RQ_Route): Promise<DTO_RP_Route> {
    console.log('Received data:', data);
    const existingRoute = await this.routeRepository.findOne({
      where: { id },
    });
    if (!existingRoute) {
      throw new HttpException(
        'Dữ liệu tuyến đường không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedRoute = await this.routeRepository.save({
      ...existingRoute,
      ...data,
      created_at: existingRoute.created_at,
    });
    return {
      id: updatedRoute.id,
      name: updatedRoute.name,
      shorten_name: updatedRoute.shorten_name,
      base_price: updatedRoute.base_price,
      status: updatedRoute.status,
      note: updatedRoute.note,
      created_at: updatedRoute.created_at.toISOString(),
    };
  }

  /// Xóa tuyến đường
  /// Cần xử lý thêm display_order
  // Ví dụ có 3 tuyến đường với display_order là 1, 2, 3. Xóa tuyến đường 2
  // cần cập nhật lại display_order của các tuyến đường còn lại thành 1, 2. không còn là 1,3 nữa
  async deleteRoute(id: number): Promise<void> {
    const existingRoute = await this.routeRepository.findOne({
      where: { id },
    });
    if (!existingRoute) {
      throw new HttpException(
        'Dữ liệu tuyến đường không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.routeRepository.delete(id);
  }

  async getRouteNameByCompanyId(id: number): Promise<DTO_RP_RouteName[]> {
    const existingCompany = await this.companyRepository.findOne({
      where: { id: id },
    });

    if (!existingCompany) {
      console.error('❌ [ERROR] Công ty không tồn tại với ID:', id);
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const routes = await this.routeRepository.find({
      where: { company_id: id, status: true },
      order: { display_order: 'ASC' },
    });

    if (!routes || routes.length === 0) {
      return [];
    }
    const mappedRoute = routes.map((route) => {
      return {
        id: route.id,
        name: route.name,
      };
    });

    return mappedRoute;
  }

  async moveTopRoute(id: number): Promise<DTO_RP_Route[]> {
    console.log('🔍 Tìm tuyến cần di chuyển với ID:', id);
  
    // 1. Tìm tuyến cần di chuyển
    const routeToMove = await this.routeRepository.findOne({
      where: { id },
      relations: ['company'],
    });
  
    if (!routeToMove) {
      throw new HttpException('❌ Tuyến không tồn tại', HttpStatus.NOT_FOUND);
    }
  
    // 2. Lấy tất cả tuyến cùng công ty (đã sắp xếp)
    let allRoutes = await this.routeRepository.find({
      where: { company: { id: routeToMove.company.id } },
      order: { display_order: 'ASC' },
    });
  
    console.log('📋 Danh sách trước khi di chuyển:', allRoutes.map(r => ({ id: r.id, display_order: r.display_order })));
  
    // 3. Kiểm tra nếu tuyến cần di chuyển có display_order nhỏ nhất
    const minOrder = Math.min(...allRoutes.map(route => route.display_order));
    if (routeToMove.display_order === minOrder) {
      console.log('⚠️ Tuyến đã ở vị trí đầu tiên, không cần di chuyển.');
      return allRoutes.map(route => ({
        id: route.id,
        name: route.name,
        shorten_name: route.shorten_name,
        base_price: route.base_price,
        status: route.status,
        note: route.note,
        created_at: route.created_at.toISOString(),
      }));
    }
  
    // 4. Tìm tuyến liền kề phía trên (có display_order nhỏ hơn gần nhất)
    const previousRoute = allRoutes
      .filter(route => route.display_order < routeToMove.display_order)
      .reduce((prev, current) => (current.display_order > prev.display_order ? current : prev));
  
    // 5. Hoán đổi display_order
    const tempOrder = routeToMove.display_order;
    routeToMove.display_order = previousRoute.display_order;
    previousRoute.display_order = tempOrder;
  
    // 6. Lưu thay đổi
    await this.routeRepository.save([routeToMove, previousRoute]);
  
    // 7. Lấy danh sách đã cập nhật
    allRoutes = await this.routeRepository.find({
      where: { company: { id: routeToMove.company.id } },
      order: { display_order: 'ASC' },
    });
  
    console.log('📋 Danh sách sau khi di chuyển:', allRoutes.map(r => ({ id: r.id, display_order: r.display_order })));
  
    return allRoutes.map(route => ({
      id: route.id,
      name: route.name,
      shorten_name: route.shorten_name,
      base_price: route.base_price,
      status: route.status,
      note: route.note,
      created_at: route.created_at.toISOString(),
    }));
  }
  
}
