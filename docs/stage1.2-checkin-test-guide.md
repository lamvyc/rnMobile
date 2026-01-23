# 签到模块测试指南

## 测试环境
- 后端服务: http://localhost:5210
- 数据库: pingan_dev

## 手动测试步骤

### 1. 发送验证码
```bash
curl -X POST http://localhost:5210/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13900141111"}'
```

**预期响应**:
```json
{"message":"验证码已发送"}
```

**查看验证码**: 在后端控制台查找类似以下的日志:
```
[开发环境] 验证码: 123456 (手机号: 13900141111)
```

---

### 2. 登录获取Token
将上一步获取的验证码替换到下面命令中的 `YOUR_CODE`:

```bash
curl -X POST http://localhost:5210/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13900141111","code":"YOUR_CODE"}'
```

**预期响应**:
```json
{
  "accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user":{
    "id":"uuid",
    "phone":"13900141111",
    "nickname":"用户1111",
    "avatar":null
  }
}
```

**保存Token**: 将返回的 `accessToken` 保存下来，后续请求都需要使用。

---

### 3. 查询签到状态（签到前）
将上一步获取的Token替换到 `YOUR_TOKEN`:

```bash
curl -X GET http://localhost:5210/checkin/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "isCheckedInToday":false,
  "lastCheckinDate":null,
  "consecutiveDays":0,
  "totalDays":0
}
```

---

### 4. 执行签到
```bash
curl -X POST http://localhost:5210/checkin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
{
  "message":"签到成功",
  "checkinDate":"2026-01-23",
  "checkinTime":"2026-01-23T07:50:00.000Z",
  "consecutiveDays":1,
  "totalDays":1
}
```

---

### 5. 查询签到状态（签到后）
```bash
curl -X GET http://localhost:5210/checkin/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "isCheckedInToday":true,
  "lastCheckinDate":"2026-01-23",
  "consecutiveDays":1,
  "totalDays":1
}
```

---

### 6. 重复签到测试（应该失败）
```bash
curl -X POST http://localhost:5210/checkin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
{
  "statusCode":400,
  "message":"今天已经签到过了",
  "error":"Bad Request"
}
```

---

### 7. 查询签到历史
```bash
curl -X GET http://localhost:5210/checkin/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "history":[
    {
      "checkinDate":"2026-01-23",
      "checkinTime":"2026-01-23T07:50:00.000Z"
    }
  ],
  "consecutiveDays":1,
  "totalDays":1
}
```

---

### 8. 数据库验证

#### 查询users表
```bash
psql -d pingan_dev -c "SELECT phone, nickname, to_char(last_checkin_at, 'YYYY-MM-DD HH24:MI:SS') as last_checkin FROM users WHERE phone='13900141111';"
```

#### 查询checkins表
```bash
psql -d pingan_dev -c "SELECT checkin_date, to_char(checkin_time, 'YYYY-MM-DD HH24:MI:SS') as time FROM checkins WHERE user_id = (SELECT id FROM users WHERE phone='13900141111');"
```

---

## 测试检查清单

- [ ] ✅ 验证码发送成功
- [ ] ✅ 登录成功，获取到Token
- [ ] ✅ 签到前状态正确（isCheckedInToday: false）
- [ ] ✅ 签到成功，返回签到信息
- [ ] ✅ 签到后状态正确（isCheckedInToday: true）
- [ ] ✅ 重复签到被拦截
- [ ] ✅ 签到历史查询正确
- [ ] ✅ users表的lastCheckinAt字段已更新
- [ ] ✅ checkins表中有签到记录

---

## 连续签到天数测试

要测试连续签到天数的计算逻辑，需要手动修改数据库：

```sql
-- 插入昨天的签到记录
INSERT INTO checkins (id, user_id, checkin_date, checkin_time, created_at)
VALUES (
  uuid_generate_v4(),
  (SELECT id FROM users WHERE phone='13900141111'),
  (CURRENT_DATE - INTERVAL '1 day')::date,
  (NOW() - INTERVAL '1 day'),
  NOW()
);

-- 再次查询签到状态，应该显示 consecutiveDays: 2
```

---

## 已知问题

无

---

## 下一步计划

完成签到模块测试后，进入 **阶段1.3: 紧急联系人模块开发**