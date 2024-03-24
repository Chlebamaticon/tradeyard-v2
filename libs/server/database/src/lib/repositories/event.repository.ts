import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  EventBody,
  eventSchemas,
  EventType,
} from '@tradeyard-v2/server/schemas';

import { EventEntity } from '../entities';

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    readonly eventRepository: Repository<EventEntity<any>>
  ) {}

  public publish<ET extends EventType>(
    type: ET,
    body: EventBody<ET>
  ): Promise<EventEntity<ET>> {
    const validatedBody = eventSchemas[type].parse(body);
    return this.eventRepository.save({ type, body: validatedBody });
  }
}
