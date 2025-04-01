import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DTO_RP_Point, DTO_RP_PointName, DTO_RQ_Point } from './point.dto';
import { ApiResponse } from 'src/utils/api-response';
import { handleError } from 'src/utils/error-handler';
import { PointService } from './point.service';

@Controller()
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @MessagePattern('create_point')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createPoint(
    @Payload() data: DTO_RQ_Point,
  ): Promise<ApiResponse<DTO_RP_Point>> {
    try {
      console.log('data', data);
      const point = await this.pointService.createPoint(data);
      return ApiResponse.success(point);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_points_by_company')
  async getPointsByCompany(
    @Payload() id: number,
  ): Promise<ApiResponse<DTO_RP_Point[]>> {
    try {
      const points = await this.pointService.getPointsByCompany(id);
      return ApiResponse.success(points);
    } catch (error) {
      return handleError(error);
    }
  }
  @MessagePattern('update_point')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updatePoint(
    @Payload() data: { id: number; data: DTO_RQ_Point },
  ): Promise<ApiResponse<DTO_RP_Point>> {
    try {
      console.log('data', data);
      const id = Number(data.id);
      const point = await this.pointService.updatePoint(id, data.data);
      return ApiResponse.success(point);
    } catch (error) {
      return handleError(error);
    }
  }
  @MessagePattern('delete_point')
  async deletePoint(@Payload() id: number): Promise<ApiResponse<void>> {
    try {
      const point = await this.pointService.deletePoint(id);
      return ApiResponse.success(point);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_point_name_by_company')
  async getPointNameByCompany(
    @Payload() id: number,
  ): Promise<ApiResponse<DTO_RP_PointName[]>> {
    try {
      const point = await this.pointService.getPointNameByCompany(id);
      return ApiResponse.success(point);
    } catch (error) {
      return handleError(error);
    }
  }
}
