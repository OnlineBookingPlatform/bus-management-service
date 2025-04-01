import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { District } from "./districts.entity";

@Entity('tbl_provinces_v1')
export class Province {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: number;

  @OneToMany(() => District, (district) => district.province)
  districts: District[];
}