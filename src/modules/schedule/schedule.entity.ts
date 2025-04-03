import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../company/company.entity';
import { Route } from '../route/route.entity';
import { SeatMap } from '../seat/seat_map.entity';
import { Trip } from '../trip/trip.entity';

@Entity('tbl_schedule')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // Ngày bắt đầu
  @Column({ type: 'timestamp' })
  start_date: Date;

  // Ngày kết thúc
  @Column({ type: 'timestamp', nullable: true })
  end_date: Date | null;

  // Thời gian khởi hành
  @Column({ type: 'time' })
  start_time: string;

  @Column()
  is_end_date_set: boolean;

  // Quan hệ với Route
  @ManyToOne(() => Route, (route) => route.schedules, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'route_id' })
  route: Route | null;

  // Quan hệ với SeatMap
  @ManyToOne(() => SeatMap, (seat_map) => seat_map.schedules, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'seat_map_id' })
  seat_map: SeatMap | null;

  // Quan hệ với Company
  @ManyToOne(() => Company, (company) => company.schedules, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company | null;

  @OneToMany(() => Trip, (trip) => trip.schedule)
  trips: Trip[];
  route_id: any;
}
