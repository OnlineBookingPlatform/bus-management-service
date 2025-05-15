import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './discount.entity';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { CompanyModule } from '../company/company.module';
import { TicketModule } from './../ticket/ticket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Discount]), CompanyModule,TicketModule],
  controllers: [DiscountController],
  providers: [DiscountService],
})
export class DiscountModule {}
