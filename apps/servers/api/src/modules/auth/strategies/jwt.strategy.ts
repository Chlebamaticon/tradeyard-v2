import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'jwt-decode';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { UserDto } from '@tradeyard-v2/api-dtos';
import {
  CustomerViewEntity,
  MerchantViewEntity,
  ModeratorViewEntity,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(UserViewEntity)
    private userRepository: Repository<UserViewEntity>,
    @InjectRepository(CustomerViewEntity)
    private customerRepository: Repository<CustomerViewEntity>,
    @InjectRepository(MerchantViewEntity)
    private merchantRepository: Repository<MerchantViewEntity>,
    @InjectRepository(ModeratorViewEntity)
    private moderatorRepository: Repository<ModeratorViewEntity>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: user_id } = payload;
    const [user, customer, merchant, moderator] = await Promise.all([
      this.userRepository.findOneByOrFail({
        user_id,
      }),
      this.customerRepository.findOneBy({ user_id }),
      this.merchantRepository.findOneBy({ user_id }),
      this.moderatorRepository.findOneBy({ user_id }),
    ]);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      ...user,
      customer_id: customer?.customer_id ?? null,
      merchant_id: merchant?.merchant_id ?? null,
      moderator_id: moderator?.moderator_id ?? null,
    };
  }
}

declare module 'express' {
  interface Request {
    user: UserDto & {
      merchant_id?: string;
      customer_id?: string;
      moderator_id?: string;
    };
  }
}
