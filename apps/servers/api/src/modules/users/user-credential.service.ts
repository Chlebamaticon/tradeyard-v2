import { createHash, randomUUID } from 'crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User, UserDto } from '@tradeyard-v2/api-dtos';
import {
  EventRepository,
  UserCredentialViewEntity,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

@Injectable()
export class UserCredentialService {
  constructor(
    @InjectRepository(UserViewEntity)
    readonly userRepository: Repository<UserViewEntity>,
    @InjectRepository(UserCredentialViewEntity)
    readonly userCredentialRepository: Repository<UserCredentialViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async matchOrFail(email: string, password: string): Promise<UserDto> {
    const user = await this.userRepository.findOneBy({ email });
    const credential = await this.userCredentialRepository.findOne({
      where: { user_id: user.user_id, type: 'password' },
      order: { created_at: 'DESC' },
    });

    const doesMatch = await bcrypt.compare(password, credential.hash);
    if (doesMatch) {
      return User.parse(user);
    }
    throw new UnauthorizedException();
  }

  async create(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    return await this.eventRepository.publish('user:credential:created', {
      user_id: user.user_id,
      user_credential_id: randomUUID(),
      type: 'password',
      salt,
      hash,
    });
  }
}
