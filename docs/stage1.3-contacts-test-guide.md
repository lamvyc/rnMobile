# 紧急联系人模块测试指南

## 测试环境
- 后端服务: http://localhost:5210
- 数据库: pingan_dev

## 前置条件

### 1. 启动后端服务
```bash
cd rnMobile/backend
npm run start:dev
```

### 2. 获取测试用户Token

#### 发送验证码
```bash
curl -X POST http://localhost:5210/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13900142222"}'
```

#### 登录获取Token
```bash
curl -X POST http://localhost:5210/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13900142222","code":"YOUR_CODE"}'
```

**保存返回的 `accessToken`，后续所有测试都需要使用。**

---

## 测试用例

### 1. 添加联系人（POST /contacts）

```bash
curl -X POST http://localhost:5210/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "relationship": "家人"
  }'
```

**预期响应**:
```json
{
  "message": "联系人添加成功",
  "contact": {
    "id": "uuid",
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "relationship": "家人",
    "isVerified": false,
    "createdAt": "2026-01-27T06:00:00.000Z"
  }
}
```

---

### 2. 测试添加第二个联系人（应该失败）

```bash
curl -X POST http://localhost:5210/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "李四",
    "phone": "13900139000",
    "relationship": "朋友"
  }'
```

**预期响应**:
```json
{
  "statusCode": 400,
  "message": "每个用户最多只能添加1个紧急联系人",
  "error": "Bad Request"
}
```

---

### 3. 查询联系人列表（GET /contacts）

```bash
curl -X GET http://localhost:5210/contacts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "张三",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "relationship": "家人",
      "priority": 1,
      "isVerified": false,
      "createdAt": "2026-01-27T06:00:00.000Z",
      "updatedAt": "2026-01-27T06:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 4. 查询单个联系人（GET /contacts/:id）

**替换 `CONTACT_ID` 为上一步返回的联系人ID**

```bash
curl -X GET http://localhost:5210/contacts/CONTACT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "contact": {
    "id": "uuid",
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "relationship": "家人",
    "priority": 1,
    "isVerified": false,
    "createdAt": "2026-01-27T06:00:00.000Z",
    "updatedAt": "2026-01-27T06:00:00.000Z"
  }
}
```

---

### 5. 更新联系人信息（PUT /contacts/:id）

```bash
curl -X PUT http://localhost:5210/contacts/CONTACT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三丰",
    "phone": "13800138001",
    "email": "zhangsanfeng@example.com"
  }'
```

**预期响应**:
```json
{
  "message": "联系人更新成功",
  "contact": {
    "id": "uuid",
    "name": "张三丰",
    "phone": "13800138001",
    "email": "zhangsanfeng@example.com",
    "relationship": "家人",
    "isVerified": false,
    "updatedAt": "2026-01-27T06:05:00.000Z"
  }
}
```

---

### 6. 删除联系人（DELETE /contacts/:id）

```bash
curl -X DELETE http://localhost:5210/contacts/CONTACT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "message": "联系人删除成功"
}
```

---

### 7. 验证删除后列表为空

```bash
curl -X GET http://localhost:5210/contacts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**预期响应**:
```json
{
  "contacts": [],
  "total": 0
}
```

---

## 数据验证测试

### 测试1: 手机号格式错误

```bash
curl -X POST http://localhost:5210/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试",
    "phone": "12345",
    "relationship": "朋友"
  }'
```

**预期响应**: 400错误，提示"手机号格式不正确"

---

### 测试2: 邮箱格式错误

```bash
curl -X POST http://localhost:5210/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试",
    "phone": "13800138000",
    "email": "invalid-email",
    "relationship": "朋友"
  }'
```

**预期响应**: 400错误，提示"邮箱格式不正确"

---

### 测试3: 必填字段缺失

```bash
curl -X POST http://localhost:5210/contacts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000"
  }'
```

**预期响应**: 400错误，提示"联系人姓名不能为空"或"关系不能为空"

---

## 数据库验证

### 查询contacts表

```bash
psql -d pingan_dev -c "SELECT id, user_id, name, phone, email, relationship, priority, is_verified, created_at FROM contacts LIMIT 10;"
```

### 验证外键约束

```bash
psql -d pingan_dev -c "SELECT c.name, c.phone, u.phone as user_phone FROM contacts c JOIN users u ON c.user_id = u.id;"
```

---

## 测试检查清单

- [ ] ✅ 能成功添加联系人
- [ ] ✅ 添加第二个联系人时被拦截（首版限制1个）
- [ ] ✅ 能查询联系人列表
- [ ] ✅ 能查询单个联系人详情
- [ ] ✅ 能更新联系人信息
- [ ] ✅ 能删除联系人
- [ ] ✅ 删除后列表为空
- [ ] ✅ 手机号格式验证正确
- [ ] ✅ 邮箱格式验证正确
- [ ] ✅ 必填字段验证正确
- [ ] ✅ JWT认证保护生效（无Token时返回401）
- [ ] ✅ 数据库外键约束正常工作
- [ ] ✅ 只能操作自己的联系人（隔离性）

---

## 权限隔离测试

### 1. 创建第二个测试用户

```bash
# 发送验证码
curl -X POST http://localhost:5210/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13900143333"}'

# 登录
curl -X POST http://localhost:5210/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13900143333","code":"YOUR_CODE"}'
```

### 2. 用户A添加联系人，用户B尝试访问

**用户A添加联系人（保存返回的CONTACT_ID）**
```bash
curl -X POST http://localhost:5210/contacts \
  -H "Authorization: Bearer TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试A","phone":"13800138000","relationship":"家人"}'
```

**用户B尝试查询用户A的联系人（应该返回404）**
```bash
curl -X GET http://localhost:5210/contacts/CONTACT_ID_OF_A \
  -H "Authorization: Bearer TOKEN_B"
```

**预期响应**: 404错误，提示"联系人不存在"

---

## 自动化测试脚本

保存以下脚本为 `test-contacts.sh`：

```bash
#!/bin/bash

BASE_URL="http://localhost:5210"
PHONE="13900142222"

echo "=== 测试开始 ==="

# 1. 发送验证码
echo -e "\n1. 发送验证码..."
curl -s -X POST $BASE_URL/auth/send-code \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\"}"

# 等待用户输入验证码
read -p "请输入验证码: " CODE

# 2. 登录
echo -e "\n2. 登录获取Token..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"code\":\"$CODE\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 3. 添加联系人
echo -e "\n3. 添加联系人..."
ADD_RESPONSE=$(curl -s -X POST $BASE_URL/contacts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试联系人","phone":"13800138000","email":"test@example.com","relationship":"家人"}')
echo $ADD_RESPONSE

CONTACT_ID=$(echo $ADD_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "联系人ID: $CONTACT_ID"

# 4. 查询列表
echo -e "\n4. 查询联系人列表..."
curl -s -X GET $BASE_URL/contacts \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 5. 更新联系人
echo -e "\n5. 更新联系人..."
curl -s -X PUT $BASE_URL/contacts/$CONTACT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"更新后的名字"}' | python3 -m json.tool

# 6. 删除联系人
echo -e "\n6. 删除联系人..."
curl -s -X DELETE $BASE_URL/contacts/$CONTACT_ID \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== 测试完成 ==="
```

运行方式:
```bash
chmod +x test-contacts.sh
./test-contacts.sh
```

---

## 已知问题

无

---

## 下一步计划

完成联系人模块测试后，进入 **阶段1.4: 通知服务模块开发**