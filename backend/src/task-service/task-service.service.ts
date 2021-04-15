import { HttpService, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import CityHallStats from '../models/city-hall-stats.entity';
import CityHall from '../models/city-hall.entity';
import { getConnection } from 'typeorm';

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
    constructor(private httpService: HttpService) {}

    private readonly logger = new Logger(TaskServiceService.name);

    @Cron('0 0 * * *')
    async syncService() {
        this.logger.debug('Called chron');
        const response = await this.httpService
            .get<RootObject>(
                'https://dati.comune.milano.it/it/datastore/dump/d9509257-9f88-4729-8905-c92f5bbda35f?format=json',
            )
            .toPromise();
        this.logger.debug('retrieved response');
        const stations = this.parseResponse(response.data);
        this.logger.debug('parsed response');
        const townHalls = await this.retrieveTownHalls();
        this.logger.debug('retrieved town halls');
        await this.createTownHallStats(townHalls, stations);
        this.logger.debug('Applied transaction');
    }

    private async createTownHallStats(
        townHalls: {
            '1': CityHall;
            '2': CityHall;
            '3': CityHall;
            '4': CityHall;
            '5': CityHall;
            '6': CityHall;
            '7': CityHall;
            '8': CityHall;
            '9': CityHall;
        },
        stations: ColonnineResponse[],
    ) {
        const connection = getConnection();
        await connection.transaction(async (entityManager) => {
            this.logger.debug('started transaction');
            await entityManager.remove<CityHallStats>(
                await CityHallStats.find(),
            );
            this.logger.debug('removed all cities');
            const cityHallStatsEntity = await entityManager.getRepository<CityHallStats>(
                CityHallStats,
            );
            this.logger.debug('retrieved city hall entity');
            for (let i = 1; i <= 9; i++) {
                const townHallStats = new CityHallStats();
                townHallStats.cityHall = townHalls[i + ''];
                townHallStats.cityHallID = townHallStats.cityHall.id;
                const stationsOfTownHall = stations.filter(
                    (station) => Number(station.municipio) === i,
                );
                townHallStats.nStations = stationsOfTownHall.reduce(
                    (previousValue, currentValue) =>
                        previousValue + currentValue.n_colonn,
                    0,
                );
                townHallStats.avgDistanceFromStation = 10;
                townHallStats.maxDistanceFromStation = 20;
                this.logger.debug('Saving town hall ' + i + ' with');
                this.logger.debug(townHallStats);
                await cityHallStatsEntity.save(townHallStats);
                this.logger.debug('Saved');
            }
            this.logger.debug('Finished');
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
            9: townHalls.find(findPerId(9)),
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
            lat_y_4326: -1,
        };
        for (const i in Object.keys(fieldsToImport)) {
            const fieldName = Object.keys(fieldsToImport)[i];
            const foundFieldIndex = response.fields.findIndex(
                (field) => field.id === fieldName,
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
