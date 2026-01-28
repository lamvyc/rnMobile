import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DateUtil } from '../utils';

/**
 * 全局HTTP异常过滤器
 * 统一处理所有HTTP异常，返回标准格式
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // 获取异常响应内容
    const exceptionResponse = exception.getResponse();

    // 提取错误消息
    let message = exception.message;
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;
      // 优先使用 message 字段，如果是数组则取第一个
      if (Array.isArray(responseObj.message)) {
        message = responseObj.message[0];
      } else if (responseObj.message) {
        message = responseObj.message;
      } else if (responseObj.error) {
        message = responseObj.error;
      }
    }

    // 构造统一响应格式
    const errorResponse = {
      code: status,
      data: null,
      message: message || '请求失败',
      timestamp: DateUtil.formatDateTime(new Date()),
      path: request.url,
    };

    // 记录错误日志（500 错误记录详细堆栈）
    if (status >= 500) {
      this.logger.error(
        `Internal Server Error: ${request.method} ${request.url}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `Client Error: ${request.method} ${request.url} - ${status} ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
