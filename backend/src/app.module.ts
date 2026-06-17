import { Module } from '@nestjs/common';
import { RemitModule } from './remit/remit.module';
import { CorridorsModule } from './corridors/corridors.module';
import { AnchorModule } from './anchor/anchor.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [RemitModule, CorridorsModule, AnchorModule, StatusModule],
})
export class AppModule {}
