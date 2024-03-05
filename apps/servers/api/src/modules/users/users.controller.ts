import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  @Get()
  getMany() {
    return this.usersService.getMany();
  }

  @Put()
  createOne() {
    return this.usersService.create();
  }

  @Get(':id')
  getOne(@Param('id') userId: string, @Body() params) {
    return this.usersService.getOne({ userId });
  }

  @Patch(':id')
  updateOne(@Param('id') userId: string, @Body() body) {
    this.usersService.update({ userId, ...body });
  }

  constructor(private usersService: UsersService) {}
}
