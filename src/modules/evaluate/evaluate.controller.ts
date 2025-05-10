import { Controller } from "@nestjs/common";
import { EvaluateService } from "./evaluate.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { DTO_RP_Evaluate, DTO_RQ_Evaluate } from "./evaluate.dto";
import { ApiResponse } from "src/utils/api-response";

@Controller()
export class EvaluateController {
  constructor(private readonly evaluateService: EvaluateService) {}

  @MessagePattern('create_evaluate')
  async createEvaluate(@Payload() data: DTO_RQ_Evaluate): Promise<ApiResponse<DTO_RP_Evaluate>> {
    try {
      const response = await this.evaluateService.createEvaluate(data);
      return ApiResponse.success(response);
    } catch (error) {
      return ApiResponse.error(error);
    }
  }
}