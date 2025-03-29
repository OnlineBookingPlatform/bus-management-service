import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { OfficeService } from './office.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RP_Office, DTO_RP_OfficeName, DTO_RQ_Office } from './office.dto';
import { handleError } from 'src/utils/error-handler';

@Controller()
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @MessagePattern('create_office')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createOffice(
    @Payload() data: DTO_RQ_Office,
  ): Promise<ApiResponse<DTO_RP_Office>> {
    try {
      const office = await this.officeService.createOffice(data);
      return ApiResponse.success(office);
    } catch (error) {
      return handleError(error);
    }
  }
  @MessagePattern('get_offices_by_company')
  async getOfficesByCompany(
    @Payload() id: number,
  ): Promise<ApiResponse<DTO_RP_Office[]>> {
    try {
      const offices = await this.officeService.getOfficesByCompany(id);
      return ApiResponse.success(offices);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('get_office_name_by_company')
  async getOfficeNameByCompany(
    @Payload() companyId: number,
  ): Promise<ApiResponse<DTO_RP_OfficeName[]>> {
    try {
      const officeName =
        await this.officeService.getOfficeNameByCompany(companyId);
      return ApiResponse.success(officeName);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('update_office')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateOffice(
    @Payload() data: { id: number; data: DTO_RQ_Office },
  ): Promise<ApiResponse<DTO_RP_Office>> {
    try {
      const office = await this.officeService.updateOffice(data.id, data.data);
      return ApiResponse.success(office);
    } catch (error) {
      return handleError(error);
    }
  }

  @MessagePattern('delete_office')
  async deleteOffice(
    @Payload() id: number,
  ): Promise<ApiResponse<void>> {
    try {
      const office = await this.officeService.deleteOffice(id);
      return ApiResponse.success(office);
    } catch (error) {
      return handleError(error);
    }
  }
}
