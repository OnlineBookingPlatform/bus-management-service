import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  username: 'postgres.cdiyonnatouyzwblhtyv',
  password: '0397892603',
  database: 'postgres',
  autoLoadEntities: true,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: false,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};
