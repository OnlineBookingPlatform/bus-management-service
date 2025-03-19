import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
