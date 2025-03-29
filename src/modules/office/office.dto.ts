import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class DTO_RQ_Office {
  @IsOptional()
  id: number;
  
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  phone_ticket: string;

  @IsOptional()
  @IsString()
  phone_goods: string;


  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsOptional()
  @IsBoolean()
  type_ticket: boolean;

  @IsOptional()
  @IsBoolean()
  type_goods: boolean;

  @IsInt()
  company_id: number;
}
export class DTO_RP_Office {
  id: number;
  name: string;
  code: string;
  phone_ticket: string;
  phone_goods: string;
  address: string;
  note: string;
  type_ticket: boolean;
  type_goods: boolean;
  created_at: string;
}
export class DTO_RP_OfficeName {
  id: number;
  name: string;
}
