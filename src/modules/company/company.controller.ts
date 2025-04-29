import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { CompanyService } from './company.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DTO_RP_Company, DTO_RP_RegisterSaleTicketOnPlatform, DTO_RQ_Company, DTO_RQ_RegisterSaleTicketOnPlatform } from './company.dto';
import { ApiResponse } from 'src/utils/api-response';
import { handleError } from 'src/utils/error-handler';

@Controller()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @MessagePattern('create_company')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createCompany(
    @Payload() data: DTO_RQ_Company,
  ): Promise<ApiResponse<DTO_RP_Company>> {
    try {
      const companies = await this.companyService.createCompany(data);
      return ApiResponse.success(companies);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_all_companies')
  async getAllCompanies(): Promise<ApiResponse<DTO_RP_Company[]>> {
    try {
      const companies = await this.companyService.getAllCompanies();
      return ApiResponse.success(companies);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('update_company')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateCompany(
    @Payload() data: {id: number, data: DTO_RQ_Company},
  ): Promise<ApiResponse<DTO_RP_Company>> {
    try {
      console.log('Received Data ID: ', data.id);
      console.log('Received Data Company: ', data.data);
      const companies = await this.companyService.updateCompany(data.id, data.data);
      return ApiResponse.success(companies);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('delete_company')
  async deleteCompany(
    @Payload() data: number ,
  ): Promise<ApiResponse<void>> {
    try {
      await this.companyService.deleteCompany(data);
      return ApiResponse.success(null);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('lock_company')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async lockCompany(
    @Payload() data: number,
  ): Promise<ApiResponse<DTO_RP_Company>> {
    try {
      const company = await this.companyService.lockCompany(data);
      return ApiResponse.success(company);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('unlock_company')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async unlockCompany(
    @Payload() data: number,
  ): Promise<ApiResponse<DTO_RP_Company>> {
    try {
      const company = await this.companyService.unlockCompany(data);
      return ApiResponse.success(company);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('create_policy')
  async createPolicy(
    @Payload() data: { id: number; data: any },
  ): Promise<ApiResponse<any>> {
    try {
      console.log('Received Data ID: ', data.id);
      console.log('Received Data Policy: ', data.data);
      const response = await this.companyService.createPolicy(
        data.id,
        data.data,
      );
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_policy')
  async getPolicy(
    @Payload() data: number,
  ): Promise<ApiResponse<any>> {
    try {
      const response = await this.companyService.getPolicy(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  // Đăng ký vé trên nền tảng
  @MessagePattern('register_sale_ticket_on_platform')
  async registerSaleTicketOnPlatform(
    @Payload() data: DTO_RQ_RegisterSaleTicketOnPlatform,
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.companyService.registerSaleTicketOnPlatform(data);
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }

  // Lấy dánh sach yêu cầu đăng ký mở bán vé trên nền tảng
  @MessagePattern('get_sale_ticket_on_platform')
  async getSaleTicketOnPlatform(): Promise<ApiResponse<DTO_RP_RegisterSaleTicketOnPlatform[]>>{
    try {
      const response = await this.companyService.getSaleTicketOnPlatform();
      return ApiResponse.success(response);
    } catch (error) {
      return handleError(error);
    }
  }
}
