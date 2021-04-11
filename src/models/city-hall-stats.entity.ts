import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import CityHall from "./city-hall.entity";

@Entity()
export default class CityHallStats extends BaseEntity {
    
    @PrimaryColumn()
    cityHallID: number;

    @Column()
    nStations: number;

    @Column()
    maxDistanceFromStation: number;

    @Column()
    avgDistanceFromStation: number;

    @OneToOne(() => CityHall)
    @JoinColumn({
        name: 'cityHallID',
        referencedColumnName: 'id'
    })
    cityHall: CityHall;
}