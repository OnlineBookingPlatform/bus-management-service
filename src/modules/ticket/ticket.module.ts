import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TripModule } from '../trip/trip.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    forwardRef(() => TripModule),
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService, TypeOrmModule],
})
export class TicketModule {}
