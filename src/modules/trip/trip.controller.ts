import { Controller } from '@nestjs/common';
import { TripService } from './trip.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleError } from 'src/utils/error-handler';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RP_ListTrip, DTO_RP_TripDetail } from './trip.dto';

@Controller()
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @MessagePattern('search_trip_on_platform')
  async searchTripOnPlatform(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.tripService.searchTripOnPlatform(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_trip_detail_on_platform')
  async getTripDetailOnPlatform(
    @Payload() id: number,
  ): Promise<ApiResponse<DTO_RP_TripDetail>> {
    try {
      const response = await this.tripService.getTripDetailOnPlatform(id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
  @MessagePattern('get_trips_by_date_and_route')
  async getTripsByDateAndRoute(
    @Payload() data: { date: string; company_id: number, route_id: number },
  ): Promise<ApiResponse<DTO_RP_ListTrip[]>> {
    try {
      const response = await this.tripService.getTripsByDateAndRoute(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
