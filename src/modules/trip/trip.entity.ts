import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../company/company.entity';
import { Schedule } from '../schedule/schedule.entity';
import { Route } from '../route/route.entity';
import { SeatMap } from '../seat/seat_map.entity';
import { Ticket } from '../ticket/ticket.entity';
import { Evaluate } from '../evaluate/evaluate.entity';

@Entity('tbl_trip')
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.trips)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Schedule, (schedule) => schedule.trips)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @ManyToOne(() => Route, (route) => route.trips)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @ManyToOne(() => SeatMap, (seat_map) => seat_map.trips)
  @JoinColumn({ name: 'seat_map_id' })
  seat_map: SeatMap;

  @Column({ type: 'time' })
  time_departure: string;

  @Column()
  date_departure: Date;

  @OneToMany(() => Ticket, (ticket) => ticket.trip)
  tickets: Ticket[];

  @OneToMany(() => Evaluate, (evaluate) => evaluate.trip)
  evaluates: Evaluate[];

}
