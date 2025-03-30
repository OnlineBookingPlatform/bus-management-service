import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Office } from '../office/office.entity';
import { SeatMap } from '../seat/seat_map.entity';
import { Vehicle } from '../vehicle/vehicle.entity';

@Entity('tbl_company')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  phone: string;
  @Column()
  address: string;
  @Column()
  tax_code: string;
  @Column()
  status: boolean;
  @Column()
  url_logo: string;
  @Column()
  code: string;
  @Column()
  note: string;
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => Office, (office) => office.company)
  offices: Office[];

  @OneToMany(() => SeatMap, (seat_map) => seat_map.company)
  seat_map: SeatMap[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.company)
  vehicles: Vehicle[];
}
