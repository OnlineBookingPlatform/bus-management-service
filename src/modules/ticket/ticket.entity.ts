import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../company/company.entity';
import { Trip } from '../trip/trip.entity';

@Entity('tbl_ticket')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  seat_name?: string;

  @Column()
  seat_code: string;

  @Column()
  seat_floor: number;

  @Column()
  seat_row: number;

  @Column()
  seat_column: number;

  @Column()
  seat_status: boolean;

  @Column()
  status_booking_ticket: boolean; 

  @ManyToOne(() => Company, (company) => company.tickets)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Trip, (trip) => trip.tickets)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @Column({ type: 'float' })
  base_price: number;

  @Column()
  passenger_name: string;

  @Column()
  passenger_phone: string;

  @Column()
  point_up: string;

  @Column()
  point_down: string;

  @Column()
  ticket_note: string;

  @Column()
  creator_by: string;

  @Column()
  email: string;

  @Column()
  gender: number;

}
