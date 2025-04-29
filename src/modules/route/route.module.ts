import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Route } from "./route.entity";
import { CompanyModule } from "../company/company.module";
import { RouteController } from "./route.controller";
import { RouteService } from "./route.service";
import { RoutePopular } from "./route_popular.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Route, RoutePopular]), CompanyModule],
    controllers: [RouteController],
    providers: [RouteService],
    exports: [RouteService, TypeOrmModule],
})
export class RouteModule {}