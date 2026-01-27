import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { CustomLoggerService } from './logger.service';
import { createWinstonConfig } from './logger.config';

/**
 * 全局日志模块
 */
@Global()
@Module({
  imports: [
    WinstonModule.forRoot(createWinstonConfig()),
  ],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggerModule {}
