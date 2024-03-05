import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { OffersService } from './offers.service';

@Controller()
export class OffersController {
  @Get()
  getMany() {}

  @Put()
  createOne() {}

  @Get(':id')
  getOne(@Param('id') id: string) {}

  @Patch(':id')
  updateOne(@Param('id') id: string) {}

  @Delete(':id')
  deleteOne(@Param('id') id: string) {}

  constructor(readonly offersService: OffersService) {}
}
