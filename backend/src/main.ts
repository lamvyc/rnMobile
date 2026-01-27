import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动删除非白名单属性
      forbidNonWhitelisted: true, // 遇到非白名单属性时抛出错误
      transform: true, // 自动转换类型
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
}

bootstrap();
