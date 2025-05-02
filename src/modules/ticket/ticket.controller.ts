import { Controller } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleError } from 'src/utils/error-handler';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RP_Ticket } from '../trip/trip.dto';
import { DTO_RP_TicketSearch, DTO_RQ_Ticket, DTO_RQ_TicketByPaymentService, DTO_RQ_TicketId, DTO_RQ_TicketSearch, DTO_RQ_UpdateTicketOnPlatform } from './ticket.dto';

@Controller()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @MessagePattern('get_ticket_by_trip')
  async getTicketByTrip(id: number): Promise<ApiResponse<DTO_RP_Ticket[]>> {
    try {
      const response = await this.ticketService.getTicketByTrip(id);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
  
  @MessagePattern('change_ticket_booked')
  async changeTicketBooked(
    @Payload() data: DTO_RQ_TicketId[]): Promise<ApiResponse<void>> {
    try {
      const response = await this.ticketService.changeTicketBooked(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
  
  @MessagePattern('change_ticket_available')
  async changeTicketAvailable(
    @Payload() data: DTO_RQ_TicketId[]): Promise<ApiResponse<void>> {
    try {
      const response = await this.ticketService.changeTicketAvailable(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('update_ticket_on_platform')
  async updateTicketOnPlatform(
    @Payload() data: DTO_RQ_UpdateTicketOnPlatform[]): Promise<ApiResponse<void>> {
    try {
      const response = await this.ticketService.updateTicketOnPlatform(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('update_ticket_info_on_bms')
  async updateTicketInfoOnBMS(
    @Payload() data: any): Promise<ApiResponse<void>> {
    try {
      const response = await this.ticketService.updateTicketInfoOnBMS(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('search_ticket_on_platform')
  async searchTicketOnPlatform(
    @Payload() data: DTO_RQ_TicketSearch): Promise<ApiResponse<DTO_RP_TicketSearch>> {
    try {
      const response = await this.ticketService.searchTicketOnPlatform(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('create_ticket_by_payment_service')
  async createTicketByPaymentService(
    @Payload() data: DTO_RQ_TicketByPaymentService): Promise<ApiResponse<any>> {
    try {
      const response = await this.ticketService.createTicketByPaymentService(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
  @MessagePattern('update_paid_ticket_amount')
  async updatePaidTicketAmount(
    @Payload() data: DTO_RQ_Ticket[]): Promise<ApiResponse<void>> {
    try {
      const response = await this.ticketService.updatePaidTicketAmount(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }


}
