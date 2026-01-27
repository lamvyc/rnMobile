import { IsString, IsEmail, IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContactDto {
  @ApiPropertyOptional({
    description: '联系人姓名',
    example: '李四',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '姓名长度不能超过50个字符' })
  name?: string;

  @ApiPropertyOptional({
    description: '联系人手机号',
    example: '13900139000',
  })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({
    description: '联系人邮箱',
    example: 'lisi@example.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(100, { message: '邮箱长度不能超过100个字符' })
  email?: string;

  @ApiPropertyOptional({
    description: '与用户的关系',
    example: '母亲',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '关系描述不能超过20个字符' })
  relationship?: string;
}