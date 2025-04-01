import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from '../company/company.module';
import { Module } from '@nestjs/common';
import { SeatMap } from './seat_map.entity';
import { Seat } from './seat.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SeatMap, Seat]), CompanyModule],
    controllers: [SeatController],
    providers: [SeatService],
    exports: [SeatService, TypeOrmModule],
  })
  export class SeatModule {}
  
