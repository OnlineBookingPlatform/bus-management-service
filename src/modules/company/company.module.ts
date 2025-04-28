import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { RedisService } from 'src/config/redis.service';
import { Policy } from './policy.entity';
import { RegisterSaleTicket } from './register_sale_ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Policy, RegisterSaleTicket]), ],
  controllers: [CompanyController],
  providers: [CompanyService, RedisService],
  exports: [CompanyService, TypeOrmModule],
})
export class CompanyModule {}
