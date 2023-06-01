import { Module } from '@nestjs/common';
import {WinstonLogger} from "./winstonLogger.service";

@Module({
  providers: [WinstonLogger],
  exports: [WinstonLogger],
})
export class WinstonLoggerModule {}