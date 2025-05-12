import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './discount.entity';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [TypeOrmModule.forFeature([Discount]), CompanyModule],
  controllers: [DiscountController],
  providers: [DiscountService],
})
export class DiscountModule {}
