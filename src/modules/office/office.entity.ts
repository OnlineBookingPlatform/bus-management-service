import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../company/company.entity';

@Entity('tbl_office')
export class Office {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  phoneTicket: string;

  @Column()
  phoneGoods: string;

  @Column()
  address: string;

  @Column()
  note: string;

  @Column()
  typeTicket: boolean;

  @Column()
  typeGoods: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true })
  companyId: number;

  @ManyToOne(() => Company, (company) => company.offices, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;
}
