# 日志系统迁移指南

本文档说明如何将项目中的 `console.log` 替换为结构化的日志系统。

---

## 📋 迁移清单

### ✅ 已完成

- [x] 安装 winston 和 nest-winston
- [x] 创建日志配置和服务
- [x] 注册全局日志模块
- [x] 配置 HTTP 请求日志中间件
- [x] 更新异常过滤器使用日志服务

### 🔄 需要手动迁移

以下文件中的 `console.log` 需要逐步替换为日志服务：

1. **AuthService** (`src/auth/auth.service.ts`)
   - 验证码输出 → `logger.log` 或 `logger.debug`

2. **NotificationsService** (`src/notifications/notifications.service.ts`)
   - 通知发送日志 → `logger.log` + `logger.logBusiness`

3. **SchedulerService** (`src/scheduler/scheduler.service.ts`)
   - 定时任务日志 → `logger.log` + `logger.logPerformance`

---

## 🔄 迁移模式

### 模式 1：简单信息输出

**之前：**
```typescript
console.log('User created successfully');
```

**之后：**
```typescript
this.logger.log('User created successfully', 'ServiceName');
```

### 模式 2：调试信息

**之前：**
```typescript
console.log('[开发环境] 验证码:', code);
```

**之后：**
```typescript
this.logger.debug(`[开发环境] 验证码: ${code}`, 'AuthService');
```

### 模式 3：错误信息

**之前：**
```typescript
console.error('Failed to send email:', error);
```

**之后：**
```typescript
this.logger.error(
  `Failed to send email: ${error.message}`,
  error.stack,
  'EmailService',
);
```

### 模式 4：警告信息

**之前：**
```typescript
console.warn('Rate limit approaching');
```

**之后：**
```typescript
this.logger.warn('Rate limit approaching', 'RateLimiter');
```

### 模式 5：业务操作

**之前：**
```typescript
console.log(`用户 ${userId} 创建了订单 ${orderId}`);
```

**之后：**
```typescript
this.logger.logBusiness('order_created', userId, {
  orderId,
  amount: order.amount,
});
```

### 模式 6：性能监控

**之前：**
```typescript
const start = Date.now();
// ... 操作
console.log(`操作耗时: ${Date.now() - start}ms`);
```

**之后：**
```typescript
const start = Date.now();
// ... 操作
this.logger.logPerformance('operation_name', Date.now() - start);
```

---

## 📝 具体示例

### 示例 1：AuthService 迁移

**当前代码：**
```typescript
@Injectable()
export class AuthService {
  async sendCode(phone: string) {
    const code = this.generateCode();
    await this.redis.setex(`sms:code:${phone}`, 300, code);
    
    // TODO: 集成阿里云短信服务发送验证码
    console.log(`[开发环境] 验证码: ${code} (手机号: ${phone})`);
    
    return { message: '验证码已发送' };
  }
}
```

**迁移后：**
```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
    private readonly logger: CustomLoggerService,  // 👈 注入日志服务
  ) {}

  async sendCode(phone: string) {
    this.logger.log(`发送验证码请求: ${phone}`, 'AuthService');
    
    const code = this.generateCode();
    await this.redis.setex(`sms:code:${phone}`, 300, code);
    
    // TODO: 集成阿里云短信服务发送验证码
    this.logger.debug(`[开发环境] 验证码: ${code} (手机号: ${phone})`, 'AuthService');
    
    this.logger.logBusiness('sms_code_sent', undefined, { phone });
    
    return { message: '验证码已发送' };
  }

  async login(phone: string, code: string) {
    this.logger.log(`登录请求: ${phone}`, 'AuthService');
    
    const storedCode = await this.redis.get(`sms:code:${phone}`);
    
    if (!storedCode) {
      this.logger.warn(`验证码已过期: ${phone}`, 'AuthService');
      throw new UnauthorizedException('验证码已过期');
    }
    
    if (storedCode !== code) {
      this.logger.logSecurity('invalid_login_code', undefined, undefined, { phone });
      throw new UnauthorizedException('验证码错误');
    }
    
    let user = await this.usersService.findByPhone(phone);
    if (!user) {
      user = await this.usersService.create(phone);
      this.logger.logBusiness('user_registered', user.id, { phone });
    }
    
    const payload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload);
    
    this.logger.logBusiness('user_login', user.id, { phone });
    
    return { accessToken, user };
  }
}
```

### 示例 2：SchedulerService 迁移

**当前代码：**
```typescript
@Injectable()
export class SchedulerService {
  @Cron('0 1 * * *')
  async handleCheckinCheck() {
    console.log('===== 开始执行签到检查任务 =====');
    
    try {
      const users = await this.userRepository.find({ status: 'ACTIVE' });
      console.log(`找到 ${users.length} 个活跃用户`);
      
      // ... 处理逻辑
      
      console.log('===== 签到检查任务完成 =====');
    } catch (error) {
      console.error('签到检查任务执行失败:', error);
    }
  }
}
```

**迁移后：**
```typescript
@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
    private readonly logger: CustomLoggerService,  // 👈 注入日志服务
  ) {}

  @Cron('0 1 * * *')
  async handleCheckinCheck() {
    const startTime = Date.now();
    this.logger.log('===== 开始执行签到检查任务 =====', 'Scheduler');
    
    try {
      const users = await this.userRepository.find({ status: 'ACTIVE' });
      this.logger.log(`找到 ${users.length} 个活跃用户`, 'Scheduler');
      
      let notifiedCount = 0;
      
      for (const user of users) {
        try {
          // ... 处理逻辑
          notifiedCount++;
        } catch (error) {
          this.logger.error(
            `处理用户 ${user.id} 时出错: ${error.message}`,
            error.stack,
            'Scheduler',
          );
        }
      }
      
      const duration = Date.now() - startTime;
      this.logger.log(
        `===== 签到检查任务完成 =====\n` +
        `  总用户数: ${users.length}\n` +
        `  发送通知: ${notifiedCount}\n` +
        `  耗时: ${duration}ms`,
        'Scheduler',
      );
      
      this.logger.logPerformance('checkin_check_task', duration, {
        totalUsers: users.length,
        notified: notifiedCount,
      });
    } catch (error) {
      this.logger.error(
        `签到检查任务执行失败: ${error.message}`,
        error.stack,
        'Scheduler',
      );
    }
  }
}
```

---

## ✅ 迁移检查清单

完成迁移后，检查以下项目：

- [ ] 所有 Service 都注入了 `CustomLoggerService`
- [ ] 关键业务操作使用 `logBusiness` 记录
- [ ] 性能敏感的操作使用 `logPerformance` 记录
- [ ] 安全相关事件使用 `logSecurity` 记录
- [ ] 错误日志包含堆栈信息
- [ ] 所有日志都提供了 `context` 参数
- [ ] 移除了所有 `console.log`、`console.error`、`console.warn`
- [ ] 验证日志在开发和生产环境都正常输出

---

## 🎯 迁移优先级

### 高优先级（立即迁移）

1. **错误日志**：所有 `console.error` 必须替换为 `logger.error`
2. **安全事件**：登录失败、权限检查等
3. **业务关键操作**：订单创建、支付、签到等

### 中优先级（逐步迁移）

1. **HTTP 请求日志**（已自动处理，无需手动迁移）
2. **定时任务日志**
3. **第三方服务调用日志**

### 低优先级（可选迁移）

1. **调试信息**（开发环境临时日志）
2. **详细的流程日志**

---

## 📊 迁移前后对比

### 之前

```typescript
console.log('User login:', userId);
console.error('Database error:', error);
console.log('Task completed in', duration, 'ms');
```

**问题：**
- 日志格式不统一
- 无法按级别过滤
- 缺少上下文信息
- 无法追踪请求链路
- 生产环境日志混乱

### 之后

```typescript
this.logger.logBusiness('user_login', userId);
this.logger.error(`Database error: ${error.message}`, error.stack, 'Service');
this.logger.logPerformance('task_name', duration);
```

**优势：**
- 结构化、可查询
- 分级管理（error/warn/info/debug）
- 包含丰富的上下文
- 自动添加时间戳
- 支持日志文件归档
- 生产环境友好

---

**最后更新时间：2024-01-27**