import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from "class-validator";

export class DTO_RQ_Seat {
  @IsInt()
  id: number;
  @IsInt()
  column: number;
  @IsInt()
  row: number;
  @IsInt()
  floor: number;
  @IsString()
  code: string;
  @IsBoolean()
  status: boolean;
  @IsString()
  @IsOptional()
  name: string;
}
export class DTO_RQ_SeatMap {
  @IsInt()
  id: number;
  @IsString()
  name: string;
  @IsInt()
  total_floor: number;
  @IsInt()
  total_column: number;
  @IsInt()
  total_row: number;
  @IsInt()
  company_id: number;
  @ValidateNested({ each: true })
  @Type(() => DTO_RQ_Seat)
  seats: DTO_RQ_Seat[];
}
export class DTO_RP_Seat {
  id: number;
  column: number;
  row: number;
  floor: number;
  code: string;
  status: boolean;
  name: string;
}
export class DTO_RP_SeatMap {
  id: number;
  name: string;
  total_floor: number;
  total_column: number;
  total_row: number;
  seats: DTO_RP_Seat[];
}
