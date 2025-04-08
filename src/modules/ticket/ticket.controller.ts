import { Controller } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { MessagePattern } from '@nestjs/microservices';
import { handleError } from 'src/utils/error-handler';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RP_Ticket } from '../trip/trip.dto';

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
}
