import { Module } from "@nestjs/common";
import { TripController } from "./trip.controller";
import { TripService } from "./trip.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Trip } from "./trip.entity";
import { CompanyModule } from "../company/company.module";
import { RouteModule } from "../route/route.module";
import { SeatModule } from "../seat/seat.module";
import { ScheduleModule } from "../schedule/schedule.module";
import { PointModule } from "../point/point.module";
import { LocationModule } from "../location/location.module";
import { TicketModule } from "../ticket/ticket.module";
import { EvaluateModule } from "../evaluate/evaluate.module";

@Module({
    imports: [TypeOrmModule.forFeature([Trip]), CompanyModule, RouteModule, SeatModule, ScheduleModule, PointModule, LocationModule, TicketModule],
    controllers: [TripController],
    providers: [TripService],
    exports: [TripService, TypeOrmModule],
})
export class TripModule {}