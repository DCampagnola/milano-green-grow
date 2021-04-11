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
    .select('SUM(cityHall.nStations)', 'sum')
    .getRawOne();
    return {nStations: result.sum, avgDistanceFromStation: 10, maxDistanceFromStation: 20};
  }

  @Get('')
  @Render('index')
  public getIndex() {
    return {};
  }
}
