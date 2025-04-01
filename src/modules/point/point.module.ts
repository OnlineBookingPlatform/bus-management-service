import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Point } from './point.entity';
import { CompanyModule } from '../company/company.module';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [TypeOrmModule.forFeature([Point]), CompanyModule, LocationModule], 
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
