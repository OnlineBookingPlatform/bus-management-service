import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleError } from 'src/utils/error-handler';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RP_Schedule, DTO_RQ_Schedule } from './schedule.dto';

@Controller()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @MessagePattern('create_schedule')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createSchedule(
    @Payload() data: DTO_RQ_Schedule,
  ): Promise<ApiResponse<DTO_RP_Schedule>> {
    try {
      console.log('Received Data Schedule from client: ', data);
      const schedule = await this.scheduleService.createSchedule(data);
      return ApiResponse.success(schedule);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_schedule_by_company')
  async getScheduleByCompany(
    @Payload() id: number,
  ): Promise<ApiResponse<DTO_RP_Schedule[]>> {
    try {
      const schedule = await this.scheduleService.getScheduleByCompany(id);
      return ApiResponse.success(schedule);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('delete_schedule')
  async deleteSchedule(@Payload() id: number): Promise<ApiResponse<void>> {
    try {
      const schedule = await this.scheduleService.deleteSchedule(id);
      return ApiResponse.success(schedule);
    } catch (error) {
      return handleError(error);
    }
  }
  @MessagePattern('update_schedule')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateSchedule(
    @Payload() data: { id: number; data: DTO_RQ_Schedule },
  ): Promise<ApiResponse<DTO_RP_Schedule>> {
    try {
      const schedule = await this.scheduleService.updateSchedule(
        data.id,
        data.data,
      );
      return ApiResponse.success(schedule);
    } catch (error) {
      return handleError(error);
    }
  }
}
