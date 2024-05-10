import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import {
  CreateComplaintMessageBody,
  CreateComplaintMessageBodyDto,
  GetComplaintMessages,
  GetComplaintMessagesDto,
  UserDto,
} from '@tradeyard-v2/api-dtos';

import { User } from '../auth';

import { ComplaintMessageService } from './complaint-message.service';

@Controller()
export class ComplaintMessagesController {
  constructor(private complaintMessage: ComplaintMessageService) {}

  @Get()
  async getMany(
    @Param('complaint_id') complaint_id: string,
    @User() user: UserDto
  ): Promise<GetComplaintMessagesDto> {
    return GetComplaintMessages.parse(
      await this.complaintMessage.getMany({
        complaint_id,
        recipient_id: user.user_id,
      })
    );
  }

  @Post()
  async createOne(
    @Param('complaint_id') complaint_id: string,
    @User() user: UserDto,
    @Body() data: CreateComplaintMessageBodyDto
  ) {
    const validatedData = CreateComplaintMessageBody.parse({
      ...data,
      sent_at: new Date(data.sent_at),
    });
    return this.complaintMessage.create({
      complaint_id,
      user_id: user.user_id,
      sent_at: validatedData.sent_at,
      body: validatedData.body,
    });
  }
}
