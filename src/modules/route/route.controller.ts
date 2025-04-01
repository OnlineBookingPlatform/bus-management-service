import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { RouteService } from './route.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleError } from 'src/utils/error-handler';
import { DTO_RP_Route, DTO_RQ_Route } from './route.dto';
import { ApiResponse } from 'src/utils/api-response';

@Controller()
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @MessagePattern('create_route')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createRoute(@Payload() data: DTO_RQ_Route): Promise<ApiResponse<DTO_RP_Route>> {
    try {
        console.log('Received data:', data);
      const response = await this.routeService.createRoute(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

    @MessagePattern('update_route')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async updateRoute(
      @Payload() data: { id: number; data: DTO_RQ_Route },
    ): Promise<ApiResponse<DTO_RP_Route>> {
      try {
        const response = await this.routeService.updateRoute(data.id, data.data);
        return ApiResponse.success(response);
      } catch (error) {
        return handleError(error);
      }
    }

    // @MessagePattern('delete_route')
    // async deleteRoute(@Payload() id: number): Promise<ApiResponse<void>> {
    //   try {
    //     const response = await this.routeService.deleteRoute(id);
    //     return ApiResponse.success(response);
    //   } catch (error) {
    //     return handleError(error);
    //   }
    // }

  @MessagePattern('get_route_by_company')
  async getRouteByCompanyId(
    @Payload() id: number,
  ): Promise<ApiResponse<DTO_RP_Route[]>> {
    try {
      const response = await this.routeService.getRouteByCompanyId(id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  //   @MessagePattern('get_route_name_by_company')
  //   async getRouteNameByCompanyId(
  //     @Payload() id: number,
  //   ): Promise<ApiResponse<DTO_RP_Route[]>> {
  //     try {
  //       const response = await this.routeService.getRouteNameByCompanyId(id);
  //       return ApiResponse.success(response);
  //     } catch (error) {
  //       return handleError(error);
  //     }
  //   }
}
