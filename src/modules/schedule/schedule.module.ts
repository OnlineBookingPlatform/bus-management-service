import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from '../company/company.module';
import { RouteModule } from '../route/route.module';
import { Schedule } from './schedule.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { SeatModule } from '../seat/seat.module';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule]), CompanyModule, RouteModule, SeatModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService, TypeOrmModule],
})
export class ScheduleModule {}
