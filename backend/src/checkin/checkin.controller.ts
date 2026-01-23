import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CheckinResponseDto,
  CheckinStatusDto,
  CheckinHistoryDto,
} from './dto/checkin-response.dto';

@Controller('checkin')
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
