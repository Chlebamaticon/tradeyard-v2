import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';

import {
  User,
  UserDto,
  UserExtended,
  UserExtendedDto,
} from '@tradeyard-v2/api-dtos';
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

  async #matchUser(email: string, password: string): Promise<UserExtendedDto> {
    const { customer, merchant, moderator, ...user } =
      await this.userRepository.findOneOrFail({
        where: { email },
        relations: {
          customer: true,
          merchant: true,
          moderator: true,
        },
      });
    const credential = await this.userCredentialRepository.findOneOrFail({
      where: { user_id: user.user_id, type: 'password' },
      order: { created_at: 'DESC' },
    });

    const doesMatch = await bcrypt.compare(password, credential.hash);
    console.log(user);
    if (doesMatch) {
      return UserExtended.parse({
        ...user,
        customer_id: customer?.customer_id ?? null,
        merchant_id: merchant?.merchant_id ?? null,
        moderator_id: moderator?.moderator_id ?? null,
      });
    }
    throw new UnauthorizedException();
  }
}
