# 如何运行"称平安"APP项目

## 📋 前置条件

### 必需软件
- Node.js >= 18.0.0
- npm >= 10.0.0
- PostgreSQL >= 14
- Redis >= 6

### 可选工具
- Docker（用于快速启动数据库）
- Postman 或 curl（用于API测试）

---

## ?? 快速启动

### 1. 安装数据库（macOS Homebrew）

```bash
# 安装 PostgreSQL 和 Redis
brew install postgresql@14 redis

# 启动服务
brew services start postgresql@14
brew services start redis
```

> **注意：createuser / createdb 路径因芯片不同而异**

**Apple Silicon Mac（M1 / M2 / M3，默认）**
```bash
# 创建 postgres 用户（如果不存在）
/opt/homebrew/opt/postgresql@14/bin/createuser -s postgres

# 创建数据库
/opt/homebrew/opt/postgresql@14/bin/createdb pingan_dev
```

**Intel Mac**
```bash
# 创建 postgres 用户（如果不存在）
/usr/local/opt/postgresql@14/bin/createuser -s postgres

# 创建数据库
/usr/local/opt/postgresql@14/bin/createdb pingan_dev
```

> 也可以直接用命令（两种芯片通用，前提是 `brew` 已加入 PATH）：
> ```bash
> createuser -s postgres
> createdb pingan_dev
> ```
>
> 不确定自己的芯片类型？运行 `uname -m`：输出 `arm64` = Apple Silicon，`x86_64` = Intel

### 2. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 启动开发服务器
npm run start:dev
```

服务将在 http://localhost:5210 启动。

http://localhost:5210/api-docs 访问swagger文档。

### 3. 测试接口

#### 发送验证码
```bash
curl -X POST http://localhost:3000/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'
```

在终端日志中查找验证码：
```
[开发环境] 验证码: 123456 (手机号: 13800138000)
```

#### 登录
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456"}'
```

成功后会返回JWT Token和用户信息。

---

## 🐳 使用Docker（备选方案）

如果你有Docker，可以这样启动数据库：

```bash
# 启动 PostgreSQL
docker run --name pingan-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pingan_dev \
  -p 5432:5432 \
  -d postgres:14

# 启动 Redis
docker run --name pingan-redis \
  -p 6379:6379 \
  -d redis:6
```

---

## 📱 启动移动端

```bash
# 进入移动端目录
cd mobile

# 安装依赖
npm install

# 启动 Expo 开发服务器
npx expo start
```

> **真机调试注意**：将 `mobile/src/config.ts` 中的 `DEV_API_URL` 改为本机局域网 IP，例如：
> ```ts
> const DEV_API_URL = 'http://192.168.x.x:3000';
> ```
> 模拟器可直接使用 `http://localhost:3000`。

---

## 🔧 常见问题

### Q1: 端口3000被占用？
```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死进程
kill -9 <PID>
```

### Q2: 数据库连接失败？
1. 确认PostgreSQL服务已启动
2. 检查 `.env` 中的数据库配置
3. 确认 `postgres` 用户存在

### Q3: Redis连接失败？
1. 确认Redis服务已启动
2. 运行 `redis-cli ping` 测试连接

---

## 📚 更多文档

- [开发计划](.plan/plan.md)
- [阶段1进度](docs/stage1-progress.md)
- [阶段1.1总结](docs/stage1.1-summary.md)

---

**最后更新**: 2026-02-28