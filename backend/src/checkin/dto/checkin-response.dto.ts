import { ApiProperty } from '@nestjs/swagger';

export class CheckinResponseDto {
  @ApiProperty({ description: '签到结果消息', example: '签到成功' })
  message: string;

  @ApiProperty({ description: '签到日期', example: '2024-01-15' })
  checkinDate: string;

  @ApiProperty({ description: '签到时间' })
  checkinTime: Date;

  @ApiProperty({ description: '连续签到天数', example: 7 })
  consecutiveDays: number;

  @ApiProperty({ description: '累计签到天数', example: 30 })
  totalDays: number;
}

export class CheckinStatusDto {
  @ApiProperty({ description: '今日是否已签到', example: true })
  isCheckedInToday: boolean;

  @ApiProperty({ description: '上次签到日期', example: '2024-01-14', nullable: true })
  lastCheckinDate: string | null;

  @ApiProperty({ description: '连续签到天数', example: 7 })
  consecutiveDays: number;

  @ApiProperty({ description: '累计签到天数', example: 30 })
  totalDays: number;
}

export class CheckinHistoryItemDto {
  @ApiProperty({ description: '签到日期', example: '2024-01-15' })
  checkinDate: string;

  @ApiProperty({ description: '签到时间' })
  checkinTime: Date;
}

export class CheckinHistoryDto {
  @ApiProperty({ description: '签到历史记录', type: [CheckinHistoryItemDto] })
  history: CheckinHistoryItemDto[];

  @ApiProperty({ description: '连续签到天数', example: 7 })
  consecutiveDays: number;

  @ApiProperty({ description: '累计签到天数', example: 30 })
  totalDays: number;
}
