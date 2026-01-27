import { Injectable, Inject, LoggerService as NestLoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * 自定义日志服务
 * 封装 Winston Logger，提供统一的日志接口
 */
@Injectable()
export class CustomLoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * 记录普通信息
   */
  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  /**
   * 记录错误信息
   */
  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  /**
   * 记录警告信息
   */
  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  /**
   * 记录调试信息
   */
  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  /**
   * 记录详细信息
   */
  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  /**
   * 记录 HTTP 请求
   */
  logRequest(method: string, url: string, statusCode: number, duration: number, userAgent?: string) {
    this.logger.info('HTTP Request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userAgent,
      context: 'HTTP',
    });
  }

  /**
   * 记录数据库查询（生产环境可关闭）
   */
  logQuery(query: string, parameters?: any[], duration?: number) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug('Database Query', {
        query,
        parameters,
        duration: duration ? `${duration}ms` : undefined,
        context: 'Database',
      });
    }
  }

  /**
   * 记录业务操作
   */
  logBusiness(action: string, userId?: string, details?: any) {
    this.logger.info('Business Operation', {
      action,
      userId,
      details,
      context: 'Business',
    });
  }

  /**
   * 记录安全事件
   */
  logSecurity(event: string, userId?: string, ip?: string, details?: any) {
    this.logger.warn('Security Event', {
      event,
      userId,
      ip,
      details,
      context: 'Security',
    });
  }

  /**
   * 记录性能指标
   */
  logPerformance(operation: string, duration: number, details?: any) {
    const level = duration > 3000 ? 'warn' : 'info';
    this.logger[level]('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      details,
      context: 'Performance',
    });
  }
}