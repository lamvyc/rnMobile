# 统一 API 响应格式规范

## 📋 概述

本项目已实现全局异常过滤器和响应拦截器，所有 API 接口遵循统一的响应格式。

---

## ✅ 成功响应格式

```json
{
  "code": 200,
  "data": {
    // 实际业务数据
  },
  "message": "操作成功",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/api/contacts"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | HTTP 状态码，200 表示成功 |
| data | any | 业务数据，可以是对象、数组或基本类型 |
| message | string | 操作结果描述 |
| timestamp | string | 响应时间戳（格式：yyyy-MM-dd HH:mm:ss） |
| path | string | 请求路径 |

---

## ❌ 错误响应格式

```json
{
  "code": 400,
  "data": null,
  "message": "手机号格式不正确",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/api/auth/login"
}
```

### 常见错误码

| Code | 说明 | 常见场景 |
|------|------|----------|
| 400 | 请求参数错误 | DTO 验证失败、业务规则违反 |
| 401 | 未授权 | Token 无效、Token 过期、未登录 |
| 403 | 禁止访问 | 权限不足 |
| 404 | 资源不存在 | 查询的数据不存在 |
| 500 | 服务器内部错误 | 未预期的运行时异常 |

---

## 📚 实际接口示例

### 1. 认证接口

#### 发送验证码

**请求：**
```http
POST /auth/send-code
Content-Type: application/json

{
  "phone": "13800138000"
}
```

**成功响应：**
```json
{
  "code": 200,
  "data": {
    "message": "验证码已发送"
  },
  "message": "操作成功",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/auth/send-code"
}
```

**失败响应（频率限制）：**
```json
{
  "code": 400,
  "data": null,
  "message": "请55秒后再试",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/auth/send-code"
}
```

#### 登录

**请求：**
```http
POST /auth/login
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456"
}
```

**成功响应：**
```json
{
  "code": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "nickname": "用户8000",
      "avatar": null
    }
  },
  "message": "操作成功",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/auth/login"
}
```

**失败响应（验证码错误）：**
```json
{
  "code": 401,
  "data": null,
  "message": "验证码错误",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/auth/login"
}
```

---

### 2. 签到接口

#### 执行签到

**请求：**
```http
POST /checkin
Authorization: Bearer <token>
```

**成功响应：**
```json
{
  "code": 200,
  "data": {
    "message": "签到成功",
    "checkinDate": "2024-01-27",
    "checkinTime": "2024-01-27 18:20:00",
    "consecutiveDays": 7,
    "totalDays": 30
  },
  "message": "签到成功",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/checkin"
}
```

**失败响应（今日已签到）：**
```json
{
  "code": 400,
  "data": null,
  "message": "今天已经签到过了",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/checkin"
}
```

**失败响应（未登录）：**
```json
{
  "code": 401,
  "data": null,
  "message": "Unauthorized",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/checkin"
}
```

---

### 3. 联系人接口

#### 添加联系人

**请求：**
```http
POST /contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "张三",
  "phone": "13800138001",
  "email": "zhangsan@example.com",
  "relationship": "父亲"
}
```

**成功响应：**
```json
{
  "code": 200,
  "data": {
    "contact": {
      "id": "uuid",
      "name": "张三",
      "phone": "13800138001",
      "email": "zhangsan@example.com",
      "relationship": "父亲",
      "isVerified": false,
      "createdAt": "2024-01-27 18:20:00"
    }
  },
  "message": "联系人添加成功",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/contacts"
}
```

**失败响应（超过数量限制）：**
```json
{
  "code": 400,
  "data": null,
  "message": "每个用户最多只能添加3个紧急联系人",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/contacts"
}
```

**失败响应（验证失败）：**
```json
{
  "code": 400,
  "data": null,
  "message": "手机号格式不正确",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/contacts"
}
```

#### 获取联系人列表

**请求：**
```http
GET /contacts
Authorization: Bearer <token>
```

**成功响应：**
```json
{
  "code": 200,
  "data": {
    "contacts": [
      {
        "id": "uuid",
        "name": "张三",
        "phone": "13800138001",
        "email": "zhangsan@example.com",
        "relationship": "父亲",
        "priority": 1,
        "isVerified": false,
        "createdAt": "2024-01-27 18:20:00",
        "updatedAt": "2024-01-27 18:20:00"
      }
    ],
    "total": 1
  },
  "message": "操作成功",
  "timestamp": "2024-01-27 18:20:00",
  "path": "/contacts"
}
```

---

## 💡 前端对接建议

### Axios 拦截器配置

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5210',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    
    if (code === 200) {
      return data; // 直接返回业务数据
    } else {
      // 非 200 状态码当作错误处理
      return Promise.reject(new Error(message || '请求失败'));
    }
  },
  (error) => {
    if (error.response) {
      const { code, message } = error.response.data;
      
      // 统一错误提示
      if (code === 401) {
        // Token 过期，跳转登录
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error(message || '请求失败'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 使用示例

```typescript
// 登录
async function login(phone: string, code: string) {
  try {
    const data = await api.post('/auth/login', { phone, code });
    // data 直接是 { accessToken, user }
    localStorage.setItem('token', data.accessToken);
    return data.user;
  } catch (error) {
    // error.message 是后端返回的 message
    alert(error.message);
  }
}

// 获取联系人列表
async function getContacts() {
  try {
    const data = await api.get('/contacts');
    // data 直接是 { contacts, total }
    return data.contacts;
  } catch (error) {
    alert(error.message);
  }
}
```

---

## 🎯 最佳实践

### 后端开发规范

1. **Controller 层**：
   - 直接返回业务数据，无需手动包装
   - 包含 `message` 字段会被自动提取

2. **Service 层**：
   - 返回纯业务数据
   - 使用 NestJS 内置异常类抛出错误

3. **异常处理**：
   ```typescript
   // ✅ 推荐
   if (!user) {
     throw new NotFoundException('用户不存在');
   }
   
   // ❌ 不推荐
   return { success: false, message: '用户不存在' };
   ```

### 前端开发规范

1. **统一使用 Axios 拦截器处理响应**
2. **只关注 `code` 字段判断成功/失败**
3. **错误信息统一从 `message` 字段获取**
4. **401 错误统一处理为跳转登录**

---

## 📝 更新日志

- **2024-01-27**：实现全局异常过滤器和响应拦截器
- **2024-01-27**：统一所有时间字段格式为 `yyyy-MM-dd HH:mm:ss`

---

**文档维护者：开发团队**