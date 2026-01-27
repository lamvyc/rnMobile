import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog, NotificationType, NotificationStatus } from './entities/notification-log.entity';
import { SmsService } from './services/sms.service';
import { EmailService } from './services/email.service';
import { UsersService } from '../users/users.service';
import { ContactsService } from '../contacts/contacts.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationLog)
    private notificationLogRepository: Repository<NotificationLog>,
    private smsService: SmsService,
    private emailService: EmailService,
    private usersService: UsersService,
    private contactsService: ContactsService,
  ) {}

  /**
   * 发送未签到警告通知
   * 策略：优先短信，失败则发邮件
   */
  async sendCheckinAlert(userId: string, days: number): Promise<void> {
    this.logger.log(`开始发送未签到警告通知: userId=${userId}, days=${days}`);

    try {
      // 1. 获取用户信息
      const user = await this.usersService.findById(userId);
      if (!user) {
        this.logger.error(`用户不存在: userId=${userId}`);
        return;
      }

      // 2. 获取紧急联系人
      const contact = await this.contactsService.findPrimaryContact(userId);
      if (!contact) {
        this.logger.warn(`用户没有配置紧急联系人: userId=${userId}`);
        return;
      }

      const userName = user.nickname || `用户${user.phone.slice(-4)}`;

      // 3. 优先发送短信
      this.logger.log(`尝试发送短信: phone=${contact.phone}`);
      const smsResult = await this.smsService.sendCheckinAlert(
        contact.phone,
        userName,
        days,
      );

      if (smsResult.success) {
        // 短信发送成功，记录日志
        await this.saveNotificationLog({
          userId,
          contactId: contact.id,
          type: NotificationType.SMS,
          status: NotificationStatus.SUCCESS,
          content: `【称平安】您的亲友${userName}已连续${days}天未签到，请及时关注其安全状况。`,
        });
        this.logger.log(`短信发送成功: userId=${userId}, contactId=${contact.id}`);
        return;
      }

      // 4. 短信失败，尝试发送邮件
      this.logger.warn(`短信发送失败，尝试发送邮件: ${smsResult.error}`);
      await this.saveNotificationLog({
        userId,
        contactId: contact.id,
        type: NotificationType.SMS,
        status: NotificationStatus.FAILED,
        content: `【称平安】您的亲友${userName}已连续${days}天未签到，请及时关注其安全状况。`,
        errorMessage: smsResult.error,
      });

      // 检查是否有邮箱
      if (!contact.email) {
        this.logger.error(`联系人没有配置邮箱，无法发送邮件通知: contactId=${contact.id}`);
        return;
      }

      this.logger.log(`尝试发送邮件: email=${contact.email}`);
      const emailResult = await this.emailService.sendCheckinAlert(
        contact.email,
        userName,
        days,
      );

      if (emailResult.success) {
        // 邮件发送成功，记录日志
        await this.saveNotificationLog({
          userId,
          contactId: contact.id,
          type: NotificationType.EMAIL,
          status: NotificationStatus.SUCCESS,
          content: `您的亲友${userName}已连续${days}天未签到`,
        });
        this.logger.log(`邮件发送成功: userId=${userId}, contactId=${contact.id}`);
      } else {
        // 邮件也失败，记录日志
        await this.saveNotificationLog({
          userId,
          contactId: contact.id,
          type: NotificationType.EMAIL,
          status: NotificationStatus.FAILED,
          content: `您的亲友${userName}已连续${days}天未签到`,
          errorMessage: emailResult.error,
        });
        this.logger.error(`邮件发送失败: ${emailResult.error}`);
      }

    } catch (error) {
      this.logger.error(`发送通知异常: userId=${userId}, error=${error.message}`, error.stack);
    }
  }

  /**
   * 保存通知记录
   */
  private async saveNotificationLog(data: {
    userId: string;
    contactId: string;
    type: NotificationType;
    status: NotificationStatus;
    content: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      const log = this.notificationLogRepository.create(data);
      await this.notificationLogRepository.save(log);
      this.logger.debug(`通知记录已保存: type=${data.type}, status=${data.status}`);
    } catch (error) {
      this.logger.error(`保存通知记录失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 查询用户的通知历史
   */
  async getNotificationHistory(
    userId: string,
    limit: number = 50,
  ): Promise<NotificationLog[]> {
    return this.notificationLogRepository.find({
      where: { userId },
      order: { sentAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 查询通知统计信息
   */
  async getNotificationStats(userId: string): Promise<{
    totalCount: number;
    successCount: number;
    failedCount: number;
    smsCount: number;
    emailCount: number;
  }> {
    const logs = await this.notificationLogRepository.find({
      where: { userId },
    });

    return {
      totalCount: logs.length,
      successCount: logs.filter(log => log.status === NotificationStatus.SUCCESS).length,
      failedCount: logs.filter(log => log.status === NotificationStatus.FAILED).length,
      smsCount: logs.filter(log => log.type === NotificationType.SMS).length,
      emailCount: logs.filter(log => log.type === NotificationType.EMAIL).length,
    };
  }
}