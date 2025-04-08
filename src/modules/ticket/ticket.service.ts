import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { Repository } from 'typeorm';
import { DTO_RP_Ticket } from '../trip/trip.dto';
import { Trip } from '../trip/trip.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  async getTicketByTrip(id: number): Promise<DTO_RP_Ticket[]> {
    console.log('getTicketByTrip', id);
    const trip = await this.tripRepository.findOne({ where: { id: id } });
    if (!trip) {
      throw new HttpException(
        'Dữ liệu chuyến không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }
    const tickets = await this.ticketRepository.find({
      where: { trip: { id: id } },
      relations: ['trip'],
    });
    const result: DTO_RP_Ticket[] = tickets.map((ticket) => ({
      id: ticket.id,
      seat_name: ticket.seat_name,
      seat_code: ticket.seat_code,
      seat_floor: ticket.seat_floor,
      seat_row: ticket.seat_row,
      seat_column: ticket.seat_column,
      seat_status: ticket.seat_status,
      status_booking_ticket: ticket.status_booking_ticket,
      base_price: ticket.base_price,
    }));
    console.log('result:', result);
    return result;
  }
}
