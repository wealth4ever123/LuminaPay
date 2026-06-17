import { Controller, Get, Query } from '@nestjs/common';
import { CorridorsService } from './corridors.service';

@Controller('corridors')
export class CorridorsController {
  constructor(private readonly corridorsService: CorridorsService) {}

  @Get()
  getCorridors(@Query('amount') amount?: string) {
    return this.corridorsService.getCorridors(amount ?? '10');
  }
}
