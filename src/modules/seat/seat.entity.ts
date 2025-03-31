import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SeatMap } from "./seat_map.entity";

@Entity('tbl_seat')
export class Seat {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    @Column()
    code: string;
    @Column()
    status: boolean;
    @Column()
    floor: number;
    @Column()
    row: number;
    @Column()
    column: number;

    @Column({ nullable: true })
    seat_map_id: number;
    @ManyToOne(() => SeatMap, (seat_map) => seat_map.seats, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'seat_map_id' })
    seat_map: SeatMap;
}