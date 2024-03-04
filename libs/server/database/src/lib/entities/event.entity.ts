import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventBody, EventType } from '../types';

@Entity({
  name: 'events',
})
export class EventEntity<ET extends EventType> {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar' })
  type!: ET;

  @Column({ type: 'jsonb' })
  body!: EventBody<ET>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}
