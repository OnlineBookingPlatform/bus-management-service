import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { LocationService } from './location.service';
import { handleError } from 'src/utils/error-handler';
import { ApiResponse } from 'src/utils/api-response';

@Controller()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @MessagePattern('seed_provinces')
  async handleSeedProvinces() {
    console.log('Seeding provinces...');
    return this.locationService.seedProvinces();
  }

  @MessagePattern('seed_districts')
  async handleSeedDistricts() {
    return this.locationService.seedDistricts();
  }

  @MessagePattern('seed_wards')
  async handleSeedWards() {
    return this.locationService.seedWards();
  }

  @MessagePattern('seed_all')
  async handleSeedAll() {
    return this.locationService.seedAll();
  }

  @MessagePattern('get_provinces')
async getProvinces(): Promise<ApiResponse<any[]>> {
  try {
    const provinces = await this.locationService.getProvinces();
    return ApiResponse.success(provinces);  // Trả về dữ liệu tỉnh theo định dạng ApiResponse.success
  } catch (error) {
    return handleError(error);  // Xử lý lỗi (bạn cần implement handleError nếu chưa có)
  }
}

@MessagePattern('get_districts')
async getDistricts(data: { provinceCode: number }): Promise<ApiResponse<any[]>> {
  try {
    const districts = await this.locationService.getDistrictsByProvince(data.provinceCode);
    return ApiResponse.success(districts);  // Trả về dữ liệu huyện theo định dạng ApiResponse.success
  } catch (error) {
    return handleError(error);  // Xử lý lỗi
  }
}

@MessagePattern('get_wards')
async getWards(data: { districtCode: number }): Promise<ApiResponse<any[]>> {
  try {
    const wards = await this.locationService.getWardsByDistrict(data.districtCode);
    return ApiResponse.success(wards);  // Trả về dữ liệu xã theo định dạng ApiResponse.success
  } catch (error) {
    return handleError(error);  // Xử lý lỗi
  }
}

}