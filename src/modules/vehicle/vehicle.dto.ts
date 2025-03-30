import { Transform } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class DTO_RQ_Vehicle {
  @IsOptional()
  id: number;

  @IsString()
  license_plate: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsInt()
  brand: number;

  @IsInt()
  type: number;

  @IsInt()
  status: number;


  @IsString()
  @IsOptional()
  color: string;

  
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsOptional()
  registration_expiry: Date;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  @IsOptional()
  insurance_expiry: Date;

  

  @IsString()
  @IsOptional()
  note: string;

  @IsInt()
  company_id: number;
}
export class DTO_RP_Vehicle {
  id: number;
  license_plate: string;
  phone: string;
  brand: number;
  type: number;
  color: string;
  note: string;
  registration_expiry: string;
  insurance_expiry: string;
  status: number;
  created_at: string;
}
