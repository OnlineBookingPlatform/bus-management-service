import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './discount.entity';
import { DTO_RP_Discount, DTO_RQ_Discount } from './discount.dto';
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
    try {
      // Input validation
      if (!id || isNaN(id)) {
        console.error('[Validation Error] Invalid company ID:', id);
        throw new HttpException(
          'ID công ty không hợp lệ',
          HttpStatus.BAD_REQUEST,
        );
      }

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

      const discounts = await this.discountRepository.find({
        where: { company: { id } },
        relations: ['company'],
      });

      if (!discounts || discounts.length === 0) {
        console.log('[Info] No discounts found for company ID:', id);
        return [];
      }

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

  async createDiscount(discount: DTO_RQ_Discount): Promise<DTO_RP_Discount> {
    console.log('[1/5] Nhận dữ liệu từ client:', discount);

    const existingCompany = await this.companyRepository.findOne({
      where: { id: discount.company_id },
    });
    if (!existingCompany) {
      console.log('[2/5] Không tìm thấy công ty có ID:', discount.company_id);
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    console.log('[2/5] Tìm thấy công ty:', existingCompany);

    const existingDiscount = await this.discountRepository.findOne({
      where: {
        discount_code: discount.discount_code,
        company: { id: discount.company_id },
      },
    });
    if (existingDiscount) {
      console.log('[3/5] Mã giảm giá đã tồn tại trong công ty:', existingDiscount);
      throw new HttpException(
        `Code ${discount.discount_code} đã tồn tại trong công ty!`,
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('[3/5] Mã giảm giá chưa tồn tại, tiếp tục tạo');

    const newDiscount = this.discountRepository.create({
      ...discount,
      company: existingCompany,
    });
    console.log('[4/5] Đã tạo đối tượng discount chuẩn bị lưu:', newDiscount);

    const savedDiscount = await this.discountRepository.save(newDiscount);
    console.log('[5/5] Đã lưu discount vào DB:', savedDiscount);

    return {
      id: savedDiscount.id,
      discount_code: savedDiscount.discount_code,
      date_start: savedDiscount.date_start?.toISOString(),
      date_end: savedDiscount.date_end?.toISOString(),
      discount_value: savedDiscount.discount_value,
      discount_type: savedDiscount.discount_type,
      description: savedDiscount.description,
      number_of_uses: savedDiscount.number_of_uses,
      created_at: savedDiscount.created_at?.toISOString(),
    };
  }
}