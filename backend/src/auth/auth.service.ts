import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // 生成6位随机验证码
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 发送验证码
  async sendCode(phone: string): Promise<{ message: string }> {
    // 检查是否在1分钟内已发送
    const lastSendTime = await this.redis.get(`sms:last:${phone}`);
    if (lastSendTime) {
      const elapsed = Date.now() - parseInt(lastSendTime);
      if (elapsed < 60000) {
        throw new BadRequestException(
          `请${Math.ceil((60000 - elapsed) / 1000)}秒后再试`,
        );
      }
    }

    const code = this.generateCode();

    // 存储验证码，5分钟过期
    await this.redis.setex(`sms:code:${phone}`, 300, code);

    // 记录发送时间
    await this.redis.setex(`sms:last:${phone}`, 60, Date.now().toString());

    // TODO: 集成阿里云短信服务发送验证码
    console.log(`[开发环境] 验证码: ${code} (手机号: ${phone})`);

    return { message: '验证码已发送' };
  }

  // 验证码登录
  async login(
    phone: string,
    code: string,
  ): Promise<{ accessToken: string; user: any }> {
    // 验证验证码
    const storedCode = await this.redis.get(`sms:code:${phone}`);

    if (!storedCode) {
      throw new UnauthorizedException('验证码已过期');
    }

    if (storedCode !== code) {
      throw new UnauthorizedException('验证码错误');
    }

    // 删除已使用的验证码
    await this.redis.del(`sms:code:${phone}`);

    // 查找或创建用户
    let user = await this.usersService.findByPhone(phone);
    if (!user) {
      user = await this.usersService.create(phone);
    }

    // 生成JWT token
    const payload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  // 验证token
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token无效或已过期');
    }
  }
}
