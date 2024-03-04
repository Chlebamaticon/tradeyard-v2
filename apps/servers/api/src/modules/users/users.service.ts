import { Controller } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventRepository, UserViewEntity } from '@tradeyard-v2/server/database';

import { Repository } from 'typeorm';

@Controller()
export class UsersService {
  constructor(
    @InjectRepository(UserViewEntity)
    readonly userViewRepository: Repository<UserViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  createOne() {}
}
