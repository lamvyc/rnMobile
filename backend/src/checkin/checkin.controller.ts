import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CheckinResponseDto,
  CheckinStatusDto,
  CheckinHistoryDto,
} from './dto/checkin-response.dto';

@ApiTags('签到')
@ApiBearerAuth('JWT-auth')
@Controller('checkin')
@UseGuards(JwtAuthGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  @ApiOperation({ summary: '每日签到', description: '用户进行每日签到，用于向紧急联系人报平安' })
  @ApiResponse({ status: 201, description: '签到成功', type: CheckinResponseDto })
  @ApiResponse({ status: 400, description: '今日已签到' })
  @ApiResponse({ status: 401, description: '未授权' })
  async checkin(@Request() req): Promise<CheckinResponseDto> {
    return this.checkinService.checkin(req.user.userId);
  }

  @Get('status')
  @ApiOperation({ summary: '获取签到状态', description: '获取当前用户的签到状态信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: CheckinStatusDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async getStatus(@Request() req): Promise<CheckinStatusDto> {
    return this.checkinService.getCheckinStatus(req.user.userId);
  }

  @Get('history')
  @ApiOperation({ summary: '获取签到历史', description: '获取当前用户的签到历史记录' })
  @ApiResponse({ status: 200, description: '获取成功', type: CheckinHistoryDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async getHistory(@Request() req): Promise<CheckinHistoryDto> {
    return this.checkinService.getCheckinHistory(req.user.userId);
  }
}
