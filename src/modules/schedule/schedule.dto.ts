import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, Matches } from "class-validator";

export class DTO_RQ_Schedule {
    @IsOptional()
    @IsInt()
    id: number;

    @IsDate()
    @Transform(({ value }) => new Date(value))
    start_date: Date;

    @IsDate()
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : null) 
    end_date: Date;

    @Matches(/^([0-9]{2}):([0-9]{2})$/, {
        message: 'start_time must be in HH:mm format',
    })
    start_time: string;

    @IsBoolean()
    is_end_date_set: boolean;

    @IsInt()
    route_id: number;

    @IsOptional()
    @IsString()
    route_name: string;

    @IsInt()
    seat_map_id: number;

    @IsString()
    @IsOptional()
    seat_map_name: string;

    @IsInt()
    company_id: number;
}

export class DTO_RP_Schedule {
    id: number;
    start_date: Date;
    end_date: Date;
    start_time: string;
    is_end_date_set: boolean;
    route_id: number;
    route_name: string;
    seat_map_id: number;
    seat_map_name: string;
    company_id: number;
    created_at: string;
}