import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('用户')
@Controller('users')
export class UsersController {}
