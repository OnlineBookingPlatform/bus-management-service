import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Route } from "./route.entity";
import { CompanyModule } from "../company/company.module";
import { RouteController } from "./route.controller";
import { RouteService } from "./route.service";

@Module({
    imports: [TypeOrmModule.forFeature([Route]), CompanyModule],
    controllers: [RouteController],
    providers: [RouteService],
})
export class RouteModule {}