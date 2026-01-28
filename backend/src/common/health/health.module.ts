import { Module, Global } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { LoggerModule } from '../logger';

/**
 * 全局健康检查模块
 * 提供系统健康监控功能
 */
@Global()
@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forFeature([]), // 为 TypeOrmHealthIndicator 提供必要的上下文
    LoggerModule,
  ],
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class HealthModule {}
