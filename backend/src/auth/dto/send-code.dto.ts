import { IsString, Matches, Length } from 'class-validator';

export class SendCodeDto {
  @IsString()
  @Length(11, 11, { message: '手机号必须为11位' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;
}
