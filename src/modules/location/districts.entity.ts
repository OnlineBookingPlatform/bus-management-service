import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Province } from "./provinces.entity";
import { Ward } from "./wards.entity";

@Entity('tbl_districts_v1')
export class District {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: number;

  @ManyToOne(() => Province, (province) => province.districts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'province_code' })
  province: Province;

  @OneToMany(() => Ward, (ward) => ward.district)
  wards: Ward[];
}