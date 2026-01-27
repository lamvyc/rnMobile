import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Checkin } from './entities/checkin.entity';
import { UsersService } from '../users/users.service';
import {
  CheckinResponseDto,
  CheckinStatusDto,
  CheckinHistoryDto,
} from './dto/checkin-response.dto';
import { DateUtil } from '../common/utils';

// 让类变成可注入的 Service
@Injectable()
export class CheckinService {
  constructor(
    // 注入该实体的数据库仓库用于 CRUD。
    @InjectRepository(Checkin)
    private checkinRepository: Repository<Checkin>,
    private usersService: UsersService,
  ) {}

  /**
   * 执行签到
   */
  async checkin(userId: string): Promise<CheckinResponseDto> {
    const today = this.getTodayDateString();
    const now = new Date();

    // 检查今天是否已签到
    const existingCheckin = await this.checkinRepository.findOne({
      where: {
        userId,
        checkinDate: today,
      },
    });

    if (existingCheckin) {
      throw new BadRequestException('今天已经签到过了');
    }

    // 创建签到记录
    const checkin = this.checkinRepository.create({
      userId,
      checkinDate: today,
      checkinTime: now,
    });

    await this.checkinRepository.save(checkin);

    // 更新用户最后签到时间
    await this.usersService.updateLastCheckin(userId, now);

    // 计算签到统计
    const consecutiveDays = await this.calculateConsecutiveDays(userId);
    const totalDays = await this.calculateTotalDays(userId);

    return {
      message: '签到成功',
      checkinDate: today,
      checkinTime: DateUtil.formatDateTime(now),
      consecutiveDays,
      totalDays,
    };
  }

  /**
   * 查询今日签到状态
   */
  async getCheckinStatus(userId: string): Promise<CheckinStatusDto> {
    const today = this.getTodayDateString();

    const todayCheckin = await this.checkinRepository.findOne({
      where: {
        userId,
        checkinDate: today,
      },
    });

    const lastCheckin = await this.checkinRepository.findOne({
      where: { userId },
      order: { checkinDate: 'DESC' },
    });

    const consecutiveDays = await this.calculateConsecutiveDays(userId);
    const totalDays = await this.calculateTotalDays(userId);

    return {
      isCheckedInToday: !!todayCheckin,
      lastCheckinDate: lastCheckin?.checkinDate || null,
      consecutiveDays,
      totalDays,
    };
  }

  /**
   * 查询签到历史（最近30天）
   */
  async getCheckinHistory(userId: string): Promise<CheckinHistoryDto> {
    const thirtyDaysAgo = DateUtil.addDays(new Date(), -30);
    const startDate = DateUtil.formatDate(thirtyDaysAgo);

    const history = await this.checkinRepository.find({
      where: {
        userId,
        checkinDate: MoreThanOrEqual(startDate),
      },
      order: { checkinDate: 'DESC' },
    });

    const consecutiveDays = await this.calculateConsecutiveDays(userId);
    const totalDays = await this.calculateTotalDays(userId);

    return {
      history: history.map((item) => ({
        checkinDate: item.checkinDate,
        checkinTime: DateUtil.formatDateTime(item.checkinTime),
      })),
      consecutiveDays,
      totalDays,
    };
  }

  /**
   * 计算连续签到天数
   */
  async calculateConsecutiveDays(userId: string): Promise<number> {
    const checkins = await this.checkinRepository.find({
      where: { userId },
      order: { checkinDate: 'DESC' },
    });

    if (checkins.length === 0) {
      return 0;
    }

    let consecutiveDays = 0;
    let currentDate = new Date();

    // 如果今天没签到，从昨天开始算
    const today = this.getTodayDateString();
    if (checkins[0].checkinDate !== today) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (const checkin of checkins) {
      const checkinDateStr = checkin.checkinDate;
      const expectedDateStr = DateUtil.formatDate(currentDate);

      if (checkinDateStr === expectedDateStr) {
        consecutiveDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return consecutiveDays;
  }

  /**
   * 计算总签到天数
   */
  async calculateTotalDays(userId: string): Promise<number> {
    return await this.checkinRepository.count({
      where: { userId },
    });
  }

  /**
   * 获取今天的日期字符串 (YYYY-MM-DD)
   */
  private getTodayDateString(): string {
    return DateUtil.getTodayDate();
  }
}
