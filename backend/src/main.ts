import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CustomLoggerService } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // 缓冲日志直到自定义 Logger 就绪
  });

  // 使用自定义日志服务
  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);

  // 全局异常过滤器（注意顺序：先捕获所有异常，再处理HTTP异常）
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动删除非白名单属性
      forbidNonWhitelisted: true, // 遇到非白名单属性时抛出错误
      transform: true, // 自动转换类型
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
      // 自定义验证错误格式
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });
        return new Error(messages.join('; '));
      },
    }),
  );

  // 启用 CORS（允许前端调用）
  app.enableCors();

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('称平安 API')
    .setDescription('称平安 APP 后端服务 API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入 JWT Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('认证', '用户认证相关接口')
    .addTag('签到', '每日签到相关接口')
    .addTag('联系人', '紧急联系人管理接口')
    .addTag('用户', '用户管理相关接口')
    .addTag('健康检查', '系统健康状态监控接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // 使用日志服务输出启动信息
  logger.log(
    `🚀 Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  logger.log(
    `📚 Swagger docs available at: http://localhost:${port}/api-docs`,
    'Bootstrap',
  );
  logger.log(
    `🌍 Environment: ${process.env.NODE_ENV || 'development'}`,
    'Bootstrap',
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
