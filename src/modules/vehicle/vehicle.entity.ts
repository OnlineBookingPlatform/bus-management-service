import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../company/company.entity';

@Entity('tbl_vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  license_plate: string;

  @Column()
  phone: string;

  @Column()
  brand: number;

  @Column()
  type: number;

  @Column()
  status: number;

  @Column()
  color: string;

  @Column()
  registration_expiry: Date;

  @Column()
  insurance_expiry: Date;

  @Column()
  note: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  company_id: number;
  
  @ManyToOne(() => Company, (company) => company.vehicles, {
    nullable: false,
    onDelete: 'CASCADE',
  })

  @JoinColumn({ name: 'company_id' })
  company: Company;
}
