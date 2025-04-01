import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../company/company.entity';
import { Route } from '../route/route.entity';

@Entity('tbl_schedule')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // Ngày bắt đầu
  @Column()
  start_date: Date;

  // Ngày kết thúc
  @Column()
  end_date: Date;

  // Thời gian khởi hành
  @Column({ type: 'time' })
  start_time: string;

  @Column()
  is_end_date_set: boolean;

  // Tuyến
  @Column()
  route_id: number;

  // @ManyToOne(() => Route, (route) => route.schedules, {
  //   nullable: true,
  //   onDelete: 'SET NULL',
  // })

  @JoinColumn({ name: 'route_id' })
  route: Route;

  @Column()
  company_id: number;

  @ManyToOne(() => Company, (company) => company.schedules, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
