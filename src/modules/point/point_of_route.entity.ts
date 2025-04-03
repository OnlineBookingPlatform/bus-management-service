import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Route } from '../route/route.entity';
import { Point } from './point.entity';
import { Company } from '../company/company.entity';

@Entity('tbl_point_of_route')
export class PointOfRoute {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Route, (route) => route.point_of_route)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @ManyToOne(() => Point, (point) => point.point_of_route)
  @JoinColumn({ name: 'point_id' })
  point: Point;

  @ManyToOne(() => Company, (company) => company.point_of_route)
  @JoinColumn({ name: 'company_id' })
  company: Company;


  @Column()
  time: string;

  @Column()
  display_order: number;
}


