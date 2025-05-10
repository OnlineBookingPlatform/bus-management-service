import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "../company/company.entity";
import { Trip } from "../trip/trip.entity";

@Entity('tbl_evaluate')
export class Evaluate {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column()
    desc: string;

    @Column()
    rating: number;

    @ManyToOne(() => Company, (company) => company.evaluates, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @ManyToOne(() => Trip, (trip) => trip.evaluates, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column()
    ticket_id: number;

    @Column()
    account_id: string;

    @Column()
    account_name: string;

    @Column()
    ticket_phone: string;

    @Column()
    account_email: string;

    @Column()
    account_avatar: string;
}