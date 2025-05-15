import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterestTicket } from './interest-ticket.entity';
import { 
  DTO_RQ_CreateInterestTicket, 
  DTO_RP_InterestTicket, 
  DTO_RQ_DeleteInterestTicket 
} from './interest-ticket.dto';
import { TicketService } from '../ticket/ticket.service';
import { DTO_RQ_UpdateTicketOnPlatform } from '../ticket/ticket.dto';

@Injectable()
export class InterestTicketService {
  constructor(
    @InjectRepository(InterestTicket)
    private readonly interestTicketRepository: Repository<InterestTicket>,
    @Inject(forwardRef(() => TicketService))
    private readonly ticketService: TicketService,
  ) {}

  /**
   * Find interest tickets by ticket ID
   */
  async findByTicketId(ticketId: number): Promise<InterestTicket[]> {
    try {
      const interestTickets = await this.interestTicketRepository.find({
        where: { ticket_id: ticketId },
      });
      console.log(`✅ Found ${interestTickets.length} interest tickets for ticket ID ${ticketId}`);
      return interestTickets;
    } catch (error) {
      console.error(`❌ Failed to find interest tickets for ticket ID ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new interest ticket
   */
  async create(data: DTO_RQ_CreateInterestTicket): Promise<DTO_RP_InterestTicket> {
    try {
      // Create new interest ticket entity
      const interestTicket = this.interestTicketRepository.create({
        ticket_id: data.ticket_id,
        account_id: data.account_id,
        passenger_name: data.passenger_name,
        passenger_phone: data.passenger_phone,
        passenger_email: data.passenger_email,
        point_up: data.point_up || '',
        point_down: data.point_down || '',
        note: data.ticket_note || '',
        gender: data.gender || 0,
      });

      // Save to database
      const savedInterestTicket = await this.interestTicketRepository.save(interestTicket);
      
      console.log(`✅ Created interest ticket with ID: ${savedInterestTicket.id}`);

      return {
        id: savedInterestTicket.id,
        ticket_id: savedInterestTicket.ticket_id,
        account_id: savedInterestTicket.account_id,
        passenger_name: savedInterestTicket.passenger_name,
        passenger_phone: savedInterestTicket.passenger_phone,
        passenger_email: savedInterestTicket.passenger_email,
        point_up: savedInterestTicket.point_up,
        point_down: savedInterestTicket.point_down,
        ticket_note: savedInterestTicket.note,
        gender: savedInterestTicket.gender,
      };
    } catch (error) {
      console.error('❌ Failed to create interest ticket:', error);
      throw new HttpException(
        'Failed to create interest ticket',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete an interest ticket by ID
   */
  async delete(data: DTO_RQ_DeleteInterestTicket): Promise<void> {
    try {
      const interestTicket = await this.interestTicketRepository.findOne({
        where: { id: data.id },
      });

      if (!interestTicket) {
        throw new HttpException(
          'Interest ticket not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.interestTicketRepository.remove(interestTicket);
      console.log(`✅ Deleted interest ticket with ID: ${data.id}`);
    } catch (error) {
      console.error(`❌ Failed to delete interest ticket: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a ticket using data from an interest ticket
   */
  async updateTicketFromInterest(interestTicketId: string): Promise<void> {
    try {
      // Find the interest ticket
      const interestTicket = await this.interestTicketRepository.findOne({
        where: { id: interestTicketId },
      });

      if (!interestTicket) {
        throw new HttpException(
          'Interest ticket not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Create update data for ticket
      const updateData: any[] = [
        {
          id: interestTicket.ticket_id,
          passenger_name: interestTicket.passenger_name,
          passenger_phone: interestTicket.passenger_phone,
          point_up: interestTicket.point_up,
          point_down: interestTicket.point_down,
          ticket_note: interestTicket.note,
          email: interestTicket.passenger_email,
          gender: interestTicket.gender,
          creator_by_id: interestTicket.account_id,
          passenger_id: interestTicket.account_id,
        },
      ];

      // Update the ticket using the ticket service
      await this.ticketService.updateTicketOnPlatform(updateData);
      console.log(`✅ Updated ticket ${interestTicket.ticket_id} with interest ticket data`);

      // Delete the interest ticket after successful update
      await this.interestTicketRepository.remove(interestTicket);
      console.log(`✅ Interest ticket ${interestTicketId} removed after successful update`);
    } catch (error) {
      console.error(`❌ Failed to update ticket from interest: ${error.message}`);
      throw error;
    }
  }
} 