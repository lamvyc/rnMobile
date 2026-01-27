import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '健康检查', description: '检查服务是否正常运行' })
  @ApiResponse({ status: 200, description: '服务正常运行' })
  getHello(): string {
    return this.appService.getHello();
  }
}
