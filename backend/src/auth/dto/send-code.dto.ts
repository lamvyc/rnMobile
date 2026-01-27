import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCodeDto {
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
}
