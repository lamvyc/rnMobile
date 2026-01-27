import { Injectable, Logger } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * 发送邮件
   * 开发环境：模拟发送（打印到控制台）
   * 生产环境：TODO - 集成阿里云邮件推送
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    const { to, subject, html } = options;

    try {
      // 开发环境：模拟发送
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`[开发环境] 模拟发送邮件`);
        this.logger.log(`  收件人: ${to}`);
        this.logger.log(`  主题: ${subject}`);
        this.logger.log(`  内容: ${html.substring(0, 100)}...`);
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 150));
        
        return { success: true };
      }

      // 生产环境：集成阿里云邮件推送
      // TODO: 集成阿里云邮件推送SDK
      /*
      const aliEmailClient = new AliEmailClient({
        accessKeyId: process.env.ALI_EMAIL_ACCESS_KEY_ID,
        accessKeySecret: process.env.ALI_EMAIL_ACCESS_KEY_SECRET,
      });

      const result = await aliEmailClient.singleSendMail({
        AccountName: process.env.ALI_EMAIL_ACCOUNT,
        ReplyToAddress: false,
        AddressType: 1,
        ToAddress: to,
        Subject: subject,
        HtmlBody: html,
      });

      if (result.success) {
        this.logger.log(`邮件发送成功: ${to}`);
        return { success: true };
      } else {
        this.logger.error(`邮件发送失败: ${result.message}`);
        return { success: false, error: result.message };
      }
      */

      // 生产环境暂时也使用模拟
      this.logger.warn(`[生产环境] 邮件服务尚未集成，使用模拟发送`);
      this.logger.log(`  收件人: ${to}`);
      this.logger.log(`  主题: ${subject}`);
      return { success: true };

    } catch (error) {
      this.logger.error(`邮件发送异常: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送未签到警告邮件
   */
  async sendCheckinAlert(
    to: string,
    userName: string,
    days: number,
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `【称平安】您的亲友${userName}已${days}天未签到`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
    .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .info { margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>称平安 - 安全提醒</h1>
    </div>
    <div class="content">
      <div class="alert-box">
        <h2>⚠️ 未签到提醒</h2>
        <p>您的亲友 <strong>${userName}</strong> 已连续 <strong>${days}天</strong> 未在"称平安"APP签到。</p>
      </div>
      
      <div class="info">
        <h3>建议您：</h3>
        <ul>
          <li>通过电话或微信联系确认其安全状况</li>
          <li>提醒其及时在APP中签到</li>
          <li>如果无法联系，请考虑报警或前往其住址查看</li>
        </ul>
      </div>

      <div class="info">
        <h3>关于"称平安"：</h3>
        <p>"称平安"是一款专为独居人群设计的安全工具，通过每日签到和自动提醒机制，为独居者提供安全守护。</p>
      </div>

      <div style="text-align: center;">
        <a href="#" class="button">查看详情</a>
      </div>
    </div>
    <div class="footer">
      <p>此邮件由"称平安"系统自动发送，请勿直接回复。</p>
      <p>如有疑问，请联系客服。</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({ to, subject, html });
  }
}