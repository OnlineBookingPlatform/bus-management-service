import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tbl_route_popular')
export class RoutePopular {
    @PrimaryGeneratedColumn()
    id: number;
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
    @Column()
    name: string;
    @Column()
    url_avatar: string;
    @Column()
    base_price: number;
    @Column()
    status: boolean;
}