import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import {
  CreateComplaintBody,
  CreateComplaintBodyDto,
  CreateComplaintDto,
  GetComplaint,
  GetComplaintParams,
  GetComplaints,
  GetComplaintsQueryParams,
  GetComplaintsQueryParamsDto,
  UserDto,
} from '@tradeyard-v2/api-dtos';

import { User } from '../auth';

import { ComplaintService } from './complaint.service';

@Controller()
export class ComplaintsController {
  constructor(private complaint: ComplaintService) {}

  @Post()
  create(
    @Body() body: CreateComplaintBodyDto,
    @User() user: UserDto
  ): Promise<CreateComplaintDto> {
    const validatedBody = CreateComplaintBody.parse({
      ...body,
      sent_at: new Date(body.sent_at),
    });
    return this.complaint.create({ ...validatedBody, user_id: user.user_id });
  }

  @Get(':complaint_id')
  async getOne(@Param() params: string) {
    const validatedParams = GetComplaintParams.parse(params);
    return GetComplaint.parse(await this.complaint.getOne(validatedParams));
  }

  @Get()
  getMany(
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
    @Query('timestamp', new ParseIntPipe({ optional: true }))
    timestamp = Date.now(),
    @Query('limit', new ParseIntPipe({ optional: true })) limit,
    @Query() queryParams: GetComplaintsQueryParamsDto
  ) {
    const validatedQueryParams = GetComplaintsQueryParams.parse({
      offset,
      timestamp,
      limit,
      ...queryParams,
    });
    return GetComplaints.parse(
      this.complaint.getMany({
        ...validatedQueryParams,
      })
    );
  }
}
