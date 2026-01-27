import { IsString, IsNotEmpty, IsEmail, IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: '联系人姓名',
    example: '张三',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: '联系人姓名不能为空' })
  @MaxLength(50, { message: '姓名长度不能超过50个字符' })
  name: string;

  @ApiProperty({
    description: '联系人手机号',
    example: '13800138001',
  })
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiPropertyOptional({
    description: '联系人邮箱',
    example: 'zhangsan@example.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(100, { message: '邮箱长度不能超过100个字符' })
  email?: string;

  @ApiProperty({
    description: '与用户的关系',
    example: '父亲',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: '关系不能为空' })
  @MaxLength(20, { message: '关系描述不能超过20个字符' })
  relationship: string;
}