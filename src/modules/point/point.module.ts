import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Point } from './point.entity';
import { CompanyModule } from '../company/company.module';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { LocationModule } from '../location/location.module';
import { RouteModule } from '../route/route.module';
import { PointOfRoute } from './point_of_route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Point, PointOfRoute]), CompanyModule, LocationModule, RouteModule], 
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
