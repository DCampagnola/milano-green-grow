import { HttpModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ScheduleModule } from "@nestjs/schedule";
import { TaskServiceService } from "./task-service/task-service.service";
const otherOpts: any = {
}
console.log("DBCERT", process.env.DB_CERT)
if(process.env.DB_CERT) {
  otherOpts.ssl = {
    rejectUnauthorized: true,
    ca: process.env.DB_CERT
  }
}
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as "sqlite" | "mysql") || "sqlite",
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || "db",
      entities: ["dist/**/*.entity{.ts,.js}"],
      migrations: ["dist/**/migrations/*{.ts,.js}"],
      migrationsRun: true,
      synchronize: true,
      logging: true,
      ...otherOpts
    }),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    HttpModule
  ],
  controllers: [AppController],
  providers: [AppService, TaskServiceService]
})
export class AppModule {
}
