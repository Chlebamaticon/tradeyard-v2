import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';

import {
  CreateComplaintMessageDto,
  GetComplaintMessagesDto,
  GetComplaintMessagesParamsDto,
  GetComplaintMessagesQueryParamsDto,
} from '@tradeyard-v2/api-dtos';
import {
  ComplaintMessageViewEntity,
  EventRepository,
} from '@tradeyard-v2/server/database';

import { mapToComplaintMessageDto } from '../../../mappers';

@Injectable()
export class ComplaintMessageService {
  constructor(
    @InjectRepository(ComplaintMessageViewEntity)
    readonly complaintMessageViewRepository: Repository<ComplaintMessageViewEntity>,
    readonly eventRepository: EventRepository
  ) {}

  async create({
    complaint_id,
    user_id,
    sent_at,
    body,
  }: {
    complaint_id: string;
    user_id: string;
    sent_at: Date;
    body: string;
  }): Promise<CreateComplaintMessageDto> {
    const complaint_message_id = crypto.randomUUID();
    await this.eventRepository.publish('complaint:message:created', {
      complaint_id,
      complaint_message_id,
      user_id,
      sent_at,
      body,
    });

    const complaintMessage =
      await this.complaintMessageViewRepository.findOneByOrFail({
        complaint_message_id,
      });
    return mapToComplaintMessageDto(complaintMessage);
  }

  async getMany({
    offset = 0,
    limit = 25,
    timestamp = Date.now(),
    complaint_id,
    recipient_id,
  }: GetComplaintMessagesParamsDto &
    GetComplaintMessagesQueryParamsDto & {
      recipient_id?: string;
    }): Promise<GetComplaintMessagesDto> {
    const where: FindOptionsWhere<ComplaintMessageViewEntity> = {};
    if (complaint_id) where.complaint_id = complaint_id;
    const [messages, total] =
      await this.complaintMessageViewRepository.findAndCount({
        where: {
          ...where,
          created_at: LessThan(new Date(timestamp)),
        },
        skip: offset,
        take: limit,
      });

    return {
      items: messages.map((message) =>
        mapToComplaintMessageDto({ ...message, recipient_id })
      ),
      total,
      offset,
      limit,
      timestamp,
    };
  }
}
