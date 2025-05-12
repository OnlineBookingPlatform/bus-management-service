import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './discount.entity';
import { DTO_RP_Discount } from './discount.dto';
import { Company } from '../company/company.entity';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

async getDiscountsByCompany(id: number): Promise<DTO_RP_Discount[]> {
  console.log('[1/5] Starting getDiscountsByCompany - Received company ID:', id);

  try {
    // Input validation
    if (!id || isNaN(id)) {
      console.error('[Validation Error] Invalid company ID:', id);
      throw new HttpException(
        'ID công ty không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log('[2/5] Checking if company exists...');
    const existingCompany = await this.companyRepository.findOne({
      where: { id },
    });

    if (!existingCompany) {
      console.error('[Error] Company not found with ID:', id);
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }
    console.log('[Success] Company found:', existingCompany.id, existingCompany.name);

    console.log('[3/5] Fetching discounts for company ID:', id);
    const discounts = await this.discountRepository.find({
      where: { company: { id } },
      relations: ['company'],
    });

    console.log('[Debug] Raw discounts data from database:', discounts);

    if (!discounts || discounts.length === 0) {
      console.log('[Info] No discounts found for company ID:', id);
      return [];
    }
    console.log(`[Success] Found ${discounts.length} discount(s)`);

    console.log('[4/5] Mapping discounts to DTO format...');
    const mappedDiscounts = discounts.map((discount, index) => {
      console.log(`[Debug] Mapping discount ${index + 1}/${discounts.length}:`, {
        id: discount.id,
        code: discount.discount_code,
      });

      const result = {
        id: discount.id,
        discount_code: discount.discount_code,
        date_start: discount.date_start?.toISOString() ?? null,
        date_end: discount.date_end?.toISOString() ?? null,
        discount_value: discount.discount_value,
        discount_type: discount.discount_type,
        description: discount.description,
        number_of_uses: discount.number_of_uses,
        company_id: discount.company?.id ?? null,
        created_at: discount.created_at?.toISOString() ?? null,
      };

      console.log(`[Debug] Mapped discount ${index + 1}:`, result);
      return result;
    });

    console.log('[5/5] Successfully mapped all discounts');
    return mappedDiscounts;

  } catch (error) {
    console.error('[Exception] An error occurred in getDiscountsByCompany:', error);
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      'Đã xảy ra lỗi trong quá trình xử lý dữ liệu khuyến mãi.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

}