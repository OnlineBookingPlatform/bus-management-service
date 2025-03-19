import { Controller, HttpStatus } from '@nestjs/common';
import { CompanyService } from './company.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DTO_RP_Company, DTO_RQ_Company } from './company.dto';
import { ApiResponse } from 'src/utils/api-response';

@Controller()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @MessagePattern('create_company')
  async createCompany(
    @Payload() data: DTO_RQ_Company,
  ): Promise<ApiResponse<DTO_RP_Company>> {
    try {
      const companies = await this.companyService.createCompany(data);
      return ApiResponse.success(companies);
    } catch (error) {
      return ApiResponse.error(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @MessagePattern('get_all_companies')
  async getAllCompanies(): Promise<ApiResponse<DTO_RP_Company[]>> {
    try {
      const companies = await this.companyService.getAllCompanies();
      return ApiResponse.success(companies);
    } catch (error) {
      return ApiResponse.error(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @MessagePattern('update_company')
  async updateCompany(
    @Payload() data: DTO_RQ_Company,
  ): Promise<ApiResponse<DTO_RP_Company>> {
    try {
      const companies = await this.companyService.updateCompany(data);
      return ApiResponse.success(companies);
    } catch (error) {
      return ApiResponse.error(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @MessagePattern('delete_company')
  async deleteCompany(
    @Payload() data: { id: number },
  ): Promise<ApiResponse<void>> {
    try {
      if (!data.id) {
        return ApiResponse.error('Company ID is required', 400);
      }

      await this.companyService.deleteCompany(data.id);
      return ApiResponse.success(null);
    } catch (error) {
      return ApiResponse.error(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @MessagePattern('lock_company')
  async lockCompany(
    @Payload() data: { id: number },
  ): Promise<ApiResponse<DTO_RP_Company>> {
    try {
      if (!data.id) {
        return ApiResponse.error('Company ID is required', 400);
      }

      const company = await this.companyService.lockCompany(data.id);
      if (!company) {
        return ApiResponse.error('Company not found', 404);
      }

      return ApiResponse.success(company);
    } catch (error) {
      return ApiResponse.error(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @MessagePattern('unlock_company')
  async unlockCompany(
    @Payload() data: { id: number },
  ): Promise<ApiResponse<DTO_RP_Company>> {
    try {
      if (!data.id) {
        return ApiResponse.error('Company ID is required', 400);
      }

      const company = await this.companyService.unlockCompany(data.id);
      if (!company) {
        return ApiResponse.error('Company not found', 404);
      }

      return ApiResponse.success(company);
    } catch (error) {
      return ApiResponse.error(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
