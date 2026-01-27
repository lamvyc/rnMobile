import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendCodeDto } from './dto/send-code.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  @ApiOperation({ summary: '发送验证码', description: '向指定手机号发送短信验证码' })
  @ApiResponse({ status: 200, description: '验证码发送成功' })
  @ApiResponse({ status: 400, description: '手机号格式不正确' })
  async sendCode(@Body(ValidationPipe) dto: SendCodeDto) {
    return this.authService.sendCode(dto.phone);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录', description: '使用手机号和验证码登录，返回 JWT Token' })
  @ApiResponse({ status: 200, description: '登录成功，返回 Token' })
  @ApiResponse({ status: 400, description: '验证码错误或已过期' })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@Body(ValidationPipe) dto: LoginDto) {
    return this.authService.login(dto.phone, dto.code);
  }
}
