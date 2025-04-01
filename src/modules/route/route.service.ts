import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Company } from '../company/company.entity';
import { DTO_RP_Route, DTO_RQ_Route } from './route.dto';
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
      console.log('1. Received data:', JSON.stringify(route, null, 2));
  
      // Validate input
      if (!route.company_id || !route.name) {
        console.log('2. Validation failed - missing required fields');
        throw new HttpException(
          'Thiếu thông tin bắt buộc (company_id hoặc name)',
          HttpStatus.BAD_REQUEST,
        );
      }
  
      console.log('3. Checking company exists...');
      const existingCompany = await this.companyRepository.findOne({
        where: { id: route.company_id },
      });
      console.log('4. Company found:', existingCompany);
  
      if (!existingCompany) {
        console.log('5. Company not found');
        throw new HttpException(
          'Dữ liệu công ty không tồn tại!',
          HttpStatus.NOT_FOUND,
        );
      }
  
      console.log('6. Checking duplicate route...');
      const existingRoute = await this.routeRepository.findOne({
        where: {
          name: route.name,
          company_id: route.company_id 
        }
      });
      console.log('7. Existing route:', existingRoute);
  
      if (existingRoute) {
        console.log('8. Duplicate route found');
        throw new HttpException(
          `${route.name} đã tồn tại trong công ty!`,
          HttpStatus.BAD_REQUEST,
        );
      }
  
      console.log('9. Creating new route...');
      const newRoute = this.routeRepository.create({
        ...route,
        company: existingCompany,
      });
      console.log('10. New route object:', newRoute);
  
      console.log('11. Saving to database...');
      const savedRoute = await this.routeRepository.save(newRoute);
      console.log('12. Saved route:', savedRoute);
  
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
      console.error('13. Error occurred:', error);
      throw error;
    }
  }

  async updateRoute(
    id: number,
    data: DTO_RQ_Route,
  ): Promise<DTO_RP_Route> {
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
}
