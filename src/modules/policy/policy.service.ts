import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from './policy.entity';
import { Company } from '../company/company.entity';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async createPolicy(company_id: number, content: string): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id: company_id },
    });

    if (!company) {
      throw new HttpException(
        'Không tìm thấy dữ liệu công ty!',
        HttpStatus.NOT_FOUND,
      );
    }

    const existingPolicy = await this.policyRepository.findOne({
      where: { company: { id: company_id } },
    });

    if (existingPolicy) {
      existingPolicy.content = content;
      await this.policyRepository.save(existingPolicy);
    } else {
      const newPolicy = this.policyRepository.create({
        content,
        company: company,
      });

      await this.policyRepository.save(newPolicy);
    }
  }

  async updatePolicy(id: number, content: string): Promise<void> {
    await this.policyRepository.update(id, {
      content,
    });
  }
}
