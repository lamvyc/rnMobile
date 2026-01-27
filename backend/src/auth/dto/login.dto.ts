import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '手机号码',
    example: '13800138000',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  @Length(11, 11, { message: '手机号必须为11位' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({
    description: '短信验证码',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6, { message: '验证码必须为6位' })
  @Matches(/^\d{6}$/, { message: '验证码格式不正确' })
  code: string;
}
