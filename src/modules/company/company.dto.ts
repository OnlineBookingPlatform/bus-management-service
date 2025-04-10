import { IsBoolean, IsInt, IsString } from "class-validator";

export class DTO_RQ_Company {
  @IsInt()
  id: number;
  @IsString()
  name: string;
  @IsString()
  phone: string;
  @IsString()
  address: string;
  @IsString()
  tax_code: string;
  @IsBoolean()
  status: boolean;
  @IsString()
  url_logo: string;
  @IsString()
  code: string;
  @IsString()
  note: string;
}
export class DTO_RP_Company {
  id: number;
  name: string;
  phone: string;
  address: string;
  tax_code: string;
  status: boolean;
  url_logo: string;
  code: string;
  note: string;
  url_vehicle_online: string;
  created_at: string;
}
