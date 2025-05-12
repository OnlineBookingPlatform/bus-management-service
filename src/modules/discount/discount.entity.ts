import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../company/company.entity';

@Entity('tbl_discount')
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  discount_code: string;

  @Column()
  date_start: Date;

  @Column()
  date_end: Date;

  @Column()
  discount_value: number;

  @Column()
  discount_type: boolean; 

  @Column()
  description: string;

  @Column()
  number_of_uses: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Company, (company) => company.discounts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
