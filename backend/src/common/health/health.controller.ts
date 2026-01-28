import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomLoggerService } from '../logger';

/**
 * 健康检查控制器
 * 提供系统健康状况监控端点
 */
@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private readonly logger: CustomLoggerService,
  ) {}

  /**
   * 基本健康检查 - 应用是否正常运行
   */
  @Get()
  @ApiOperation({
    summary: '基础健康检查',
    description: '检查应用是否能正常响应请求',
  })
  @ApiResponse({ status: 200, description: '应用运行正常' })
  check() {
    this.logger.log('Health check requested', 'HealthController');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * 全面健康检查 - 包括所有依赖服务
   */
  @Get('full')
  @HealthCheck()
  @ApiOperation({
    summary: '全面健康检查',
    description: '检查应用及其所有依赖服务（数据库、内存、磁盘等）的健康状态',
  })
  @ApiResponse({ status: 200, description: '所有服务运行正常' })
  @ApiResponse({ status: 503, description: '部分服务异常' })
  async fullCheck() {
    this.logger.log('Full health check requested', 'HealthController');

    return this.health.check([
      // 数据库健康检查
      () => this.db.pingCheck('database', { timeout: 3000 }),

      // 内存健康检查
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB 阈值
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB 阈值

      // 磁盘健康检查
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9, // 90% 使用率警告
        }),
    ]);
  }

  /**
   * 数据库健康检查
   */
  @Get('database')
  @HealthCheck()
  @ApiOperation({
    summary: '数据库健康检查',
    description: '检查数据库连接状态',
  })
  @ApiResponse({ status: 200, description: '数据库连接正常' })
  @ApiResponse({ status: 503, description: '数据库连接异常' })
  async databaseCheck() {
    this.logger.debug('Database health check requested', 'HealthController');

    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 5000 }),
    ]);
  }

  /**
   * 内存健康检查
   */
  @Get('memory')
  @HealthCheck()
  @ApiOperation({ summary: '内存健康检查', description: '检查内存使用情况' })
  @ApiResponse({ status: 200, description: '内存使用正常' })
  @ApiResponse({ status: 503, description: '内存使用过高' })
  async memoryCheck() {
    this.logger.debug('Memory health check requested', 'HealthController');

    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB 阈值
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024), // 500MB 阈值
    ]);
  }

  /**
   * 磁盘健康检查
   */
  @Get('disk')
  @HealthCheck()
  @ApiOperation({
    summary: '磁盘健康检查',
    description: '检查磁盘空间使用情况',
  })
  @ApiResponse({ status: 200, description: '磁盘空间正常' })
  @ApiResponse({ status: 503, description: '磁盘空间不足' })
  async diskCheck() {
    this.logger.debug('Disk health check requested', 'HealthController');

    return this.health.check([
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.85, // 85% 使用率警告
        }),
    ]);
  }
}
