import { Module, OnModuleInit } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { DataSource } from 'typeorm';
import { CompanyModule } from './modules/company/company.module';
import { OfficeModule } from './modules/office/office.module';
import { SeatModule } from './modules/seat/seat.module';

@Module({
  imports: [DatabaseModule, CompanyModule, OfficeModule, SeatModule],
  controllers: [],
  providers: [],
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
