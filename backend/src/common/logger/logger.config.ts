import * as winston from 'winston';
import * as path from 'path';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { DateUtil } from '../utils';

/**
 * Winston 日志配置
 */
export const createWinstonConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDev = env === 'development';

  // 日志目录
  const logDir = path.join(process.cwd(), 'logs');

  // 自定义时间戳格式
  const customTimestamp = winston.format((info) => {
    info.timestamp = DateUtil.formatDateTimeWithMs(new Date());
    return info;
  });

  // 日志格式
  const logFormat = winston.format.combine(
    customTimestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  );

  // 控制台格式（开发环境使用彩色输出）
  const consoleFormat = isDev
    ? winston.format.combine(
        customTimestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('ChengPingAn', {
          colors: true,
          prettyPrint: true,
        }),
      )
    : winston.format.combine(customTimestamp(), winston.format.simple());

  // Transports 配置
  const transports: winston.transport[] = [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
      level: isDev ? 'debug' : 'info',
    }),
  ];

  // 生产环境添加文件输出
  if (!isDev) {
    transports.push(
      // 所有日志
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        format: logFormat,
        level: 'info',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
      }),
      // 错误日志
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        format: logFormat,
        level: 'error',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
      }),
    );
  }

  return {
    transports,
    // 未捕获的异常和拒绝
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(logDir, 'exceptions.log'),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
    ],
    rejectionHandlers: [
      new winston.transports.File({
        filename: path.join(logDir, 'rejections.log'),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
    ],
  };
};
