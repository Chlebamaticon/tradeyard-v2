import { randomUUID } from 'crypto';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateUser,
  CreateUserBodyDto,
  CreateUserDto,
  User,
  UserDto,
  GetUser,
  GetUserDto,
  GetUserPathParamsDto,
  GetUsersDto,
  GetUsersQueryParamsDto,
  UpdateUserBodyDto,
  UpdateUserDto,
} from '@tradeyard-v2/api-dtos';
import { UserViewEntity, EventRepository } from '@tradeyard-v2/server/database';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserViewEntity)
    readonly userRepository: Repository<UserViewEntity>,
    @Inject(REQUEST) readonly request: Express.Request,
    readonly eventRepository: EventRepository
  ) {}

  async getOne({ user_id }: GetUserPathParamsDto): Promise<GetUserDto> {
    const user = await this.userRepository.findOneOrFail({
      where: {
        user_id,
      },
    });

    return GetUser.parse(this.mapToUserDto(user));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetUsersQueryParamsDto): Promise<GetUsersDto> {
    const [users, total] = await this.userRepository.findAndCount({
      where: {
        created_at: new Date(timestamp),
      },
      skip: offset,
      take: limit,
    });

    return {
      items: users.map((user) => this.mapToUserDto(user)),
      total,
      offset,
      limit,
    };
  }

  async createOne({
    first_name,
    last_name,
    email,
  }: CreateUserBodyDto): Promise<CreateUserDto> {
    if (await this.userRepository.existsBy({ email })) {
      throw new BadRequestException('User already exists');
    }

    const userCreatedEvent = await this.eventRepository.publish(
      'user:created',
      {
        user_id: randomUUID(),
        first_name,
        last_name,
        email,
      }
    );
    const user = await this.userRepository.findOneOrFail({
      where: { user_id: userCreatedEvent.body.user_id },
    });

    return CreateUser.parse(this.mapToUserDto(user));
  }

  async updateOne(body: UpdateUserBodyDto): Promise<UpdateUserDto> {
    const user = await this.userRepository.findOneOrFail({
      where: { user_id: body.user_id },
    });

    if (body.first_name || body.last_name || body.email) {
      await this.eventRepository.publish('user:updated', {
        user_id: user.user_id,
        first_name: body.first_name ?? user.first_name,
        last_name: body.last_name ?? user.last_name,
        email: body.email ?? user.email,
      });
    }

    const isValid = false;
    if (isValid) {
      await this.eventRepository.publish('user:updated', {
        user_id: randomUUID(),
      });
    }

    return this.mapToUserDto(
      await this.userRepository.findOneOrFail({
        where: { user_id: body.user_id },
      })
    );
  }

  mapToUserDto(user: UserViewEntity): UserDto {
    return User.parse({
      ...user,
    });
  }
}
