import { Controller, Delete, Get, Param, Patch, Put } from '@nestjs/common';

@Controller()
export class UsersController {
  @Get()
  getMany() {
    return;
  }

  @Put()
  createOne() {}

  @Get(':user_id')
  getOne(@Param() params) {}

  @Patch(':user_id')
  updateOne(@Param() params) {}

  @Delete(':user_id')
  deleteOne(@Param() params) {}
}
