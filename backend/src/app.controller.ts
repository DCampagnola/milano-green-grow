import { Controller, Get, Render } from '@nestjs/common';
import { getConnection } from 'typeorm';
import { AppService } from './app.service';
import CityHallStats from './models/city-hall-stats.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('city-hall-stats')
  public async getCityHallStats() {
    return await CityHallStats.find({
      relations: ['cityHall']
    })
  }


  @Get('stats')
  public async getStats() {
    const result = await getConnection().getRepository(CityHallStats)
    .createQueryBuilder('cityHall')
    .addSelect('SUM(cityHall.nStations)', 'sum')
        .addSelect('MAX(cityHall.maxDistanceFromStation)', 'max')
        .addSelect('AVG(cityHall.avgDistanceFromStation)', 'avg')
    .getRawOne();
    return {nStations: Number(result.sum).toFixed(0), avgDistanceFromStation: Number(result.avg).toFixed(2), maxDistanceFromStation: Number(result.max).toFixed(2)};
  }
}
