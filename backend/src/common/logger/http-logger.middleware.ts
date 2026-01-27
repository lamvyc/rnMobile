import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from './logger.service';

/**
 * HTTP 请求日志中间件
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // 记录请求开始
    this.logger.debug(`Incoming request: ${method} ${originalUrl}`, 'HTTP');

    // 响应完成时记录
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      // 根据状态码选择日志级别
      if (statusCode >= 500) {
        this.logger.error(
          `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
          undefined,
          'HTTP',
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
          'HTTP',
        );
      } else {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
          'HTTP',
        );
      }

      // 记录详细请求信息
      this.logger.logRequest(method, originalUrl, statusCode, duration, userAgent);
    });

    next();
  }
}