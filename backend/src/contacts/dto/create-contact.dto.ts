import { IsString, IsNotEmpty, IsEmail, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: '联系人姓名不能为空' })
  @MaxLength(50, { message: '姓名长度不能超过50个字符' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(100, { message: '邮箱长度不能超过100个字符' })
  email?: string;

  @IsString()
  @IsNotEmpty({ message: '关系不能为空' })
  @MaxLength(20, { message: '关系描述不能超过20个字符' })
  relationship: string;
}