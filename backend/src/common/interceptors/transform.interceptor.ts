import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { DateUtil } from '../utils';

/**
 * 响应数据格式
 */
export interface Response<T> {
  code: number;
  data: T;
  message: string;
  timestamp: string;
  path: string;
}

/**
 * 全局响应转换拦截器
 * 将所有成功的响应统一包装为标准格式
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    
    return next.handle().pipe(
      map((data) => {
        // 如果返回数据已经包含 code 字段，说明可能是自定义格式，直接返回
        if (data && typeof data === 'object' && 'code' in data) {
          return data;
        }

        // 提取 message（如果数据中有 message 字段）
        let message = '操作成功';
        let responseData = data;

        if (data && typeof data === 'object' && 'message' in data) {
          message = data.message;
          // 如果有其他数据，提取出来
          const { message: _, ...rest } = data;
          responseData = Object.keys(rest).length > 0 ? rest : data;
        }

        // 包装为统一格式
        return {
          code: 200,
          data: responseData,
          message: message,
          timestamp: DateUtil.formatDateTime(new Date()),
          path: request.url,
        };
      }),
    );
  }
}