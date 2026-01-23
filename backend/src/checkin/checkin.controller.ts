import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CheckinResponseDto,
  CheckinStatusDto,
  CheckinHistoryDto,
} from './dto/checkin-response.dto';

/**
 * 用于为当前 Controller 下的所有路由接口统一添加 URL 前缀。
 *
 * 启用该装饰器后，各接口的实际访问路径将自动拼接此前缀：
 * - @Post()             → 实际路径：POST /checkin
 * - @Get('status')      → 实际路径：GET  /checkin/status
 * - @Get('history')     → 实际路径：GET  /checkin/history
 *
 * 若未使用此装饰器，则路由将直接基于根路径注册：
 * - @Post()             → POST /
 * - @Get('status')      → GET  /status
 * - @Get('history')     → GET  /history
 */
@Controller('checkin')
// 表示所有接口必须带 JWT 才能访问，即必须登录。
@UseGuards(JwtAuthGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  async checkin(@Request() req): Promise<CheckinResponseDto> {
    return this.checkinService.checkin(req.user.userId);
  }

  @Get('status')
  async getStatus(@Request() req): Promise<CheckinStatusDto> {
    return this.checkinService.getCheckinStatus(req.user.userId);
  }

  @Get('history')
  async getHistory(@Request() req): Promise<CheckinHistoryDto> {
    return this.checkinService.getCheckinHistory(req.user.userId);
  }
}
