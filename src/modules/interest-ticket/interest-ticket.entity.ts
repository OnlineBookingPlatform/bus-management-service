import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tbl_interest_ticket')
export class InterestTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticket_id: number;

  @Column()
  account_id: string;

  @Column()
  passenger_name: string;

  @Column()
  passenger_phone: string;

  @Column()
  passenger_email: string;

  @Column({ default: '' })
  point_up: string;

  @Column({ default: '' })
  point_down: string;

  @Column({ default: '' })
  note: string;

  @Column({ default: 0 })
  gender: number;
} 