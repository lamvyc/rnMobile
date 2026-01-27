# 定时任务模块测试指南

## 测试环境
- 后端服务: http://localhost:5210
- 数据库: pingan_dev
- 定时任务: 已启用

---

## 定时任务说明

### 1. 签到检查任务
- **触发时间**: 每天凌晨1点（Asia/Shanghai时区）
- **Cron表达式**: `0 1 * * *`
- **功能**: 检查所有活跃用户，如果连续2天未签到则发送通知

### 2. 健康检查任务
- **触发时间**: 每小时一次
- **Cron表达式**: `@hourly`
- **功能**: 检查数据库和Redis连接状态

---

## 测试方法

### 方法1: 手动触发定时任务（推荐）

创建测试脚本 `backend/test-scheduler.js`:

```javascript
// test-scheduler.js
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function testScheduler() {
  const app = await NestFactory.create(AppModule);
  const schedulerService = app.get('SchedulerService');

  console.log('====== 测试定时任务模块 ======\n');

  // 测试1: 健康检查
  console.log('1. 执行健康检查...');
  const healthResult = await schedulerService.triggerHealthCheck();
  console.log('健康检查结果:', JSON.stringify(healthResult, null, 2));
  console.log('');

  // 测试2: 签到检查
  console.log('2. 执行签到检查...');
  await schedulerService.triggerCheckinCheck();
  console.log('');

  console.log('====== 测试完成 ======');
  await app.close();
}

testScheduler().catch(console.error);
```

运行测试:
```bash
cd rnMobile/backend
node test-scheduler.js
```

---

### 方法2: 等待自动触发

启动服务后，定时任务会按计划自动执行：
- 健康检查：每小时执行一次
- 签到检查：每天凌晨1点执行

查看日志验证：
```bash
cd rnMobile/backend
npm run start:dev
# 查看日志输出
```

---

## 预期输出示例

### 健康检查任务

**正常情况**:
```
[Nest] DEBUG [SchedulerService] 执行健康检查...
[Nest] DEBUG [SchedulerService] 数据库连接正常
[Nest] DEBUG [SchedulerService] Redis连接正常
[Nest] DEBUG [SchedulerService] 所有服务健康
```

**异常情况**:
```
[Nest] DEBUG [SchedulerService] 执行健康检查...
[Nest] ERROR [SchedulerService] 数据库连接异常: Connection refused
[Nest] DEBUG [SchedulerService] Redis连接正常
[Nest] WARN [SchedulerService] 健康检查发现异常: {"timestamp":"...","database":"unhealthy","redis":"healthy"}
```

---

### 签到检查任务

**有用户需要通知**:
```
[Nest] INFO [SchedulerService] ===== 开始执行签到检查任务 =====
[Nest] INFO [SchedulerService] 找到 3 个活跃用户
[Nest] INFO [SchedulerService] 2天前的日期: 2026-01-25T00:00:00.000Z
[Nest] INFO [SchedulerService] 用户 13900142222 已连续 2 天未签到，发送通知
[Nest] INFO [NotificationsService] 开始发送未签到警告通知: userId=xxx, days=2
[Nest] INFO [NotificationsService] 尝试发送短信: phone=13800138000
[Nest] INFO [SmsService] [开发环境] 模拟发送短信
[Nest] INFO [SmsService]   接收号码: 13800138000
[Nest] INFO [SmsService]   短信内容: 【称平安】您的亲友用户2222已连续2天未签到，请及时关注其安全状况。
[Nest] INFO [NotificationsService] 短信发送成功: userId=xxx, contactId=yyy
[Nest] INFO [SchedulerService] ===== 签到检查任务完成 =====
  总用户数: 3
  发送通知: 1
  跳过: 2
  耗时: 245ms
```

**无用户需要通知**:
```
[Nest] INFO [SchedulerService] ===== 开始执行签到检查任务 =====
[Nest] INFO [SchedulerService] 找到 3 个活跃用户
[Nest] INFO [SchedulerService] 2天前的日期: 2026-01-25T00:00:00.000Z
[Nest] INFO [SchedulerService] ===== 签到检查任务完成 =====
  总用户数: 3
  发送通知: 0
  跳过: 3
  耗时: 82ms
```

---

## 数据准备（用于测试）

### 创建测试用户（2天未签到）

```bash
# 1. 创建用户
psql -d pingan_dev -c "
  INSERT INTO users (id, phone, nickname, status, last_checkin_at, created_at, updated_at)
  VALUES (
    'test-user-uuid-001',
    '13900140001',
    '测试用户1',
    'active',
    NOW() - INTERVAL '3 days',
    NOW(),
    NOW()
  );
"

# 2. 为用户添加联系人
psql -d pingan_dev -c "
  INSERT INTO contacts (id, user_id, name, phone, email, relationship, priority, is_verified, created_at, updated_at)
  VALUES (
    'test-contact-uuid-001',
    'test-user-uuid-001',
    '张三',
    '13800138000',
    'zhangsan@example.com',
    '家人',
    1,
    false,
    NOW(),
    NOW()
  );
"
```

### 验证数据

```bash
# 查询测试用户
psql -d pingan_dev -c "
  SELECT 
    phone,
    nickname,
    status,
    to_char(last_checkin_at, 'YYYY-MM-DD HH24:MI:SS') as last_checkin,
    EXTRACT(DAY FROM (NOW() - last_checkin_at)) as days_since_checkin
  FROM users
  WHERE phone = '13900140001';
"
```

---

## 测试检查清单

### 健康检查任务
- [ ] ✅ 任务能按时触发（每小时）
- [ ] ✅ 数据库连接检查正常
- [ ] ✅ Redis连接检查正常
- [ ] ✅ 异常情况能正确记录

### 签到检查任务
- [ ] ✅ 任务能按时触发（每天凌晨1点）
- [ ] ✅ 能正确查询所有活跃用户
- [ ] ✅ 能正确识别2天未签到的用户
- [ ] ✅ 能调用通知服务发送通知
- [ ] ✅ 统计信息准确（总数、通知数、跳过数）
- [ ] ✅ 错误处理正确（单个用户失败不影响其他用户）
- [ ] ✅ 日志记录清晰完整

---

## 边界场景测试

### 场景1: 没有活跃用户
```sql
-- 将所有用户设为suspended
UPDATE users SET status = 'suspended';
```
**预期**: 任务正常执行，发送通知数为0

### 场景2: 用户没有联系人
```sql
-- 删除测试用户的联系人
DELETE FROM contacts WHERE user_id = 'test-user-uuid-001';
```
**预期**: 任务执行，记录警告日志"用户没有配置紧急联系人"

### 场景3: 刚好2天未签到
```sql
-- 设置用户最后签到时间为2天前
UPDATE users 
SET last_checkin_at = NOW() - INTERVAL '2 days'
WHERE id = 'test-user-uuid-001';
```
**预期**: 触发通知

### 场景4: 仅1天未签到
```sql
-- 设置用户最后签到时间为1天前
UPDATE users 
SET last_checkin_at = NOW() - INTERVAL '1 day'
WHERE id = 'test-user-uuid-001';
```
**预期**: 不触发通知

---

## 查看定时任务日志

### 实时查看
```bash
cd rnMobile/backend
npm run start:dev | grep "SchedulerService"
```

### 查看历史日志（如果使用PM2）
```bash
pm2 logs backend | grep "SchedulerService"
```

---

## 数据库验证

### 查询通知记录
```bash
psql -d pingan_dev -c "
  SELECT 
    nl.type,
    nl.status,
    nl.content,
    u.phone as user_phone,
    c.phone as contact_phone,
    to_char(nl.sent_at, 'YYYY-MM-DD HH24:MI:SS') as sent_time
  FROM notification_logs nl
  JOIN users u ON nl.user_id = u.id
  JOIN contacts c ON nl.contact_id = c.id
  WHERE nl.sent_at > NOW() - INTERVAL '1 day'
  ORDER BY nl.sent_at DESC;
"
```

---

## 生产环境配置

### 修改定时任务时间（如需要）

编辑 `scheduler.service.ts`:

```typescript
// 示例：改为每天早上8点执行
@Cron('0 8 * * *', {
  name: 'checkin-check',
  timeZone: 'Asia/Shanghai',
})

// 示例：改为每30分钟执行一次健康检查
@Cron('*/30 * * * *', {
  name: 'health-check',
})
```

### Cron表达式参考
- `0 1 * * *` - 每天凌晨1点
- `0 8 * * *` - 每天早上8点
- `*/30 * * * *` - 每30分钟
- `0 */2 * * *` - 每2小时
- `0 0 * * 0` - 每周日午夜

---

## 性能监控

### 任务执行时间
签到检查任务会记录执行时间：
```
耗时: 245ms
```

### 建议阈值
- 健康检查：< 100ms
- 签到检查：< 5秒（取决于用户数量）

---

## 故障排查

### 问题1: 定时任务没有触发
**检查**:
- SchedulerModule 是否已注册到 AppModule
- 服务是否正常启动
- 时区配置是否正确

### 问题2: 健康检查报错
**检查**:
- 数据库连接配置
- Redis连接配置
- 网络连接状态

### 问题3: 签到检查没有发送通知
**检查**:
- 用户的 lastCheckinAt 字段
- 用户是否有配置联系人
- NotificationsService 是否正常工作

---

## 下一步计划

完成定时任务模块测试后，**阶段1（后端核心模块）全部完成**！

可以进入 **阶段2: 移动端开发** 或进行整体集成测试。