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
import { Schedule } from '../schedule/schedule.entity';
import { PointOfRoute } from '../point/point_of_route.entity';

@Entity('tbl_route')
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  name: string;

  @Column()
  shorten_name: string;

  @Column({ type: 'float' })
  base_price: number;

  @Column()
  status: boolean;

  @Column({ nullable: true })
  note: string;

  @Column({ type: 'int' })
  display_order: number;

  @Column({ name: 'company_id' })
  company_id: number;

  @ManyToOne(() => Company, (company) => company.routes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Schedule, (schedule) => schedule.route)
  schedules: Schedule[];

  @OneToMany(() => PointOfRoute, (point) => point.route)
  point_of_route: PointOfRoute[];
}
