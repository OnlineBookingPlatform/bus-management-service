import { Module, OnModuleInit } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { DataSource } from 'typeorm';
import { CompanyModule } from './modules/company/company.module';
import { OfficeModule } from './modules/office/office.module';
import { SeatModule } from './modules/seat/seat.module';
import { RedisService } from './config/redis.service';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { RouteModule } from './modules/route/route.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { LocationModule } from './modules/location/location.module';
import { PointModule } from './modules/point/point.module';
import { TripModule } from './modules/trip/trip.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { PolicyModule } from './modules/policy/policy.module';
import { InterestInRouteModule } from './modules/interest-in-route/interest-in-route.module';
import { TransitModule } from './modules/transit/transit.module';
import { EvaluateModule } from './modules/evaluate/evaluate.module';
import { DiscountModule } from './modules/discount/discount.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'ndg.phu03@gmail.com',
          pass: 'phfgzqfwzoxevpcx',
        },
      },
      defaults: {
        from: '"No Reply <no-reply@localhost>"',
      },
      template: {
        dir: process.cwd() + '/src/mail/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    DatabaseModule,
    CompanyModule,
    OfficeModule,
    SeatModule,
    VehicleModule,
    RouteModule,
    ScheduleModule,
    LocationModule,
    PointModule,
    TripModule,
    TicketModule,
    PolicyModule,
    InterestInRouteModule,
    TransitModule,
    EvaluateModule,
    DiscountModule,
  ],
  controllers: [],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('✅ Kết nối PostgreSQL thành công!');
    } else {
      console.error('❌ Kết nối PostgreSQL thất bại!');
    }
  }
}
