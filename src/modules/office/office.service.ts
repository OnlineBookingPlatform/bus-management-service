import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Office } from './office.entity';
import { DTO_RP_Office, DTO_RQ_Office } from './office.dto';

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
  ) {}

  async createOffice(office: DTO_RQ_Office): Promise<DTO_RP_Office> {
    console.log('Received Data: ', office);
    try {
      const existingOffice = await this.officeRepository.findOne({
        where: { name: office.name },
      });

      if (existingOffice) {
        throw new HttpException(
          'Tên văn phòng đã tồn tại!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newOffice = await this.officeRepository.save(office);
      if (!newOffice) {
        throw new HttpException(
          'Không thể lưu dữ liệu!',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        id: newOffice.id,
        name: newOffice.name,
        code: newOffice.code,
        phoneTicket: newOffice.phoneTicket,
        phoneGoods: newOffice.phoneGoods,
        address: newOffice.address,
        note: newOffice.note,
        typeTicket: newOffice.typeTicket,
        typeGoods: newOffice.typeGoods,
        created_at: newOffice.created_at.toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Lưu dữ liệu thất bại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
