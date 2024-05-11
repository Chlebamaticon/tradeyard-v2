import assert from 'assert';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { getAddress } from 'viem';

import {
  ComplaintDto,
  CreateComplaintBodyDto,
  GetComplaintDto,
  GetComplaintParamsDto,
  GetComplaintsDto,
  GetComplaintsParamsDto,
  GetComplaintsQueryParamsDto,
  UpdateComplaintBodyDto,
} from '@tradeyard-v2/api-dtos';
import {
  ComplaintViewEntity,
  CustomerViewEntity,
  EventRepository,
  MerchantViewEntity,
  OrderViewEntity,
} from '@tradeyard-v2/server/database';

import { mapToComplaintDto } from '../../mappers';

import { ComplaintContractFacade } from './complaint-contract.facade';
import { ComplaintMessageService } from './complaint-message.service';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(MerchantViewEntity)
    readonly merchantViewRepository: Repository<MerchantViewEntity>,
    @InjectRepository(CustomerViewEntity)
    readonly customerViewRepository: Repository<CustomerViewEntity>,
    @InjectRepository(OrderViewEntity)
    readonly orderViewRepository: Repository<OrderViewEntity>,
    @InjectRepository(ComplaintViewEntity)
    readonly complaintViewRepository: Repository<ComplaintViewEntity>,
    readonly complaintMessageService: ComplaintMessageService,
    readonly complaintContractFacade: ComplaintContractFacade,
    readonly eventRepository: EventRepository
  ) {}

  async create({
    user_id,
    order_id,
    body,
    sent_at,
  }: CreateComplaintBodyDto & {
    user_id: string;
  }): Promise<ComplaintDto> {
    assert.ok(
      !(await this.complaintViewRepository.findOneBy({ order_id })),
      'Complaint is already open for that order'
    );

    const order = await this.orderViewRepository.findOneByOrFail({ order_id });
    const isCustomer = await this.customerViewRepository.existsBy({
      customer_id: order.customer_id,
      user_id,
    });
    const isMerchant = await this.merchantViewRepository.existsBy({
      merchant_id: order.merchant_id,
      user_id,
    });

    assert.ok(isCustomer || isMerchant, 'Cannot complaint on not your order');

    const complaint_id = crypto.randomUUID();
    await this.eventRepository.publish('complaint:created', {
      complaint_id,
      order_id,
      user_id,
    });

    await this.eventRepository.publish('complaint:message:created', {
      user_id,
      complaint_id,
      complaint_message_id: crypto.randomUUID(),
      body,
      sent_at,
    });

    return this.getOne({ complaint_id });
  }

  async getOne({
    complaint_id,
  }: GetComplaintParamsDto): Promise<GetComplaintDto> {
    const complaint = await this.complaintViewRepository.findOneOrFail({
      where: { complaint_id },
      relations: {
        messages: true,
      },
    });

    return mapToComplaintDto(complaint);
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
    complaint_id,
    recipient_id,
  }: GetComplaintsParamsDto &
    GetComplaintsQueryParamsDto & {
      recipient_id?: string;
    }): Promise<GetComplaintsDto> {
    const [complaints, total] = await this.complaintViewRepository.findAndCount(
      {
        where: {
          complaint_id,
          created_at: LessThan(new Date(timestamp)),
        },
        skip: offset,
        take: limit,
        relations: {
          messages: true,
        },
      }
    );

    return {
      items: complaints.map((order) =>
        mapToComplaintDto({ recipient_id, ...order })
      ),
      total,
      offset,
      limit,
      timestamp,
    };
  }

  async updateOne({
    complaint_id,
    moderator_id,
    decision,
  }: UpdateComplaintBodyDto & {
    complaint_id: string;
    moderator_id: string;
  }): Promise<ComplaintDto> {
    console.log('complaint_id', complaint_id);
    console.log('moderator_id', moderator_id);
    console.log('decision', decision);
    const complaint = await this.complaintViewRepository.findOneOrFail({
      where: { complaint_id },
    });
    console.log('complaint', complaint);
    const { contract } = await this.orderViewRepository.findOneOrFail({
      where: { order_id: complaint.order_id },
      relations: {
        contract: true,
      },
    });
    console.log('contract', contract);
    switch (decision) {
      case 'refunded':
        await this.complaintContractFacade.refund({
          address: getAddress(contract.contract_address),
        });
        await this.eventRepository.publish('complaint:decision:refunded', {
          complaint_id,
          moderator_id,
          status: 'refunded',
          status_at: new Date(),
        });
        break;
      case 'released':
        await this.complaintContractFacade.release({
          address: getAddress(contract.contract_address),
        });
        await this.eventRepository.publish('complaint:decision:released', {
          complaint_id,
          moderator_id,
          status: 'released',
          status_at: new Date(),
        });
        break;
      case 'rejected':
        await this.complaintContractFacade.reject({
          address: getAddress(contract.contract_address),
        });
        await this.eventRepository.publish('complaint:decision:rejected', {
          complaint_id,
          moderator_id,
          status: 'rejected',
          status_at: new Date(),
        });
        break;
      default:
        throw new Error(`Unknown "${decision}" decision`);
    }

    return this.getOne({ complaint_id });
  }
}
