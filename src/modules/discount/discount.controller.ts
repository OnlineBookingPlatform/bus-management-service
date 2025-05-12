import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiResponse } from 'src/utils/api-response';
import { DTO_RP_Discount, DTO_RQ_Discount } from './discount.dto';
import { handleError } from 'src/utils/error-handler';

@Controller()
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

     @MessagePattern('get_discounts_by_company')
      async getDiscountsByCompany(
        @Payload() id: number,
      ): Promise<ApiResponse<DTO_RP_Discount[]>> {
        try {
          const discounts = await this.discountService.getDiscountsByCompany(id);
          return ApiResponse.success(discounts);
        } catch (error) {
          return handleError(error);
        }
      }
}