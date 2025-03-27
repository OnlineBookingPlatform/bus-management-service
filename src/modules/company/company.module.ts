import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { RedisService } from 'src/config/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company]), ],
  controllers: [CompanyController],
  providers: [CompanyService, RedisService],
  exports: [CompanyService, TypeOrmModule],
})
export class CompanyModule {}
