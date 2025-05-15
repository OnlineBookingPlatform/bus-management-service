import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestTicket } from './interest-ticket.entity';
import { InterestTicketService } from './interest-ticket.service';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InterestTicket]),
    forwardRef(() => TicketModule),
  ],
  providers: [InterestTicketService],
  exports: [InterestTicketService, TypeOrmModule],
})
export class InterestTicketModule {} 