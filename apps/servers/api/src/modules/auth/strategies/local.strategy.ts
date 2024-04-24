import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';

import { User, UserDto } from '@tradeyard-v2/api-dtos';
import {
  UserCredentialViewEntity,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @InjectRepository(UserViewEntity)
    private userRepository: Repository<UserViewEntity>,
    @InjectRepository(UserCredentialViewEntity)
    private userCredentialRepository: Repository<UserCredentialViewEntity>
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<UserDto> {
    const user = await this.#matchUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async #matchUser(email: string, password: string): Promise<UserDto> {
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
}
