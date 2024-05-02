import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EventRepository } from '@tradeyard-v2/server/database';

@Injectable()
export class ComplaintService {
  constructor(readonly eventRepository: EventRepository) {}
}
