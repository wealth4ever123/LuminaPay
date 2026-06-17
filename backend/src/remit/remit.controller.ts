import { Controller, Post, Body } from '@nestjs/common';
import { RemitService, RemitDto } from './remit.service';

@Controller('remit')
export class RemitController {
  constructor(private readonly remitService: RemitService) {}

  @Post()
  remit(@Body() dto: RemitDto) {
    return this.remitService.remit(dto);
  }
}
