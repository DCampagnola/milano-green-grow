import { Controller, Get, Param, Query, Render } from "@nestjs/common";
import { getConnection } from "typeorm";
import { AppService } from "./app.service";
import CityHallStats from "./models/city-hall-stats.entity";
import { TaskServiceService } from "./task-service/task-service.service";
import CityHallStatsHistory from "./models/city-hall-stats-history.entity";

@Controller("api")
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly taskService: TaskServiceService
  ) {
  }

  @Get("city-hall-stats")
  public async getCityHallStats() {
    return await CityHallStats.find({
      relations: ["cityHall"]
    });
  }

  @Get("stats")
  public async getStats() {
    const result = await getConnection()
      .getRepository(CityHallStats)
      .createQueryBuilder("cityHall")
      .addSelect("SUM(cityHall.nStations)", "sum")
      .addSelect("MAX(cityHall.maxDistanceFromStation)", "max")
      .addSelect("AVG(cityHall.avgDistanceFromStation)", "avg")
      .getRawOne();
    return {
      nStations: Number(result.sum).toFixed(0),
      avgDistanceFromStation: Number(result.avg).toFixed(2),
      maxDistanceFromStation: Number(result.max).toFixed(2)
    };
  }

  @Get("history")
  public async getHistory(@Query("townHall") townHallID?: number) {
    if (townHallID) {
      return await CityHallStatsHistory.find({
        where: {
          cityHallID: townHallID
        }
      });
    } else {
      return (
        await getConnection()
          .getRepository(CityHallStatsHistory)
          .createQueryBuilder("cityHallStatsHistory")
          .addSelect("cityHallStatsHistory.createdAt", "createdAt")
          .addSelect("SUM(cityHallStatsHistory.nStations)", "nStations")
          .addSelect(
            "MAX(cityHallStatsHistory.maxDistanceFromStation)",
            "maxDistanceFromStation"
          )
          .addSelect(
            "AVG(cityHallStatsHistory.avgDistanceFromStation)",
            "avgDistanceFromStation"
          )
          .groupBy("cityHallStatsHistory.createdAt")
          .getRawMany()
      ).map((value) => {
        return {
          ...value,
          createdAt: new Date(value.createdAt)
        };
      });
    }
  }

  @Get("run-task")
  public async runTask() {
    await this.taskService.syncService();
  }
}
