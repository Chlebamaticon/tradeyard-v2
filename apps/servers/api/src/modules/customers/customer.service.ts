import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';

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

import { UserService } from '../users';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(REQUEST) readonly request: Express.Request,
    @InjectRepository(CustomerViewEntity)
    readonly customerRepository: Repository<CustomerViewEntity>,
    readonly eventRepository: EventRepository,
    readonly userService: UserService
  ) {}

  async getOne(params: GetCustomerPathParamsDto): Promise<GetCustomerDto> {
    const customer = await this.customerRepository.findOneOrFail({
      where: {
        ...params,
      },
      relations: { user: true },
    });

    return GetCustomer.parse(this.mapToCustomerDto(customer));
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
  }: GetCustomersQueryParamsDto): Promise<GetCustomersDto> {
    const [customers, total] = await this.customerRepository.findAndCount({
      where: { created_at: LessThan(new Date(timestamp)) },
      skip: offset,
      take: limit,
    });

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
    const { user_id } = await this.userService.createOne({
      first_name,
      last_name,
      email,
    });
    const customerCreatedEvent = await this.eventRepository.publish(
      'customer:created',
      {
        customer_id: randomUUID(),
        user_id,
      }
    );
    const customer = await this.customerRepository.findOneOrFail({
      where: { customer_id: customerCreatedEvent.body.customer_id },
      relations: { user: true },
    });

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
}
