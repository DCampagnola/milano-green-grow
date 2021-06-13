import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProviderStatsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  providerName: string;

  @Column()
  nStations: number;
}
