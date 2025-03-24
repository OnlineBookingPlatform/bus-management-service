import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Office } from './office.entity';
import { OfficeController } from './office.controller';
import { OfficeService } from './office.service';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [TypeOrmModule.forFeature([Office]), CompanyModule],
  controllers: [OfficeController],
  providers: [OfficeService],
})
export class OfficeModule {}
