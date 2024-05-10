import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateModerator,
  CreateModeratorBodyDto,
  CreateModeratorDto,
} from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  ModeratorViewEntity,
} from '@tradeyard-v2/server/database';

import { mapToModeratorDto } from '../../mappers';

@Injectable()
export class ModeratorService {
  constructor(
    @InjectRepository(ModeratorViewEntity)
    private moderatorRepository: Repository<ModeratorViewEntity>,
    private eventRepository: EventRepository
  ) {}

  async createOne({
    first_name,
    last_name,
    email,
  }: CreateModeratorBodyDto): Promise<CreateModeratorDto> {
    const userCreatedEvent = await this.eventRepository.publish(
      'user:created',
      {
        user_id: randomUUID(),
        first_name,
        last_name,
        email,
      }
    );

    const moderator_id = randomUUID();
    const moderatorCreatedEvent = await this.eventRepository.publish(
      'moderator:created',
      {
        moderator_id,
        user_id: userCreatedEvent.body.user_id,
      }
    );

    const moderator = await this.moderatorRepository.findOne({
      where: {
        moderator_id: moderatorCreatedEvent.body.moderator_id,
      },
      relations: {
        user: true,
      },
    });

    return CreateModerator.parse(mapToModeratorDto(moderator));
  }
}
