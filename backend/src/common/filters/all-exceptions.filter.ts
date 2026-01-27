import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DateUtil } from '../utils';

/**
 * 全局异常过滤器
 * 捕获所有未处理的异常（包括非HTTP异常）
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 判断是否为HTTP异常
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // 提取错误消息
    let message = '服务器内部错误';
    if (isHttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message[0];
        } else if (responseObj.message) {
          message = responseObj.message;
        } else if (responseObj.error) {
          message = responseObj.error;
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 构造统一响应格式
    const errorResponse = {
      code: status,
      data: null,
      message: message,
      timestamp: DateUtil.formatDateTime(new Date()),
      path: request.url,
    };

    // 记录错误日志
    if (status >= 500) {
      this.logger.error(
        `[${status}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `[${status}] ${request.method} ${request.url} - ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}