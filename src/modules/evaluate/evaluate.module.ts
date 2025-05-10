import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Evaluate } from "./evaluate.entity";
import { EvaluateController } from "./evaluate.controller";
import { EvaluateService } from "./evaluate.service";
import { CompanyModule } from "../company/company.module";
import { TripModule } from "../trip/trip.module";

@Module({
  imports: [TypeOrmModule.forFeature([Evaluate]), CompanyModule, TripModule],
  controllers: [EvaluateController],
  providers: [EvaluateService],
  exports: [],
})
export class EvaluateModule {}