import { Body, Controller, Post } from '@nestjs/common';

import {
  CreateModerator,
  CreateModeratorBody,
  CreateModeratorBodyDto,
  CreateModeratorDto,
} from '@tradeyard-v2/api-dtos';

import { ModeratorService } from '../services';

@Controller()
export class ModeratorsController {
  constructor(private moderatorService: ModeratorService) {}

  @Post()
  async createOne(
    @Body() body: CreateModeratorBodyDto
  ): Promise<CreateModeratorDto> {
    const validatedBody = CreateModeratorBody.parse(body);
    return CreateModerator.parse(
      await this.moderatorService.createOne(validatedBody)
    );
  }
}
