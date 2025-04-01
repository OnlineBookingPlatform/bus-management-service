import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from './provinces.entity';
import { District } from './districts.entity';
import { Ward } from './wards.entity';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
  imports: [TypeOrmModule.forFeature([Province, District, Ward])],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [TypeOrmModule, LocationService],
})
export class LocationModule {}
