import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "../company/company.entity";
import { Seat } from "./seat.entity";
import { Schedule } from "../schedule/schedule.entity";

@Entity('tbl_seat_map')
export class SeatMap {
    @PrimaryGeneratedColumn()
    id: number;
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column()
    name: string;
    @Column()
    total_floor: number;
    @Column()
    total_row: number;
    @Column()
    total_column: number;

    @Column()
    company_id: number;
    @ManyToOne(() => Company, (company) => company.seat_map, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @OneToMany(() => Seat, (seat) => seat.seat_map)
    seats: Seat[];

    @OneToMany(() => Schedule, (schedule) => schedule.seat_map)
    schedules: Schedule[];
}