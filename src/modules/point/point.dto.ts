import { IsInt, IsOptional, IsString } from 'class-validator';

export class DTO_RQ_Point {
  @IsOptional()
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  address: string;

  @IsInt()
  company_id: number;

  @IsInt()
  districts_id: number;

  @IsString()
  name: string;

  @IsInt()
  provinces_id: number;

  @IsOptional()
  @IsInt()
  wards_id: number;
}

export class DTO_RP_Point {
  id: number;
  address: string;
  districts_id: number;
  name: string;
  provinces_id: number;
  wards_id: number;
}

export class DTO_RP_PointName {
  id: number;
  name: string;
}

export class DTO_RQ_PointOfRoute {
  @IsInt()
  @IsOptional()
  id: number;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  time: string;

  @IsInt()
  display_order: number;

  @IsInt()
  point_id: number;

  @IsInt()
  route_id: number;

  @IsInt()
  company_id: number;
}

export class DTO_RP_PointOfRoute {
  id: number;
  name: string;
  time: string;
  display_order: number;
  point_id: number;
  route_id: number;
  company_id: number;
}
