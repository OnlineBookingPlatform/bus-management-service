import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ward } from '../location/wards.entity';
import { District } from '../location/districts.entity';
import { Province } from '../location/provinces.entity';
import { Company } from '../company/company.entity';

@Entity('tbl_point')
export class Point {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string; // Tên địa điểm
  
    @Column()
    address: string; // Địa chỉ chi tiết
  
    @ManyToOne(() => Company, (company) => company.points, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({ name: 'company_id' })
    company_id: number;
  
    @ManyToOne(() => Province)
    @JoinColumn({ name: 'provinces_id' })
    province: Province;
  
    @Column({ name: 'provinces_id' })
    provinces_id: number;
  
    @ManyToOne(() => District)
    @JoinColumn({ name: 'districts_id' })
    district: District;
  
    @Column({ name: 'districts_id' })
    districts_id: number;
  
    @ManyToOne(() => Ward)
    @JoinColumn({ name: 'wards_id' })
    ward: Ward;
  
    @Column({ name: 'wards_id' })
    wards_id: number;
}
