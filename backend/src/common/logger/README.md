# 日志系统文档

本项目使用 **Winston** 作为日志库，提供结构化、分级的日志记录功能。

---

## 📋 日志级别

Winston 支持以下日志级别（按严重程度从高到低）：

| 级别 | 用途 | 示例场景 |
|------|------|----------|
| **error** | 错误信息 | 数据库连接失败、第三方API调用失败、未捕获的异常 |
| **warn** | 警告信息 | 弃用的API使用、即将达到限制、可恢复的错误 |
| **info** | 一般信息 | HTTP请求、业务操作、应用启动/关闭 |
| **debug** | 调试信息 | 详细的执行流程、变量值、数据库查询（仅开发环境） |
| **verbose** | 详细信息 | 更详细的调试信息 |

---

## 🎯 日志输出

### 开发环境（NODE_ENV=development）

- **控制台输出**：彩色、格式化的日志，便于开发调试
- **日志级别**：debug 及以上
- **不写入文件**：避免开发时产生大量日志文件

### 生产环境（NODE_ENV=production）

- **控制台输出**：简洁的 JSON 格式
- **日志级别**：info 及以上
- **文件输出**：
  - `logs/combined.log` - 所有 info 及以上级别的日志（最大10MB × 10个文件）
  - `logs/error.log` - 仅 error 级别的日志（最大10MB × 10个文件）
  - `logs/exceptions.log` - 未捕获的异常（最大10MB × 5个文件）
  - `logs/rejections.log` - 未处理的 Promise 拒绝（最大10MB × 5个文件）

---

## 💡 使用方法

### 1. 基础日志记录

```typescript
import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../common/logger';

@Injectable()
export class UserService {
  constructor(private readonly logger: CustomLoggerService) {}

  async createUser(data: CreateUserDto) {
    this.logger.log('Creating new user', 'UserService');
    
    try {
      const user = await this.userRepository.save(data);
      this.logger.log(`User created: ${user.id}`, 'UserService');
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to create user: ${error.message}`,
        error.stack,
        'UserService',
      );
      throw error;
    }
  }
}
```

### 2. HTTP 请求日志

HTTP 请求会被自动记录（通过 `HttpLoggerMiddleware`），无需手动调用：

```
[HTTP] GET /api/users 200 - 45ms
```

### 3. 业务操作日志

使用 `logBusiness` 记录重要的业务操作：

```typescript
this.logger.logBusiness(
  'user_login',
  userId,
  { phone: user.phone, ip: req.ip },
);
```

**输出示例：**
```json
{
  "level": "info",
  "message": "Business Operation",
  "action": "user_login",
  "userId": "uuid-123",
  "details": { "phone": "13800138000", "ip": "127.0.0.1" },
  "context": "Business",
  "timestamp": "2024-01-27 18:30:00.123"
}
```

### 4. 安全事件日志

使用 `logSecurity` 记录安全相关事件：

```typescript
this.logger.logSecurity(
  'failed_login_attempt',
  undefined,
  req.ip,
  { phone: dto.phone, reason: 'invalid_code' },
);
```

### 5. 性能监控日志

使用 `logPerformance` 记录性能指标：

```typescript
const startTime = Date.now();
// ... 执行操作
const duration = Date.now() - startTime;

this.logger.logPerformance(
  'database_query',
  duration,
  { query: 'SELECT * FROM users', rowCount: 100 },
);
```

**自动警告**：如果操作耗时超过 3 秒，会自动记录为 WARN 级别。

### 6. 数据库查询日志（开发环境）

```typescript
this.logger.logQuery(
  'SELECT * FROM users WHERE id = $1',
  ['uuid-123'],
  45, // 执行时间（毫秒）
);
```

**注意**：数据库查询日志仅在开发环境输出。

---

## 🔍 日志格式

### JSON 格式（生产环境）

```json
{
  "level": "info",
  "message": "User created successfully",
  "context": "UserService",
  "timestamp": "2024-01-27 18:30:00.123"
}
```

### 彩色格式（开发环境）

```
[ChengPingAn] 18751  - 2024-01-27 18:30:00  INFO [UserService] User created successfully
```

---

## 📊 实际应用示例

### 示例 1：认证服务

```typescript
@Injectable()
export class AuthService {
  constructor(private readonly logger: CustomLoggerService) {}

  async login(phone: string, code: string) {
    this.logger.log(`Login attempt for phone: ${phone}`, 'AuthService');

    const storedCode = await this.redis.get(`sms:code:${phone}`);
    
    if (!storedCode) {
      this.logger.warn(`Login failed: code expired for ${phone}`, 'AuthService');
      throw new UnauthorizedException('验证码已过期');
    }

    if (storedCode !== code) {
      this.logger.logSecurity(
        'failed_login_attempt',
        undefined,
        undefined,
        { phone, reason: 'invalid_code' },
      );
      throw new UnauthorizedException('验证码错误');
    }

    const user = await this.usersService.findOrCreate(phone);
    
    this.logger.logBusiness('user_login', user.id, { phone });
    
    return { user, token: this.generateToken(user) };
  }
}
```

### 示例 2：定时任务

```typescript
@Injectable()
export class SchedulerService {
  constructor(private readonly logger: CustomLoggerService) {}

  @Cron('0 1 * * *')
  async handleCheckinCheck() {
    const startTime = Date.now();
    this.logger.log('===== 开始执行签到检查任务 =====', 'Scheduler');

    try {
      const users = await this.userRepository.find({ status: 'active' });
      this.logger.log(`找到 ${users.length} 个活跃用户`, 'Scheduler');

      let notifiedCount = 0;
      for (const user of users) {
        try {
          await this.notifyUser(user);
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

### 示例 3：数据库操作

```typescript
@Injectable()
export class ContactsService {
  constructor(private readonly logger: CustomLoggerService) {}

  async create(userId: string, dto: CreateContactDto) {
    const startTime = Date.now();
    
    this.logger.log(`Creating contact for user ${userId}`, 'ContactsService');

    const existingCount = await this.contactRepository.count({ where: { userId } });
    
    if (existingCount >= 3) {
      this.logger.warn(
        `User ${userId} exceeded contact limit (${existingCount})`,
        'ContactsService',
      );
      throw new BadRequestException('每个用户最多只能添加3个紧急联系人');
    }

    const contact = this.contactRepository.create({
      userId,
      ...dto,
      priority: existingCount + 1,
    });

    const saved = await this.contactRepository.save(contact);
    
    const duration = Date.now() - startTime;
    this.logger.logBusiness('contact_created', userId, {
      contactId: saved.id,
      priority: saved.priority,
    });
    
    this.logger.logPerformance('create_contact', duration);

    return saved;
  }
}
```

---

## ??️ 最佳实践

### 1. 选择合适的日志级别

- **error**：影响功能的错误，需要立即关注
- **warn**：潜在问题，但不影响当前操作
- **info**：重要的业务流程节点
- **debug**：详细的执行过程（仅开发环境）

### 2. 提供上下文（Context）

始终提供 `context` 参数，标识日志来源：

```typescript
this.logger.log('Operation completed', 'ServiceName');
```

### 3. 记录关键信息

- 用户 ID（如果有）
- 操作类型
- 相关资源 ID
- 错误堆栈（error 级别）

### 4. 避免敏感信息

**不要记录**：
- 密码
- Token
- 验证码
- 信用卡号
- 完整的个人信息

**可以记录**（脱敏后）：
- 手机号（保留后4位）
- 邮箱（保留首字母和域名）

```typescript
// ❌ 不要这样
this.logger.log(`User password: ${password}`);

// ✅ 应该这样
this.logger.log(`User login with phone: ${phone.slice(-4)}`);
```

### 5. 结构化日志

使用对象传递详细信息，而不是字符串拼接：

```typescript
// ✅ 推荐
this.logger.logBusiness('order_created', userId, {
  orderId: order.id,
  amount: order.amount,
  items: order.items.length,
});

// ❌ 不推荐
this.logger.log(
  `User ${userId} created order ${order.id} with amount ${order.amount}`,
);
```

---

## 📈 日志查询与分析

### 使用 grep 查询

```bash
# 查询特定时间的日志
grep "2024-01-27 18:" logs/combined.log

# 查询特定用户的操作
grep "userId.*uuid-123" logs/combined.log

# 查询错误日志
grep "level.*error" logs/combined.log
```

### 使用 jq 解析 JSON（生产环境）

```bash
# 查询特定级别
cat logs/combined.log | jq 'select(.level == "error")'

# 查询特定上下文
cat logs/combined.log | jq 'select(.context == "UserService")'

# 统计日志数量
cat logs/combined.log | jq -s 'group_by(.level) | map({level: .[0].level, count: length})'
```

---

## 🔧 日志配置调整

如需修改日志配置，编辑 `logger.config.ts`：

```typescript
// 修改日志级别
level: isDev ? 'debug' : 'info',  // 改为 'warn' 减少日志量

// 修改文件大小限制
maxsize: 20 * 1024 * 1024,  // 改为 20MB

// 修改保留文件数量
maxFiles: 20,  // 改为保留 20 个文件
```

---

## 📌 故障排查

### 1. 日志不输出

检查：
- 环境变量 `NODE_ENV` 是否设置正确
- 日志级别是否过高（如设置为 error，则 info 不会输出）

### 2. 日志文件未生成

检查：
- `logs/` 目录是否存在且有写权限
- 是否在生产环境（开发环境不写文件）

### 3. 日志过多导致性能问题

解决方案：
- 提高日志级别（warn 或 error）
- 减少 debug 日志的使用
- 调整文件大小和数量限制

---

**最后更新时间：2024-01-27**