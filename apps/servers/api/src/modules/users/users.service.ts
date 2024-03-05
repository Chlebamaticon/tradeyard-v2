import { Controller } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventRepository, UserViewEntity } from '@tradeyard-v2/server/database';

import { Repository } from 'typeorm';

@Controller()
export class UsersService {
  create() {
    this.eventRepository.publish('user:created', {});
  }

  update() {
    this.eventRepository.publish('user:updated', {});
  }

  bulkUpdate() {
    this.eventRepository.publish('user:updated', {});
  }

  getOne(dto) {
    return this.userViewRepository.findOneOrFail({
      where: {
        userId: dto.id,
      },
    });
  }

  getMany(dto) {
    return this.userViewRepository.find({ where: {} });
  }

  constructor(
    @InjectRepository(UserViewEntity)
    readonly userViewRepository: Repository<UserViewEntity>,
    readonly eventRepository: EventRepository
  ) {}
}
