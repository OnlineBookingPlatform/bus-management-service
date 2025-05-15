import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RefundStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  ERROR = 'error',
}

@Entity('tbl_refund')
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticket_id: number;

  @Column()
  passenger_name: string;

  @Column()
  passenger_phone: string;

  @Column()
  passenger_email: string;

  @Column({ type: 'float', default: 0 })
  money_paid: number;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.UNPAID,
  })
  status: RefundStatus;
} 