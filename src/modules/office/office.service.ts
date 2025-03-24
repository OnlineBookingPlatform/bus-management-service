import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Office } from './office.entity';
import { DTO_RP_Office, DTO_RP_OfficeName, DTO_RQ_Office } from './office.dto';
import { Company } from '../company/company.entity';
import { ApiResponse } from 'src/utils/api-response';

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async createOffice(office: DTO_RQ_Office): Promise<DTO_RP_Office> {
    console.log('Received Data Office from client: ', office);
    const existingCompany = await this.companyRepository.findOne({
      where: { id: office.companyId },
    });

    if (!existingCompany) {
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const existingOffice = await this.officeRepository.findOne({
      where: {
        name: office.name,
        company: { id: office.companyId },
      },
      relations: ['company'],
    });

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

    return {
      id: savedOffice.id,
      name: savedOffice.name,
      code: savedOffice.code,
      phoneTicket: savedOffice.phoneTicket,
      phoneGoods: savedOffice.phoneGoods,
      address: savedOffice.address,
      note: savedOffice.note,
      typeTicket: savedOffice.typeTicket,
      typeGoods: savedOffice.typeGoods,
      companyId: savedOffice.company.id,
      created_at: savedOffice.created_at.toISOString(),
    };
  }

  async getOfficesByCompany(companyId: number): Promise<DTO_RP_Office[]> {
    console.log('Received Company ID from client: ', companyId);
    const existingCompany = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!existingCompany) {
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const offices = await this.officeRepository.find({
      where: { companyId },
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
        phoneTicket: office.phoneTicket,
        phoneGoods: office.phoneGoods,
        address: office.address,
        note: office.note,
        typeTicket: office.typeTicket,
        typeGoods: office.typeGoods,
        companyId: office.companyId,
        created_at: office.created_at ? office.created_at.toISOString() : null,
      };
    });
    return mappedOffices;
  }

  async getOfficeNameByCompany(companyId: number): Promise<DTO_RP_OfficeName[]> {
    console.log('Received Company ID from client: ', companyId);
    const existingCompany = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!existingCompany) {
      throw new HttpException(
        'Dữ liệu công ty không tồn tại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const offices = await this.officeRepository.find({
      where: { companyId },
    });

    const mappedOffices = offices.map((office) => {
      return {
        id: office.id,
        name: office.name,
      };
    });
    return mappedOffices;
  }

  async updateOffice(id: number, office: DTO_RQ_Office): Promise<DTO_RP_Office> {
    console.log('Received Data Office from client: ', office);
    const existingOffice = await this.officeRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!existingOffice) {
      throw new HttpException(
        'Dữ liệu văn phòng không tồn tại!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const updatedOffice = {
      ...existingOffice,
      ...office,
    };

    const savedOffice = await this.officeRepository.save(updatedOffice);

    return {
      id: savedOffice.id,
      name: savedOffice.name,
      code: savedOffice.code,
      phoneTicket: savedOffice.phoneTicket,
      phoneGoods: savedOffice.phoneGoods,
      address: savedOffice.address,
      note: savedOffice.note,
      typeTicket: savedOffice.typeTicket,
      typeGoods: savedOffice.typeGoods,
      companyId: savedOffice.company.id,
      created_at: savedOffice.created_at.toISOString(),
    };
  }

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
