import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
    type: (process.env.DB_TYPE as 'sqlite' | 'mysql') || 'sqlite',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'db',
    entities: ["dist/**/*.entity{.ts,.js}"],
    synchronize: true,
    logging: true,
  }),
  ConfigModule.forRoot()
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
