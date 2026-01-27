import { ApiProperty } from '@nestjs/swagger';

/**
 * 统一响应格式
 */
export class ResponseDto<T = any> {
  @ApiProperty({ description: '状态码：200 成功，其他为错误码', example: 200 })
  code: number;

  @ApiProperty({ description: '响应数据' })
  data?: T;

  @ApiProperty({ description: '响应消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '时间戳', example: '2024-01-27 17:30:00' })
  timestamp: string;

  @ApiProperty({ description: '请求路径', example: '/api/users' })
  path?: string;
}

/**
 * 分页响应格式
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: '数据列表' })
  items: T[];

  @ApiProperty({ description: '总数', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  pageSize: number;

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages: number;
}