import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Refund } from './refund.entity';
import { Repository } from 'typeorm';
import { DTO_RP_Refund, DTO_RQ_CreateRefund } from './refund.dto';

@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
  ) {}

  async create(data: DTO_RQ_CreateRefund): Promise<DTO_RP_Refund> {
    try {
      // Create new refund entity
      const refund = this.refundRepository.create({
        ticket_id: data.ticket_id,
        passenger_name: data.passenger_name,
        passenger_phone: data.passenger_phone,
        passenger_email: data.passenger_email,
        money_paid: data.money_paid || 0,
      });

      // Save the refund to database
      const savedRefund = await this.refundRepository.save(refund);

      return {
        id: savedRefund.id,
        ticket_id: savedRefund.ticket_id,
        passenger_name: savedRefund.passenger_name,
        passenger_phone: savedRefund.passenger_phone,
        passenger_email: savedRefund.passenger_email,
        money_paid: savedRefund.money_paid,
        status: savedRefund.status,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create refund',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 