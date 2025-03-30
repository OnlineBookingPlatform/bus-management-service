import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiResponse } from 'src/utils/api-response';
import { handleError } from 'src/utils/error-handler';
import { DTO_RP_Vehicle, DTO_RQ_Vehicle } from './vehicle.dto';

@Controller()
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @MessagePattern('create_vehicle')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createVehicle(
    @Payload() data: DTO_RQ_Vehicle,
  ): Promise<ApiResponse<DTO_RP_Vehicle>> {
    try {
      const vehicle = await this.vehicleService.createVehicle(data);
      return ApiResponse.success(vehicle);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_vehicle_by_company')
  async getVehicleByCompany(
    @Payload() id: number,
  ): Promise<ApiResponse<DTO_RP_Vehicle[]>> {
    try {
      const vehicles = await this.vehicleService.getVehicleByCompany(id);
      return ApiResponse.success(vehicles);
    } catch (error) {
      return handleError(error);
    }
  }
  @MessagePattern('delete_vehicle')
  async deleteVehicle(
    @Payload() id: number,
  ): Promise<ApiResponse<void>> {
    try {
      const vehicle = await this.vehicleService.deleteVehicle(id);
      return ApiResponse.success(vehicle);
    } catch (error) {
      return handleError(error);
    }
  }
  @MessagePattern('update_vehicle')
  async updateVehicle(
    @Payload() data: { id: number; data: DTO_RQ_Vehicle },
  ): Promise<ApiResponse<DTO_RP_Vehicle>> {
    try {
      console.log('data', data);
      const vehicle = await this.vehicleService.updateVehicle(data);
      return ApiResponse.success(vehicle);
    } catch (error) {
      return handleError(error);
    }
  }
}
