import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUser,
  CreateUserBody,
  CreateUserBodyDto,
  CreateUserDto,
  User,
  UserDto,
  GetUser,
  GetUserDto,
  GetUserPathParams,
  GetUserPathParamsDto,
  GetUsers,
  GetUsersDto,
  GetUsersQueryParams,
  GetUsersQueryParamsDto,
  UpdateUserBody,
  UpdateUserBodyDto,
  UpdateUserDto,
} from '@tradeyard-v2/api-dtos';
import { UserViewEntity, EventRepository } from '@tradeyard-v2/server/database';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REQUEST) readonly request: Express.Request,
    @InjectRepository(UserViewEntity)
    readonly userRepository: Repository<UserViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async getOne({ user_id }: GetUserPathParamsDto): Promise<GetUserDto> {
    const customer = await this.userRepository.findOneOrFail({
      where: {
        user_id,
      },
    });

    return GetUser.parse(this.mapToUserDto(customer));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetUsersQueryParamsDto): Promise<GetUsersDto> {
    const [customers, total] = await this.userRepository.findAndCount({
      where: {
        created_at: new Date(timestamp),
      },
      skip: offset,
      take: limit,
    });

    return {
      items: customers.map((customer) => this.mapToUserDto(customer)),
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
    const userCreatedEvent = await this.eventRepository.publish(
      'user:created',
      {
        user_id: randomUUID(),
        first_name,
        last_name,
        email,
      }
    );
    const customer = await this.userRepository.findOneOrFail({
      where: { user_id: userCreatedEvent.body.user_id },
    });

    return CreateUser.parse(this.mapToUserDto(customer));
  }

  async updateOne(body: UpdateUserBodyDto): Promise<UpdateUserDto> {
    const customer = await this.userRepository.findOneOrFail({
      where: { user_id: body.user_id },
    });

    if (body.first_name || body.last_name || body.email) {
      await this.eventRepository.publish('user:updated', {
        user_id: customer.user_id,
        first_name: body.first_name ?? customer.first_name,
        last_name: body.last_name ?? customer.last_name,
        email: body.email ?? customer.email,
      });
    }

    const isValid = false;
    if (isValid) {
      const customerCreatedEvent = await this.eventRepository.publish(
        'customer:updated',
        {
          user_id: randomUUID(),
        }
      );
    }

    return this.mapToUserDto(
      await this.userRepository.findOneOrFail({
        where: { user_id: body.user_id },
      })
    );
  }

  mapToUserDto(customer: UserViewEntity): UserDto {
    return User.parse({
      ...customer,
    });
  }
}
