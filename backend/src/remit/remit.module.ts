import { Module } from '@nestjs/common';
import { RemitController } from './remit.controller';
import { RemitService } from './remit.service';

@Module({ controllers: [RemitController], providers: [RemitService] })
export class RemitModule {}
