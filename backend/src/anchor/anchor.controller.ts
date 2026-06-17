import { Controller, Post, Body } from '@nestjs/common';
import { AnchorService, Sep12RegisterDto, Sep6DepositDto, Sep6WithdrawDto } from './anchor.service';

@Controller('anchor')
export class AnchorController {
  constructor(private readonly anchorService: AnchorService) {}

  @Post('register')
  register(@Body() dto: Sep12RegisterDto) {
    return this.anchorService.register(dto);
  }

  @Post('deposit')
  deposit(@Body() dto: Sep6DepositDto) {
    return this.anchorService.deposit(dto);
  }

  @Post('withdraw')
  withdraw(@Body() dto: Sep6WithdrawDto) {
    return this.anchorService.withdraw(dto);
  }
}
