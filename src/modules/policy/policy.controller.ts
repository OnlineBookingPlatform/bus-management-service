import { Controller } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { handleError } from 'src/utils/error-handler';
import { ApiResponse } from 'src/utils/api-response';

@Controller()
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @MessagePattern('create_policy')
  async createPolicy(@Payload() data: { id: number; content: string }) {
    console.log(data.id);
    const result = await this.policyService
      .createPolicy(data.id, data.content)
      .catch((error) => handleError(error));

    return ApiResponse.success(result);
  }

  @MessagePattern('update_policy')
  async updatePolicy(@Payload() data: { id: number; content: string }) {
    return await this.policyService
      .updatePolicy(data.id, data.content)
      .then((result) => ApiResponse.success(result))
      .catch((error) => handleError(error));
  }
}
