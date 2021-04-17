import { HttpService, Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import CityHallStats from "../models/city-hall-stats.entity";
import CityHall from "../models/city-hall.entity";
import { getConnection } from "typeorm";
import { stat } from "fs";
import { max } from "rxjs/operators";

interface ColonnineResponse {
  id: number;
  municipio: number;
  titolare: string;
  localita: string;
  n_colonn: number;
  n_punti_ri: number;
  tipo_ricar: string;
  stato_attu: string;
  tipologia: string;
  lon_x_4326: number;
  lat_y_4326: number;
}

export interface Info {
  notes: string;
  type_override: string;
  label: string;
}

export interface Field {
  type: string;
  id: string;
  info: Info;
}

export interface RootObject {
  fields: Field[];
  records: any[][];
}

@Injectable()
export class TaskServiceService {
  constructor(private httpService: HttpService) {
  }

  private readonly logger = new Logger(TaskServiceService.name);

  @Cron("0 0 * * *")
  async syncService() {
    this.logger.debug("Called chron");
    const response = await this.httpService
      .get<RootObject>(
        "https://dati.comune.milano.it/it/datastore/dump/d9509257-9f88-4729-8905-c92f5bbda35f?format=json"
      )
      .toPromise();
    this.logger.debug("retrieved response");
    const stations = this.parseResponse(response.data);
    this.logger.debug("parsed response");
    const townHalls = await this.retrieveTownHalls();
    this.logger.debug("retrieved town halls");
    await this.createTownHallStats(townHalls, stations);
    this.logger.debug("Applied transaction");
    await this.setCityHallStats(stations, townHalls);
  }

  private async setCityHallStats(stations: ColonnineResponse[], townHalls: { "1": CityHall; "2": CityHall; "3": CityHall; "4": CityHall; "5": CityHall; "6": CityHall; "7": CityHall; "8": CityHall; "9": CityHall }) {
    const squares = {
      "1": [
        {
          topleft: { lng: 9.167008, lat: 45.480225 },

          bottomright: { lng: 9.206319, lat: 45.453619 }
        }
      ],
      "2": [
        {
          topleft: { lng: 9.219193, lat: 45.519449 },
          bottomright: { lng: 9.219193, lat: 45.519449 }
        },
        {
          topleft: { lng: 9.212241, lat: 45.508984 },
          bottomright: { lng: 9.232411, lat: 45.493704 }
        },
        {
          topleft: { lng: 9.199195, lat: 45.503089 },
          bottomright: { lng: 9.217219, lat: 45.486062 }
        },
        {
          topleft: { lng: 9.200482, lat: 45.491959 },
          bottomright: { lng: 9.204774, lat: 45.480285 }
        }
      ],
      "3": [
        {
          topleft: { lng: 9.204774, lat: 45.480285 },
          bottomright: { lng: 9.260735, lat: 45.468609 }
        },
        {
          topleft: { lng: 9.226918, lat: 45.491959 },
          bottomright: { lng: 9.258676, lat: 45.486784 }
        },
        {
          topleft: { lng: 9.256616, lat: 45.511209 },
          bottomright: { lng: 9.267087, lat: 45.505916 }
        }
      ],
      "4": [
        {
          topleft: { lng: 9.208207, lat: 45.467646 },
          bottomright: { lng: 9.265542, lat: 45.447778 }
        },
        {
          topleft: { lng: 9.214730, lat: 45.448019 },
          bottomright: { lng: 9.256616, lat: 45.430072 }
        }
      ],
      "5": [
        {
          topleft: { lng: 9.172931, lat: 45.448561 },
          bottomright: { lng: 9.212413, lat: 45.400851 }
        }
      ],
      "6": [
        {
          topleft: { lng: 9.113622, lat: 45.455124 },
          bottomright: { lng: 9.159284, lat: 45.424651 }
        },
        {
          topleft: { lng: 9.156194, lat: 45.455365 },
          bottomright: { lng: 9.175248, lat: 45.443322 }
        }
      ],
      "7": [
        {
          topleft: { lng: 9.068818, lat: 45.482813 },
          bottomright: { lng: 9.120316, lat: 45.458736 }
        },
        {
          topleft: { lng: 9.122720, lat: 45.481609 },
          bottomright: { lng: 9.164605, lat: 45.459338 }
        },
        {
          topleft: { lng: 9.049935, lat: 45.454522 },
          bottomright: { lng: 9.076200, lat: 45.439829 }
        }
      ],
      "8": [
        {
          topleft: { lng: 9.126153, lat: 45.520471 },
          bottomright: { lng: 9.149156, lat: 45.480405 }
        },
        {
          topleft: { lng: 9.152417, lat: 45.491718 },
          bottomright: { lng: 9.161859, lat: 45.469331 }
        },
        {
          topleft: { lng: 9.167523, lat: 45.491959 },
          bottomright: { lng: 9.180913, lat: 45.482331 }
        },
        {
          topleft: { lng: 9.092164, lat: 45.505315 },
          bottomright: { lng: 9.122033, lat: 45.491598 }
        }
      ],
      "9": [
        {
          topleft: { lng: 9.159112, lat: 45.532979 },
          bottomright: { lng: 9.206662, lat: 45.501946 }
        },
        {
          topleft: { lng: 9.156537, lat: 45.505916 },
          bottomright: { lng: 9.190869, lat: 45.489913 }
        },
        {
          topleft: { lng: 9.182973, lat: 45.488710 },
          bottomright: { lng: 9.196191, lat: 45.479924 }
        }
      ]
    };

    function calcCrow(plat1, lon1, plat2, lon2) {
      function toRad(Value) {
        return Value * Math.PI / 180;
      }

      var R = 6371; // km
      var dLat = toRad(plat2 - plat1);
      var dLon = toRad(lon2 - lon1);
      var lat1 = toRad(plat1);
      var lat2 = toRad(plat2);

      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d;
    }

    await getConnection().transaction(async (entityManager) => {
      for (let townHallIndex = 1; townHallIndex <= 9; townHallIndex++) {
        let n = 0;
        let maxDistance = 0;
        let sumDistances = 0;
        for (const square of squares[townHallIndex + ""]) {
          for (let i = square.topleft.lng; i <= square.bottomright.lng; i += 0.001) {
            for (let j = square.topleft.lat; j >= square.bottomright.lat; j -= 0.001) {
              const distance = (lat, lng) => calcCrow(j, i, lat, lng);
              let minDistance = 999999999;
              for (const station of stations) {
                const dist = distance(station.lat_y_4326, station.lon_x_4326);
                if (dist < minDistance) minDistance = dist;
              }
              sumDistances += minDistance;
              if (maxDistance < minDistance) maxDistance = minDistance;
              n++;
            }
          }
        }
        const avgDistance = sumDistances / n;
        const townHall: CityHall = townHalls[townHallIndex + ""];
        const cityHallStats = await entityManager.getRepository<CityHallStats>(CityHallStats).findOne({
           where: {
             cityHallID: townHallIndex
           }
        });
        cityHallStats.maxDistanceFromStation = maxDistance;
        cityHallStats.avgDistanceFromStation = avgDistance;
        await cityHallStats.save();
        this.logger.debug(`Townhall ${townHall.name} > maxDistance = ${maxDistance}`);
        this.logger.debug(`Townhall ${townHall.name} > avgDistance = ${avgDistance}`);
      }
      this.logger.debug("Finished transaction #2");
    });
  }

  private async createTownHallStats(
    townHalls: {
      "1": CityHall;
      "2": CityHall;
      "3": CityHall;
      "4": CityHall;
      "5": CityHall;
      "6": CityHall;
      "7": CityHall;
      "8": CityHall;
      "9": CityHall;
    },
    stations: ColonnineResponse[]
  ) {
    const connection = getConnection();
    await connection.transaction(async (entityManager) => {
      this.logger.debug("started transaction");
      await entityManager.remove<CityHallStats>(
        await CityHallStats.find()
      );
      this.logger.debug("removed all cities");
      const cityHallStatsEntity = await entityManager.getRepository<CityHallStats>(
        CityHallStats
      );
      this.logger.debug("retrieved city hall entity");
      for (let i = 1; i <= 9; i++) {
        const townHallStats = new CityHallStats();
        townHallStats.cityHall = townHalls[i + ""];
        townHallStats.cityHallID = townHallStats.cityHall.id;
        const stationsOfTownHall = stations.filter(
          (station) => Number(station.municipio) === i
        );
        townHallStats.nStations = stationsOfTownHall.reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.n_colonn,
          0
        );
        townHallStats.avgDistanceFromStation = 10;
        townHallStats.maxDistanceFromStation = 20;
        this.logger.debug("Saving town hall " + i + " with");
        this.logger.debug(townHallStats);
        await cityHallStatsEntity.save(townHallStats);
        this.logger.debug("Saved");
      }
      this.logger.debug("Finished");
    });
  }

  private async retrieveTownHalls() {
    const townHalls = await CityHall.find();
    const findPerId = (idToFind) => (townHall: CityHall) =>
      townHall.id === idToFind;
    return {
      1: townHalls.find(findPerId(1)),
      2: townHalls.find(findPerId(2)),
      3: townHalls.find(findPerId(3)),
      4: townHalls.find(findPerId(4)),
      5: townHalls.find(findPerId(5)),
      6: townHalls.find(findPerId(6)),
      7: townHalls.find(findPerId(7)),
      8: townHalls.find(findPerId(8)),
      9: townHalls.find(findPerId(9))
    };
  }

  private parseResponse(response: RootObject): ColonnineResponse[] {
    const fieldsToImport = {
      id: -1,
      municipio: -1,
      titolare: -1,
      localita: -1,
      n_colonn: -1,
      n_punti_ri: -1,
      tipo_ricar: -1,
      stato_attu: -1,
      tipologia: -1,
      lon_x_4326: -1,
      lat_y_4326: -1
    };
    for (const i in Object.keys(fieldsToImport)) {
      const fieldName = Object.keys(fieldsToImport)[i];
      const foundFieldIndex = response.fields.findIndex(
        (field) => field.id === fieldName
      );
      if (foundFieldIndex === -1) continue;
      fieldsToImport[fieldName] = foundFieldIndex;
    }
    const toReturn = [];
    for (const obj of response.records) {
      const objectToPush = {};
      for (const field of Object.keys(fieldsToImport)) {
        if (fieldsToImport[field] === -1) continue;
        objectToPush[field] = obj[fieldsToImport[field]];
      }
      toReturn.push(objectToPush);
    }
    return toReturn;
  }
}
