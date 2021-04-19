import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import CityHall from "./city-hall.entity";

@Entity()
export default class CityHallStats extends BaseEntity {

    @PrimaryColumn()
    cityHallID: number;

    @Column()
    nStations: number;

    @Column({
        type: 'real',
        default: 0,
    })
    maxDistanceFromStation: number;

    @Column({
        type: 'real',
        default: 0,
    })
    avgDistanceFromStation: number;

    @OneToOne(() => CityHall)
    @JoinColumn({
        name: 'cityHallID',
        referencedColumnName: 'id'
    })
    cityHall: CityHall;
}
