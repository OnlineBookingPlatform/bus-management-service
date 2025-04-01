import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { District } from './districts.entity';

@Entity('tbl_wards_v1')
export class Ward {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: number;

  @ManyToOne(() => District, (district) => district.wards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'district_code' })
  district: District;
}
