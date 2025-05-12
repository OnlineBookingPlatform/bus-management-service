import { IsBoolean, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class DTO_RQ_Discount {
  @IsOptional()
  id: number; 

  @IsString()
  discount_code: string;

  @IsOptional()
  @IsDateString()
  date_start: string;

  @IsOptional()
  @IsDateString()
  date_end: string;

  @IsInt()
  discount_value: number; 

  @IsBoolean()
  discount_type: boolean; 

  @IsOptional()
  @IsString()
  description: string; 

  @IsOptional()
  @IsInt()
  number_of_uses: number; 

  @IsInt()
  company_id: number; 
}

export class DTO_RP_Discount {
  id: number;
  discount_code: string;
  date_start: string;
  date_end: string;
  discount_value: number;
  discount_type: boolean;
  description: string;
  number_of_uses: number;
  company_id: number;
  created_at: string; 
}
