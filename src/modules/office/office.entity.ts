import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
