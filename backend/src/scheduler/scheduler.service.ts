import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { Checkin } from '../checkin/entities/checkin.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Checkin)
    private checkinRepository: Repository<Checkin>,
    private notificationsService: NotificationsService,
    @InjectRedis()
    private readonly redis: Redis,
    private dataSource: DataSource,
  ) {}

  /**
   * 签到检查任务
   * 每天凌晨1点执行
   * 检查连续2天未签到的用户并发送通知
   */
  @Cron('0 1 * * *', {
    name: 'checkin-check',
    timeZone: 'Asia/Shanghai',
  })
  async handleCheckinCheck() {
    this.logger.log('===== 开始执行签到检查任务 =====');
    const startTime = Date.now();

    try {
      // 1. 查询所有活跃用户
      const users = await this.userRepository.find({
        where: { status: UserStatus.ACTIVE },
      });

      this.logger.log(`找到 ${users.length} 个活跃用户`);

      // 2. 计算2天前的日期（不包括今天）
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      twoDaysAgo.setHours(0, 0, 0, 0);

      this.logger.log(`2天前的日期: ${twoDaysAgo.toISOString()}`);

      let notifiedCount = 0;
      let skippedCount = 0;

      // 3. 检查每个用户
      for (const user of users) {
        try {
          // 如果最近2天没有签到记录，发送通知
          if (user.lastCheckinAt && user.lastCheckinAt < twoDaysAgo) {
            const daysSinceLastCheckin = Math.floor(
              (Date.now() - user.lastCheckinAt.getTime()) / (1000 * 60 * 60 * 24),
            );

            this.logger.log(
              `用户 ${user.phone} 已连续 ${daysSinceLastCheckin} 天未签到，发送通知`,
            );

            // 发送通知
            await this.notificationsService.sendCheckinAlert(user.id, daysSinceLastCheckin);
            notifiedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          this.logger.error(
            `处理用户 ${user.id} 时出错: ${error.message}`,
            error.stack,
          );
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `===== 签到检查任务完成 =====\n` +
        `  总用户数: ${users.length}\n` +
        `  发送通知: ${notifiedCount}\n` +
        `  跳过: ${skippedCount}\n` +
        `  耗时: ${duration}ms`,
      );
    } catch (error) {
      this.logger.error(`签到检查任务执行失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 健康检查任务
   * 每小时执行一次
   * 检查数据库和Redis连接状态
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'health-check',
  })
  async handleHealthCheck() {
    this.logger.debug('执行健康检查...');

    const health = {
      timestamp: new Date().toISOString(),
      database: 'unknown',
      redis: 'unknown',
    };

    try {
      // 检查数据库连接
      await this.dataSource.query('SELECT 1');
      health.database = 'healthy';
      this.logger.debug('数据库连接正常');
    } catch (error) {
      health.database = 'unhealthy';
      this.logger.error(`数据库连接异常: ${error.message}`);
    }

    try {
      // 检查Redis连接
      await this.redis.ping();
      health.redis = 'healthy';
      this.logger.debug('Redis连接正常');
    } catch (error) {
      health.redis = 'unhealthy';
      this.logger.error(`Redis连接异常: ${error.message}`);
    }

    // 如果有异常，记录警告
    if (health.database === 'unhealthy' || health.redis === 'unhealthy') {
      this.logger.warn(`健康检查发现异常: ${JSON.stringify(health)}`);
    } else {
      this.logger.debug('所有服务健康');
    }

    return health;
  }

  /**
   * 手动触发签到检查（用于测试）
   */
  async triggerCheckinCheck() {
    this.logger.log('手动触发签到检查任务');
    return this.handleCheckinCheck();
  }

  /**
   * 手动触发健康检查（用于测试）
   */
  async triggerHealthCheck() {
    this.logger.log('手动触发健康检查任务');
    return this.handleHealthCheck();
  }
}