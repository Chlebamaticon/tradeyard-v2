import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from '../entities';
import { Repository } from 'typeorm';
import { EventBody, EventType } from '../types';
import { eventSchemas } from '@tradeyard-v2/server/schemas';

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    readonly eventRepository: Repository<EventEntity<EventType>>
  ) {}

  public publish<ET extends EventType>(type: ET, body: EventBody<ET>) {
    const validatedBody = eventSchemas[type].parse(body);
    return this.eventRepository.save({ type, body: validatedBody });
  }
}
