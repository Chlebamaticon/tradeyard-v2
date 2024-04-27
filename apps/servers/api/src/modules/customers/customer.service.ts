import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import {
  CreateCustomer,
  CreateCustomerBodyDto,
  CreateCustomerDto,
  Customer,
  CustomerDto,
  GetCustomer,
  GetCustomerDto,
  GetCustomerPathParamsDto,
  GetCustomersDto,
  GetCustomersQueryParamsDto,
  UpdateCustomerBodyDto,
  UpdateCustomerDto,
} from '@tradeyard-v2/api-dtos';
import {
  CustomerViewEntity,
  EventRepository,
  UserViewEntity,
} from '@tradeyard-v2/server/database';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(REQUEST) readonly request: Express.Request,
    @InjectRepository(CustomerViewEntity)
    readonly customerRepository: Repository<CustomerViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async getOne(params: GetCustomerPathParamsDto): Promise<GetCustomerDto> {
    const customer = await this.#queryBuilder({
      ...params,
    }).getOneOrFail();

    return GetCustomer.parse(this.mapToCustomerDto(customer));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetCustomersQueryParamsDto): Promise<GetCustomersDto> {
    const qb = await this.#queryBuilder({
      created_at: new Date(timestamp),
    });

    if (offset !== undefined) qb.skip(offset);
    if (limit !== undefined) qb.take(limit);

    const [customers, total] = await qb.getManyAndCount();

    return {
      items: customers.map((customer) => this.mapToCustomerDto(customer)),
      total,
      offset,
      limit,
      timestamp,
    };
  }

  async createOne({
    first_name,
    last_name,
    email,
  }: CreateCustomerBodyDto): Promise<CreateCustomerDto> {
    const userCreatedEvent = await this.eventRepository.publish(
      'user:created',
      {
        user_id: randomUUID(),
        first_name,
        last_name,
        email,
      }
    );
    const customerCreatedEvent = await this.eventRepository.publish(
      'customer:created',
      {
        customer_id: randomUUID(),
        user_id: userCreatedEvent.body.user_id,
      }
    );
    const customer = await this.#queryBuilder({
      customer_id: customerCreatedEvent.body.customer_id,
    }).getOneOrFail();

    return CreateCustomer.parse(this.mapToCustomerDto(customer));
  }

  async updateOne(body: UpdateCustomerBodyDto): Promise<UpdateCustomerDto> {
    const customer = await this.customerRepository.findOneOrFail({
      where: { customer_id: body.customer_id },
    });

    const isValid = false;
    if (isValid) {
      await this.eventRepository.publish('customer:updated', {
        customer_id: customer.customer_id,
      });
    }

    return this.mapToCustomerDto(
      await this.customerRepository.findOneOrFail({
        where: { customer_id: body.customer_id },
      })
    );
  }

  mapToCustomerDto({
    user,
    ...customer
  }: CustomerViewEntity & { user?: UserViewEntity }): CustomerDto {
    return Customer.parse({
      ...customer,
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
    });
  }

  #queryBuilder(where: FindOptionsWhere<CustomerViewEntity> = {}) {
    return this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndMapOne(
        'customer.user',
        UserViewEntity,
        'user',
        `"user"."user_id" = "customer"."user_id"`
      )
      .where(where);
  }
}
