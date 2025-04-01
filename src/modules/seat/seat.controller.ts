import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { SeatService } from './seat.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DTO_RP_SeatMap, DTO_RP_SeatMapName, DTO_RQ_SeatMap } from './seat.dto';
import { ApiResponse } from 'src/utils/api-response';
import { handleError } from 'src/utils/error-handler';

@Controller()
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  // E7.UC01: Create Seating Chart
  @MessagePattern('create_seat_map')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createSeat(
    @Payload() data: DTO_RQ_SeatMap,
  ): Promise<ApiResponse<DTO_RP_SeatMap>> {
    try {
      const response = await this.seatService.createSeatMap(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_seat_map_by_company')
  async getSeatMapByCompanyId(
    @Payload() id: number,
  ): Promise<ApiResponse<DTO_RP_SeatMap[]>> {
    try {
      const response = await this.seatService.getSeatMapByCompanyId(id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('delete_seat_map')
  async deleteSeatMap(@Payload() id: number): Promise<ApiResponse<void>> {
    try {
      const response = await this.seatService.deleteSeatMap(id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('update_seat_map')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateSeatMap(
    @Payload() data: { id: number; data: DTO_RQ_SeatMap },
  ): Promise<ApiResponse<DTO_RP_SeatMap>> {
    try {
      const response = await this.seatService.updateSeatMap(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_seat_map_name_by_company')
  async getSeatMapNameByCompanyId(
    @Payload() id: number,
  ): Promise<ApiResponse<DTO_RP_SeatMapName[]>> {
    try {
      const response = await this.seatService.getSeatMapNameByCompanyId(id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
