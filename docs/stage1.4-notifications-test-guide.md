# 通知服务模块测试指南

## 测试环境
- 后端服务: http://localhost:5210
- 数据库: pingan_dev
- 通知模式: 开发环境（模拟发送）

---

## 前置条件

### 1. 启动后端服务
```bash
cd rnMobile/backend
npm run start:dev
```

### 2. 准备测试数据

需要准备：
- 一个已注册的用户
- 该用户有一个紧急联系人（带手机号和邮箱）

---

## 测试方法

由于通知服务是内部服务（没有HTTP接口），测试方法：

### 方法1: 通过Node.js脚本测试（推荐）

创建测试脚本 `backend/test-notification.js`:

```javascript
// test-notification.js
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function testNotification() {
  const app = await NestFactory.create(AppModule);
  const notificationsService = app.get('NotificationsService');

  // 替换为实际的用户ID
  const userId = 'your-user-uuid-here';
  const days = 2;

  console.log(`开始测试通知发送...`);
  console.log(`用户ID: ${userId}`);
  console.log(`未签到天数: ${days}`);
  console.log('---');

  await notificationsService.sendCheckinAlert(userId, days);

  console.log('---');
  console.log('测试完成！请查看上方日志。');

  await app.close();
}

testNotification().catch(console.error);
```

运行测试:
```bash
node backend/test-notification.js
```

---

### 方法2: 通过数据库触发器（手动测试）

可以在后续实现定时任务时，手动触发定时任务来测试通知。

---

## 预期输出示例

### 成功场景（短信发送成功）

```
[Nest] INFO [NotificationsService] 开始发送未签到警告通知: userId=xxx, days=2
[Nest] INFO [NotificationsService] 尝试发送短信: phone=13800138000
[Nest] INFO [SmsService] [开发环境] 模拟发送短信
[Nest] INFO [SmsService]   接收号码: 13800138000
[Nest] INFO [SmsService]   短信内容: 【称平安】您的亲友用户2222已连续2天未签到，请及时关注其安全状况。
[Nest] INFO [NotificationsService] 短信发送成功: userId=xxx, contactId=yyy
```

### 失败降级场景（短信失败，邮件成功）

```
[Nest] INFO [NotificationsService] 开始发送未签到警告通知: userId=xxx, days=2
[Nest] INFO [NotificationsService] 尝试发送短信: phone=13800138000
[Nest] ERROR [SmsService] 短信发送失败: Network error
[Nest] WARN [NotificationsService] 短信发送失败，尝试发送邮件: Network error
[Nest] INFO [NotificationsService] 尝试发送邮件: email=test@example.com
[Nest] INFO [EmailService] [开发环境] 模拟发送邮件
[Nest] INFO [EmailService]   收件人: test@example.com
[Nest] INFO [EmailService]   主题: 【称平安】您的亲友用户2222已2天未签到
[Nest] INFO [NotificationsService] 邮件发送成功: userId=xxx, contactId=yyy
```

---

## 数据库验证

### 查询通知记录

```bash
psql -d pingan_dev -c "
  SELECT 
    id, 
    user_id, 
    contact_id, 
    type, 
    status, 
    substring(content, 1, 50) as content_preview,
    to_char(sent_at, 'YYYY-MM-DD HH24:MI:SS') as sent_time
  FROM notification_logs
  ORDER BY sent_at DESC
  LIMIT 10;
"
```

### 验证外键约束

```bash
psql -d pingan_dev -c "
  SELECT 
    nl.type,
    nl.status,
    u.phone as user_phone,
    c.name as contact_name,
    c.phone as contact_phone
  FROM notification_logs nl
  JOIN users u ON nl.user_id = u.id
  JOIN contacts c ON nl.contact_id = c.id
  ORDER BY nl.sent_at DESC
  LIMIT 5;
"
```

---

## 测试检查清单

- [ ] ✅ 通知服务模块成功加载
- [ ] ✅ 能获取用户信息
- [ ] ✅ 能获取紧急联系人
- [ ] ✅ 短信发送功能正常（开发环境模拟）
- [ ] ✅ 邮件发送功能正常（开发环境模拟）
- [ ] ✅ 通知策略正确（优先短信，失败则邮件）
- [ ] ✅ 通知记录正确保存到数据库
- [ ] ✅ 外键约束正常工作
- [ ] ✅ 日志输出清晰完整
- [ ] ✅ 异常处理正确

---

## 边界场景测试

### 场景1: 用户不存在
```javascript
await notificationsService.sendCheckinAlert('non-existent-uuid', 2);
// 预期：记录错误日志，优雅退出
```

### 场景2: 用户没有联系人
```javascript
// 使用一个没有配置联系人的用户ID
await notificationsService.sendCheckinAlert(userIdWithoutContact, 2);
// 预期：记录警告日志，优雅退出
```

### 场景3: 联系人没有邮箱（短信失败时）
```javascript
// 修改联系人，移除邮箱字段
// 然后模拟短信发送失败
// 预期：记录错误日志，无法发送邮件
```

---

## 性能测试（可选）

### 批量通知测试

```javascript
// 测试批量发送通知的性能
const userIds = ['uuid1', 'uuid2', 'uuid3', ...]; // 10-100个用户

const startTime = Date.now();
await Promise.all(
  userIds.map(userId => notificationsService.sendCheckinAlert(userId, 2))
);
const endTime = Date.now();

console.log(`批量发送${userIds.length}个通知耗时: ${endTime - startTime}ms`);
```

---

## 生产环境配置

当准备部署到生产环境时，需要：

### 1. 配置阿里云凭证

在 `.env` 中添加：
```
# 阿里云短信服务
ALIYUN_ACCESS_KEY_ID=your_actual_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_actual_access_key_secret
ALIYUN_SMS_SIGN_NAME=称平安
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789

# 阿里云邮件推送
ALIYUN_EMAIL_ACCOUNT=noreply@yourdomain.com
ALIYUN_EMAIL_FROM_ALIAS=称平安团队
```

### 2. 集成阿里云SDK

需要在 `sms.service.ts` 和 `email.service.ts` 中：
- 安装阿里云SDK: `npm install @alicloud/pop-core`
- 取消注释生产环境代码
- 测试真实发送

---

## 已知限制

1. **开发环境限制**
   - 当前使用模拟发送，不会真实发送短信/邮件
   - 生产环境需要集成阿里云SDK

2. **通知频率**
   - 当前没有限制同一用户的通知频率
   - 建议在定时任务中添加防重复逻辑

3. **失败重试**
   - 当前没有自动重试机制
   - 建议在定时任务中添加重试逻辑

---

## 下一步计划

完成通知服务测试后，进入 **阶段1.5: 定时任务模块开发**
- 集成 `@nestjs/schedule`
- 实现每日签到检查任务
- 调用 NotificationsService.sendCheckinAlert()