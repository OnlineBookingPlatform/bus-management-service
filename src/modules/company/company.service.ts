import { Injectable } from '@nestjs/common';
import { Company } from './company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DTO_RP_Company, DTO_RQ_Company } from './company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async createCompany(company: DTO_RQ_Company): Promise<DTO_RP_Company> {
    console.log('Received Data: ', JSON.stringify(company, null, 2));
    try {
      // Xoá `created_at` nếu tồn tại để tránh lỗi
      if ('created_at' in company) {
        delete company.created_at;
      }
      const newCompany = await this.companyRepository.save(company);
      if (!newCompany) throw new Error('Không thể lưu dữ liệu!');
      return {
        id: newCompany.id,
        name: newCompany.name,
        phone: newCompany.phone,
        address: newCompany.address,
        tax_code: newCompany.tax_code,
        status: newCompany.status,
        url_logo: newCompany.url_logo,
        code: newCompany.code,
        note: newCompany.note,
        created_at: newCompany.created_at.toISOString(),
      };
    } catch (error) {
      console.error('Lỗi khi tạo công ty:', error);
      throw new Error('Lưu dữ liệu thất bại!');
    }
  }

  async getAllCompanies(): Promise<DTO_RP_Company[]> {
    const companies = await this.companyRepository.find();
    const companiesMapped = companies.map((company) => ({
      id: company.id,
      name: company.name,
      phone: company.phone,
      address: company.address,
      tax_code: company.tax_code,
      status: company.status,
      url_logo: company.url_logo,
      code: company.code,
      note: company.note,
      created_at: company.created_at.toISOString(),
    }));
    return companiesMapped;
  }

  async updateCompany(companyData: DTO_RQ_Company): Promise<DTO_RP_Company> {
    console.log('Received Data: ', companyData);
    // 1. Kiểm tra xem công ty có tồn tại không
    const existingCompany = await this.companyRepository.findOne({
      where: { id: companyData.id },
    });
    if (!existingCompany) {
      throw new Error(`Không tìm thấy công ty với ID: ${companyData.id}`);
    }

    // 2. Cập nhật dữ liệu
    await this.companyRepository.update(companyData.id, {
      name: companyData.name,
      phone: companyData.phone,
      address: companyData.address,
      tax_code: companyData.tax_code,
      status: companyData.status,
      url_logo: companyData.url_logo,
      code: companyData.code,
      note: companyData.note,
    });

    // 3. Lấy dữ liệu sau khi cập nhật
    const updatedCompany = await this.companyRepository.findOne({
      where: { id: companyData.id },
    });

    return {
      id: updatedCompany.id,
      name: updatedCompany.name,
      phone: updatedCompany.phone,
      address: updatedCompany.address,
      tax_code: updatedCompany.tax_code,
      status: updatedCompany.status,
      url_logo: updatedCompany.url_logo,
      code: updatedCompany.code,
      note: updatedCompany.note,
      created_at: updatedCompany.created_at.toISOString(),
    };
  }

  async deleteCompany(id: number): Promise<void> {
    console.log('Received Data:', id);
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new Error(`Company with ID ${id} not found`);
    }
    await this.companyRepository.delete(id);
  }

  async lockCompany(id: number): Promise<DTO_RP_Company> {
    console.log('Received Data: ', id);
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      return null;
    }

    company.status = false;
    await this.companyRepository.save(company);

    return {
      id: company.id,
      name: company.name,
      phone: company.phone,
      address: company.address,
      tax_code: company.tax_code,
      status: company.status,
      url_logo: company.url_logo,
      code: company.code,
      note: company.note,
      created_at: company.created_at.toISOString(),
    };
  }
  async unlockCompany(id: number): Promise<DTO_RP_Company> {
    console.log('Received Data: ', id);
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      return null;
    }

    company.status = true;
    await this.companyRepository.save(company);

    return {
      id: company.id,
      name: company.name,
      phone: company.phone,
      address: company.address,
      tax_code: company.tax_code,
      status: company.status,
      url_logo: company.url_logo,
      code: company.code,
      note: company.note,
      created_at: company.created_at.toISOString(),
    };
  }
}
