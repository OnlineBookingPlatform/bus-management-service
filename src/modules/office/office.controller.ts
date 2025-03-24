import { Controller } from '@nestjs/common';
import { OfficeService } from './office.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RP_Office, DTO_RP_OfficeName, DTO_RQ_Office } from './office.dto';
import { handleError } from 'src/utils/error-handler';

@Controller()
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @MessagePattern('create_office')
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
  @MessagePattern('get_office_by_company')
  async getOfficesByCompany(
    @Payload() data: { companyId: number },
  ): Promise<ApiResponse<DTO_RP_Office[]>> {
    try {
      const offices = await this.officeService.getOfficesByCompany(
        data.companyId,
      );
      return ApiResponse.success(offices);
    } catch (error) {
      return handleError(error);
    }
  }

  // @MessagePattern('get_office_name_by_company')
  // async getOfficeNameByCompany(
  //   @Payload() data: { companyId: number },
  // ): Promise<ApiResponse<DTO_RP_OfficeName>> {
  //   try {
  //     const officeName = await this.officeService.getOfficeNameByCompany(
  //       data.companyId,
  //     );
  //     return ApiResponse.success(officeName);
  //   } catch (error) {
  //     return handleError(error);
  //   }
  // }
}
