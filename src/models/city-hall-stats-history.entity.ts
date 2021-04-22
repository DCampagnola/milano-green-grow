import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import CityHall from "./city-hall.entity";

@Entity()
export default class CityHallStatsHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    createdAt: Date;

    @Column()
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
