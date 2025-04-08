import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('tbl_policy')
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  content: any;

  @ManyToOne(() => Company, (company) => company.tickets)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
