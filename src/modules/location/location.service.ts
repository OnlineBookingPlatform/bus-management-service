import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './provinces.entity';
import { District } from './districts.entity';
import { Ward } from './wards.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Province)
    private provinceRepo: Repository<Province>,
    @InjectRepository(District)
    private districtRepo: Repository<District>,
    @InjectRepository(Ward)
    private wardRepo: Repository<Ward>,
  ) {}

  private async fetchData(url: string) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching data from ${url}: ${error.message}`);
    }
  }

  async seedProvinces() {
    try {
      const data = await this.fetchData('https://provinces.open-api.vn/api/p/');
      
      const provinces = data.map(item => ({
        id: item.code,
        name: item.name,
        code: item.code,
      }));

      await this.provinceRepo.upsert(provinces, ['id']);

      return { success: true, count: provinces.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async seedDistricts() {
    try {
      const data = await this.fetchData('https://provinces.open-api.vn/api/d/');
      
      const districts = data.map(item => ({
        id: item.code,
        name: item.name,
        code: item.code,
        province: { id: item.province_code }, // Liên kết Province
      }));

      await this.districtRepo.upsert(districts, ['id']);

      return { success: true, count: districts.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async seedWards() {
    try {
      const data = await this.fetchData('https://provinces.open-api.vn/api/w/');
      
      const wards = data.map(item => ({
        id: item.code,
        name: item.name,
        code: item.code,
        district: { id: item.district_code }, // Liên kết District
      }));

      await this.wardRepo.upsert(wards, ['id']);

      return { success: true, count: wards.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async seedAll() {
    const provinces = await this.seedProvinces();
    if (!provinces.success) return provinces;

    const districts = await this.seedDistricts();
    if (!districts.success) return districts;

    const wards = await this.seedWards();
    if (!wards.success) return wards;

    return {
      success: true,
      provinces,
      districts,
      wards,
    };
  }


  async getProvinces() {
    return await this.provinceRepo.find({
      select: ['id', 'name', 'code'],
      order: { name: 'ASC' },
    });
  }


  async getDistrictsByProvince(provinceCode: number) {
    return await this.districtRepo.find({
      where: { province: { id: provinceCode } },
      select: ['id', 'name', 'code'],
      order: { name: 'ASC' },
    });
  }


  async getWardsByDistrict(districtCode: number) {
    return await this.wardRepo.find({
      where: { district: { id: districtCode } },
      select: ['id', 'name', 'code'],
      order: { name: 'ASC' },
    });
  }

}