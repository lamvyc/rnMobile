import { IsString, IsEmail, IsOptional, Matches, MaxLength } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '姓名长度不能超过50个字符' })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(100, { message: '邮箱长度不能超过100个字符' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '关系描述不能超过20个字符' })
  relationship?: string;
}