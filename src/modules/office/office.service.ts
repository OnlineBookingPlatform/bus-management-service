import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Office } from './office.entity';
import { DTO_RP_Office, DTO_RP_OfficeName, DTO_RQ_Office } from './office.dto';
import { Company } from '../company/company.entity';

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  // Tạo văn phòng mới
  async createOffice(office: DTO_RQ_Office): Promise<DTO_RP_Office> {
    // console.log('Received Data Office from client: ', office);
    const existingCompany = await this.companyRepository.findOne({
      where: { id: office.company_id },
    });
    if (!existingCompany) {
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    // console.log('Existing Company:', existingCompany);
    // console.log('Company ID:', office.company_id);
    // console.log('Office Name:', office.name);
    const existingOffice = await this.officeRepository.findOne({
      where: {
        name: office.name,
        company: { id: office.company_id },
      },
    });
    // console.log('Existing Office:', existingOffice);
    if (existingOffice) {
      throw new HttpException(
        `${office.name} đã tồn tại trong công ty!`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const newOffice = this.officeRepository.create({
      ...office,
      company: existingCompany,
    });
    const savedOffice = await this.officeRepository.save(newOffice);
    // console.log('Saved Office:', savedOffice);
    return {
      id: savedOffice.id,
      name: savedOffice.name,
      code: savedOffice.code,
      phone_ticket: savedOffice.phone_ticket,
      phone_goods: savedOffice.phone_goods,
      address: savedOffice.address,
      note: savedOffice.note,
      type_ticket: savedOffice.type_ticket,
      type_goods: savedOffice.type_goods,
      created_at: savedOffice.created_at.toISOString(),
    };
  }

  // Lấy danh sách văn phòng theo công ty
  async getOfficesByCompany(id: number): Promise<DTO_RP_Office[]> {
    console.log('Received Company ID from client: ', id);
    const existingCompany = await this.companyRepository.findOne({
      where: { id: id },
    });

    if (!existingCompany) {
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const offices = await this.officeRepository.find({
      where: { company: { id } },
    });

    console.log(offices);

    if (!offices || offices.length === 0) {
      return [];
    }

    const mappedOffices = offices.map((office) => {
      console.log('Mapping office:', office);
      return {
        id: office.id,
        name: office.name,
        code: office.code,
        phone_ticket: office.phone_ticket,
        phone_goods: office.phone_goods,
        address: office.address,
        note: office.note,
        type_ticket: office.type_ticket,
        type_goods: office.type_goods,
        company: { id: office.id },
        created_at: office.created_at ? office.created_at.toISOString() : null,
      };
    });
    return mappedOffices;
  }

  async getOfficeNameByCompany(
    companyId: number,
  ): Promise<DTO_RP_OfficeName[]> {
    console.log('Received Company ID from client: ', companyId);
    const existingCompany = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    console.log('Existing Company:', existingCompany);

    if (!existingCompany) {
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const offices = await this.officeRepository.find({
      where: { company: { id: companyId } },
    });
    console.log(offices);

    const mappedOffices = offices.map((office) => {
      return {
        id: office.id,
        name: office.name,
      };
    });
    return mappedOffices;
  }

  // Cập nhật thông tin văn phòng
  async updateOffice(
    id: number,
    office: DTO_RQ_Office,
  ): Promise<DTO_RP_Office> {
    console.log('Received Data Office from client: ', office);

    const existingOffice = await this.officeRepository.findOne({
      where: { id },
    });
    console.log('Existing Office:', existingOffice);

    if (!existingOffice) {
      throw new HttpException(
        'Dữ liệu văn phòng không tồn tại!',
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedOffice = {
      ...existingOffice,
      ...office,
      created_at: existingOffice.created_at,
    };

    const savedOffice = await this.officeRepository.save(updatedOffice);
    console.log('Saved Office:', savedOffice);

    return {
      id: savedOffice.id,
      name: savedOffice.name,
      code: savedOffice.code,
      phone_ticket: savedOffice.phone_ticket,
      phone_goods: savedOffice.phone_goods,
      address: savedOffice.address,
      note: savedOffice.note,
      type_ticket: savedOffice.type_ticket,
      type_goods: savedOffice.type_goods,
      created_at: savedOffice.created_at.toISOString(),
    };
  }

  // Xóa văn phòng
  async deleteOffice(id: number): Promise<void> {
    console.log('Received Data Office ID from client: ', id);
    const existingOffice = await this.officeRepository.findOne({
      where: { id },
    });

    if (!existingOffice) {
      throw new HttpException(
        'Dữ liệu văn phòng không tồn tại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.officeRepository.delete({ id });
  }
}
