import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './policy.entity';
import { PolicyController } from './policy.controller';
import { PolicyService } from './policy.service';
import { Module } from '@nestjs/common';
import { Company } from '../company/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Policy, Company])],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [PolicyService, TypeOrmModule],
})
export class PolicyModule {}
