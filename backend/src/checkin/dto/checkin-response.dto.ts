export class CheckinResponseDto {
  message: string;
  checkinDate: string;
  checkinTime: Date;
  consecutiveDays: number;
  totalDays: number;
}

export class CheckinStatusDto {
  isCheckedInToday: boolean;
  lastCheckinDate: string | null;
  consecutiveDays: number;
  totalDays: number;
}

export class CheckinHistoryItemDto {
  checkinDate: string;
  checkinTime: Date;
}

export class CheckinHistoryDto {
  history: CheckinHistoryItemDto[];
  consecutiveDays: number;
  totalDays: number;
}
