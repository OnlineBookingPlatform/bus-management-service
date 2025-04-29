import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class DTO_RQ_Route {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  shorten_name: string;

  @IsInt()
  base_price: number;

  @IsBoolean()
  status: boolean;

  @IsString()
  @IsOptional()
  note: string;
  
  @IsInt()
  company_id: number;
}
export class DTO_RP_Route {
  id: number;
  name: string;
  shorten_name: string;
  base_price: number;
  status: boolean;
  note: string;
  created_at: string;
}

export class DTO_RP_RouteName {
  id: number;
  name: string;
}

export class DTO_RQ_RoutePopular {
  id: number;
  name: string;
  url_avatar: string;
  base_price: number;
  status: boolean;
}
export class DTO_RP_RoutePopular {
  id?: number;
  name: string;
  url_avatar: string;
  base_price: number;
  status: boolean;
}
