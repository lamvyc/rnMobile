import { Injectable, Logger } from '@nestjs/common';

export interface SmsOptions {
  phone: string;
  content: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * 发送短信
   * 开发环境：模拟发送（打印到控制台）
   * 生产环境：TODO - 集成阿里云短信服务
   */
  async sendSms(options: SmsOptions): Promise<{ success: boolean; error?: string }> {
    const { phone, content } = options;

    try {
      // 开发环境：模拟发送
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`[开发环境] 模拟发送短信`);
        this.logger.log(`  接收号码: ${phone}`);
        this.logger.log(`  短信内容: ${content}`);
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return { success: true };
      }

      // 生产环境：集成阿里云短信服务
      // TODO: 集成阿里云短信SDK
      /*
      const aliSmsClient = new AliSmsClient({
        accessKeyId: process.env.ALI_SMS_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALI_SMS_ACCESS_KEY_SECRET,
      });

      const result = await aliSmsClient.sendSms({
        PhoneNumbers: phone,
        SignName: '称平安',
        TemplateCode: process.env.ALI_SMS_TEMPLATE_CODE,
        TemplateParam: JSON.stringify({
          content: content,
        }),
      });

      if (result.Code === 'OK') {
        this.logger.log(`短信发送成功: ${phone}`);
        return { success: true };
      } else {
        this.logger.error(`短信发送失败: ${result.Message}`);
        return { success: false, error: result.Message };
      }
      */

      // 生产环境暂时也使用模拟
      this.logger.warn(`[生产环境] 短信服务尚未集成，使用模拟发送`);
      this.logger.log(`  接收号码: ${phone}`);
      this.logger.log(`  短信内容: ${content}`);
      return { success: true };

    } catch (error) {
      this.logger.error(`短信发送异常: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送未签到警告短信
   */
  async sendCheckinAlert(phone: string, userName: string, days: number): Promise<{ success: boolean; error?: string }> {
    const content = `【称平安】您的亲友${userName}已连续${days}天未签到，请及时关注其安全状况。`;
    return this.sendSms({ phone, content });
  }
}