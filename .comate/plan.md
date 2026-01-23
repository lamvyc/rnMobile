# "称平安"APP 开发计划 v1.0

## 📋 项目概述

### 产品定位
面向独居人群的轻量化安全工具，通过每日签到机制和自动通知系统，为独居者提供安全守护。

### 核心功能
- ✅ 每日签到打卡（24小时内任意时间）
- ✅ 连续2天未签到自动触发通知
- ✅ 短信通知（优先）+ 邮件通知（备用）
- ✅ 紧急联系人管理（首版1个，后续扩展3个）
- ✅ 手机号验证码登录

### 技术栈确认
- **前端**: React Native + Expo
- **后端**: NestJS + TypeScript
- **数据库**: PostgreSQL
- **缓存**: Redis
- **通知服务**: 阿里云短信 + 阿里云邮件推送
- **部署**: 阿里云 ECS + RDS + Redis

---

## 🎯 开发阶段规划

### 阶段 0: 环境准备与项目初始化（预计2天）✅ **已完成**

- [x] **0.1 创建项目目录结构** ✅
  - ✅ 创建 `backend/` 目录用于NestJS后端
  - ✅ 创建 `mobile/` 目录用于React Native前端
  - ✅ 创建 `docs/` 目录存放文档

- [x] **0.2 后端项目初始化** ✅
  - ✅ 全局安装 `@nestjs/cli`
  - ✅ 创建 NestJS 项目于 `backend/`
  - ✅ 配置 TypeScript 编译选项（已由nest cli自动完成）
  - ✅ 安装核心依赖（typeorm, pg, redis, class-validator, @nestjs/jwt, @nestjs/passport等）
  - ✅ 配置 ESLint + Prettier 代码规范（已由nest cli自动完成）
  - ✅ 创建 `.env` 和 `.env.example` 配置文件

- [x] **0.3 前端项目初始化** ✅
  - ✅ 安装 Expo CLI（使用npx方式）
  - ✅ 创建 React Native 项目于 `mobile/`（使用blank-typescript模板）
  - ✅ 安装导航库 `@react-navigation/native`、`@react-navigation/native-stack`、`@react-navigation/bottom-tabs`
  - ✅ 安装必要依赖（react-native-screens, react-native-safe-area-context, axios）
  - ✅ 配置 TypeScript 支持（已由expo自动完成）

- [ ] **0.4 数据库环境准备** ⚠️ 待完成
  - 本地安装 PostgreSQL（或使用Docker）
  - 本地安装 Redis（或使用Docker）
  - 创建开发数据库 `pingan_dev`

- [ ] **0.5 阿里云账号准备** ⚠️ 后续完成
  - 注册阿里云账号
  - 开通短信服务（申请签名和模板）
  - 开通邮件推送服务
  - 获取 AccessKey（用于后端调用）
  - 📝 注：可在后续开发中逐步完成

**验证标准**: 
- ✅ 后端项目能成功启动（`npm run start:dev`）- 已验证
- ⚠️ 前端项目能在模拟器/真机运行（`expo start`）- 待验证
- ⚠️ 数据库连接测试通过 - 待配置数据库后验证

**完成时间**: 2026-01-22 19:52
**下一步**: 进入阶段1 - 后端核心模块开发

---

### 阶段 1: 后端核心模块开发（预计7-10天）

#### 1.1 用户认证模块（2天）✅ **已完成**

- [x] **1.1.1 创建 Users 模块** ✅
  - ✅ 文件: `backend/src/users/users.module.ts`
  - ✅ 文件: `backend/src/users/users.controller.ts`
  - ✅ 文件: `backend/src/users/users.service.ts`
  - ✅ 文件: `backend/src/users/entities/user.entity.ts`

- [x] **1.1.2 用户实体设计** ✅
  - ✅ 涉及文件: `user.entity.ts`
  - ✅ 字段设计已实现:
    ```
    - id: UUID (主键) ✅
    - phone: string (手机号，唯一) ✅
    - nickname: string (昵称，可选) ✅
    - avatar: string (头像URL，可选) ✅
    - status: enum (账号状态: active/suspended) ✅
    - lastCheckinAt: Date (最后签到时间) ✅ 新增
    - createdAt: timestamp ✅
    - updatedAt: timestamp ✅
    ```

- [x] **1.1.3 创建 Auth 模块** ✅
  - ✅ 文件: `backend/src/auth/auth.module.ts`
  - ✅ 文件: `backend/src/auth/auth.controller.ts`
  - ✅ 文件: `backend/src/auth/auth.service.ts`
  - ✅ 文件: `backend/src/auth/strategies/jwt.strategy.ts`
  - ✅ 文件: `backend/src/auth/guards/jwt-auth.guard.ts`
  - ✅ 文件: `backend/src/auth/dto/send-code.dto.ts`
  - ✅ 文件: `backend/src/auth/dto/login.dto.ts`

- [x] **1.1.4 实现短信验证码登录** ✅
  - ✅ 涉及文件: `auth.controller.ts`, `auth.service.ts`
  - ✅ 接口: `POST /auth/send-code` (发送验证码) - 测试通过
  - ✅ 接口: `POST /auth/login` (验证码登录) - 测试通过
  - ✅ 验证码存储: Redis (5分钟过期)
  - ✅ JWT Token 生成和验证
  - ✅ 限流保护: 同一手机号1分钟内只能发送1次

- [x] **1.1.5 集成短信服务（开发环境）** ✅
  - ✅ 开发环境: 验证码打印在控制台
  - ⚠️ 生产环境: 待集成阿里云短信服务（后续完成）

- [x] **1.1.6 实现 JWT Guard** ✅
  - ✅ 文件: `backend/src/auth/guards/jwt-auth.guard.ts`
  - ✅ 功能: 保护需要登录的接口

**验证标准** ✅:
- ✅ 能通过curl测试发送验证码和登录流程
- ✅ JWT Token 能正确生成和验证
- ✅ 数据库中能正确创建用户记录
- ✅ 限流保护正常工作
- ✅ 数据验证正确（手机号、验证码格式）

**测试结果（2026-01-23）**:
```
测试用例1: 发送验证码
curl -X POST http://localhost:3000/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'
结果: ✅ 成功返回 {"message":"验证码已发送"}

测试用例2: 验证码登录
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"357524"}'
结果: ✅ 成功返回JWT Token和用户信息

测试用例3: 数据持久化
psql查询: SELECT * FROM users;
结果: ✅ 用户数据正确保存，包含UUID、手机号、昵称等

测试用例4: 限流保护
1分钟内重复发送验证码
结果: ✅ 正确拦截，返回 "请44秒后再试"
```

**完成时间**: 2026-01-23 14:50
**下一步**: 进入1.2 签到模块开发

#### 1.2 签到模块（2天）

- [ ] **1.2.1 创建 Checkin 模块**
  - 文件: `backend/src/checkin/checkin.module.ts`
  - 文件: `backend/src/checkin/checkin.controller.ts`
  - 文件: `backend/src/checkin/checkin.service.ts`
  - 文件: `backend/src/checkin/entities/checkin.entity.ts`

- [ ] **1.2.2 签到实体设计**
  - 涉及文件: `checkin.entity.ts`
  - 字段设计:
    ```
    - id: UUID (主键)
    - userId: UUID (外键关联user)
    - checkinDate: date (签到日期，格式: YYYY-MM-DD)
    - checkinTime: timestamp (具体签到时间)
    - createdAt: timestamp
    ```
  - 索引: userId + checkinDate (联合唯一索引)

- [ ] **1.2.3 实现签到接口**
  - 涉及文件: `checkin.controller.ts`, `checkin.service.ts`
  - 接口: `POST /checkin` (每日签到)
  - 业务逻辑:
    - 检查今天是否已签到（防重复）
    - 记录签到时间
    - 更新用户最后签到时间
    - 返回连续签到天数

- [ ] **1.2.4 实现签到历史查询**
  - 接口: `GET /checkin/history` (查询签到历史)
  - 接口: `GET /checkin/status` (查询今日签到状态)
  - 返回: 最近30天签到记录

- [ ] **1.2.5 签到统计功能**
  - 涉及文件: `checkin.service.ts`
  - 功能: 计算连续签到天数
  - 功能: 统计总签到天数

**验证标准**:
- 能正确记录每日签到
- 同一天重复签到会被拦截
- 签到历史查询返回正确

#### 1.3 紧急联系人模块（1-2天）

- [ ] **1.3.1 创建 Contacts 模块**
  - 文件: `backend/src/contacts/contacts.module.ts`
  - 文件: `backend/src/contacts/contacts.controller.ts`
  - 文件: `backend/src/contacts/contacts.service.ts`
  - 文件: `backend/src/contacts/entities/contact.entity.ts`

- [ ] **1.3.2 联系人实体设计**
  - 涉及文件: `contact.entity.ts`
  - 字段设计:
    ```
    - id: UUID (主键)
    - userId: UUID (外键关联user)
    - name: string (联系人姓名)
    - phone: string (手机号)
    - email: string (邮箱，可选)
    - relationship: string (关系，如：家人/朋友)
    - priority: number (优先级，1最高)
    - isVerified: boolean (是否已验证)
    - createdAt: timestamp
    - updatedAt: timestamp
    ```

- [ ] **1.3.3 实现联系人管理接口**
  - 接口: `POST /contacts` (添加联系人)
  - 接口: `GET /contacts` (查询联系人列表)
  - 接口: `PUT /contacts/:id` (更新联系人)
  - 接口: `DELETE /contacts/:id` (删除联系人)
  - 限制: 首版每个用户最多1个联系人

- [ ] **1.3.4 联系人验证机制（可选）**
  - 发送验证短信/邮件给联系人
  - 联系人确认后标记为已验证

**验证标准**:
- 能添加和管理紧急联系人
- 首版限制1个联系人生效
- 数据校验正确（手机号格式、邮箱格式）

#### 1.4 通知服务模块（2天）

- [ ] **1.4.1 创建 Notifications 模块**
  - 文件: `backend/src/notifications/notifications.module.ts`
  - 文件: `backend/src/notifications/notifications.service.ts`
  - 文件: `backend/src/notifications/services/sms.service.ts`
  - 文件: `backend/src/notifications/services/email.service.ts`

- [ ] **1.4.2 集成阿里云短信服务**
  - 涉及文件: `sms.service.ts`
  - 功能: 发送"未签到警告"短信
  - 模板内容: "【称平安】您的亲友{userName}已连续{days}天未签到，请及时关注其安全状况。"

- [ ] **1.4.3 集成阿里云邮件推送**
  - 涉及文件: `email.service.ts`
  - 功能: 发送"未签到警告"邮件
  - 邮件模板: HTML格式，包含用户信息和操作指引

- [ ] **1.4.4 实现通知策略**
  - 涉及文件: `notifications.service.ts`
  - 策略: 优先发送短信，失败则发邮件
  - 记录: 保存通知发送记录（成功/失败）

- [ ] **1.4.5 通知记录实体**
  - 文件: `backend/src/notifications/entities/notification-log.entity.ts`
  - 字段设计:
    ```
    - id: UUID
    - userId: UUID
    - contactId: UUID
    - type: enum (sms/email)
    - status: enum (success/failed)
    - content: text (发送内容)
    - sentAt: timestamp
    ```

**验证标准**:
- 能成功发送测试短信
- 能成功发送测试邮件
- 通知记录正确保存

#### 1.5 定时任务模块（1-2天）

- [ ] **1.5.1 创建 Scheduler 模块**
  - 文件: `backend/src/scheduler/scheduler.module.ts`
  - 文件: `backend/src/scheduler/scheduler.service.ts`

- [ ] **1.5.2 实现签到检查任务**
  - 涉及文件: `scheduler.service.ts`
  - 使用: `@nestjs/schedule` 库
  - 定时: 每天凌晨1点执行
  - 逻辑:
    1. 查询所有用户
    2. 检查每个用户最近2天是否有签到记录
    3. 如果连续2天未签到，触发通知
    4. 记录通知发送结果

- [ ] **1.5.3 健康检查任务**
  - 定时: 每小时执行一次
  - 功能: 检查数据库、Redis连接状态
  - 功能: 记录服务运行状态

**验证标准**:
- 定时任务能正确触发
- 未签到用户能收到通知
- 日志记录清晰

---

### 阶段 2: 移动端开发（预计7-10天）

#### 2.1 项目基础搭建（1天）

- [ ] **2.1.1 配置导航结构**
  - 文件: `mobile/src/navigation/AppNavigator.tsx`
  - 页面路由:
    - Auth Stack (登录/注册)
    - Main Stack (主界面/设置)

- [ ] **2.1.2 HTTP请求封装**
  - 文件: `mobile/src/services/api.ts`
  - 功能: Axios 实例配置
  - 功能: 请求/响应拦截器
  - 功能: Token 自动注入

- [ ] **2.1.3 状态管理**
  - 选择方案: Context API 或 Redux Toolkit
  - 文件: `mobile/src/store/` 或 `mobile/src/contexts/`
  - 管理: 用户登录状态、签到状态

- [ ] **2.1.4 本地存储封装**
  - 文件: `mobile/src/utils/storage.ts`
  - 功能: AsyncStorage 封装
  - 存储: JWT Token, 用户信息

**验证标准**:
- 导航跳转正常
- HTTP请求能正确调用后端接口
- Token 持久化存储

#### 2.2 登录注册页面（2天）

- [ ] **2.2.1 登录页面开发**
  - 文件: `mobile/src/screens/LoginScreen.tsx`
  - UI组件:
    - 手机号输入框（带格式校验）
    - 验证码输入框
    - "获取验证码"按钮（倒计时60秒）
    - "登录"按钮
  - 交互逻辑:
    - 调用 `POST /auth/send-code`
    - 调用 `POST /auth/login`
    - 保存 Token 并跳转主页

- [ ] **2.2.2 表单验证**
  - 手机号格式验证（11位数字）
  - 验证码格式验证（6位数字）
  - 错误提示友好展示

- [ ] **2.2.3 首次使用引导**
  - 文件: `mobile/src/screens/OnboardingScreen.tsx`
  - 功能: 轮播图介绍APP功能
  - 功能: 首次登录后显示，可跳过

**验证标准**:
- 能成功接收验证码
- 能正确登录并保存Token
- UI界面美观友好

#### 2.3 主页-签到功能（2天）

- [ ] **2.3.1 主页布局**
  - 文件: `mobile/src/screens/HomeScreen.tsx`
  - UI组件:
    - 顶部用户信息（昵称/头像）
    - 中间大按钮: "今日签到" / "已签到"
    - 底部签到日历视图（展示最近30天）
    - 连续签到天数展示

- [ ] **2.3.2 签到按钮交互**
  - 状态切换: 未签到 / 已签到
  - 点击效果: 动画反馈（如涟漪效果）
  - 调用接口: `POST /checkin`
  - 成功提示: Toast 或 Modal

- [ ] **2.3.3 签到日历组件**
  - 文件: `mobile/src/components/CheckinCalendar.tsx`
  - 功能: 展示最近30天签到状态
  - 样式: 已签到显示绿色圆点，未签到灰色

- [ ] **2.3.4 签到统计卡片**
  - 展示: 连续签到天数
  - 展示: 累计签到天数
  - 展示: 本月签到天数

**验证标准**:
- 签到功能正常
- 日历正确显示签到记录
- 统计数据准确

#### 2.4 紧急联系人管理（2天）

- [ ] **2.4.1 联系人列表页**
  - 文件: `mobile/src/screens/ContactsScreen.tsx`
  - UI组件:
    - 联系人卡片（姓名、关系、手机号）
    - "添加联系人"按钮
    - 空状态提示

- [ ] **2.4.2 添加联系人页面**
  - 文件: `mobile/src/screens/AddContactScreen.tsx`
  - 表单字段:
    - 姓名输入框
    - 关系选择（家人/朋友/其他）
    - 手机号输入框
    - 邮箱输入框（可选）
  - 提交: 调用 `POST /contacts`

- [ ] **2.4.3 编辑/删除联系人**
  - 长按卡片显示操作菜单
  - 编辑: 调用 `PUT /contacts/:id`
  - 删除: 二次确认后调用 `DELETE /contacts/:id`

**验证标准**:
- 能添加和管理联系人
- 首版限制1个联系人生效
- 表单验证正确

#### 2.5 个人中心页面（1天）

- [ ] **2.5.1 个人信息页**
  - 文件: `mobile/src/screens/ProfileScreen.tsx`
  - UI组件:
    - 头像（可点击上传）
    - 昵称（可编辑）
    - 手机号（不可编辑）
    - 注册时间

- [ ] **2.5.2 设置页面**
  - 文件: `mobile/src/screens/SettingsScreen.tsx`
  - 功能项:
    - 关于我们
    - 用户协议
    - 隐私政策
    - 退出登录

- [ ] **2.5.3 头像上传（可选）**
  - 调用相册/相机
  - 上传到阿里云OSS
  - 更新用户头像URL

**验证标准**:
- 个人信息展示正确
- 退出登录功能正常

---

### 阶段 3: 联调与测试（预计3-5天）

#### 3.1 前后端联调（2天）

- [ ] **3.1.1 接口对接测试**
  - 测试: 登录流程完整走通
  - 测试: 签到功能正常
  - 测试: 联系人管理正常
  - 测试: 定时任务触发通知

- [ ] **3.1.2 错误处理**
  - 后端: 统一错误响应格式
  - 前端: 错误提示友好展示
  - 网络异常处理

- [ ] **3.1.3 性能优化**
  - 接口响应时间优化（目标<500ms）
  - 图片懒加载
  - 列表分页加载

**验证标准**:
- 所有核心功能流程跑通
- 无明显bug

#### 3.2 功能测试（1-2天）

- [ ] **3.2.1 核心功能测试**
  - 测试用例: 新用户注册登录
  - 测试用例: 每日签到
  - 测试用例: 连续2天未签到触发通知
  - 测试用例: 添加/删除联系人

- [ ] **3.2.2 边界场景测试**
  - 测试: 重复签到拦截
  - 测试: 验证码过期处理
  - 测试: Token 过期自动刷新
  - 测试: 网络断开重连

- [ ] **3.2.3 兼容性测试**
  - iOS 真机测试（iOS 13+）
  - Android 真机测试（Android 8+）
  - 不同屏幕尺寸适配

**验证标准**:
- 所有测试用例通过
- 无严重bug

#### 3.3 用户体验优化（1天）

- [ ] **3.3.1 UI/UX 优化**
  - 加载状态友好提示
  - 按钮点击反馈
  - 页面切换动画流畅

- [ ] **3.3.2 性能监控**
  - 集成错误监控（如 Sentry）
  - 记录关键操作日志

**验证标准**:
- 用户体验流畅
- 无明显卡顿

---

### 阶段 4: 部署上线（预计3-5天）

#### 4.1 后端部署（2天）

- [ ] **4.1.1 购买阿里云资源**
  - ECS 服务器（2核4G起步）
  - RDS PostgreSQL 数据库
  - Redis 实例
  - 域名（需备案）

- [ ] **4.1.2 服务器环境搭建**
  - 安装 Node.js（v18+）
  - 安装 PM2 进程管理器
  - 配置 Nginx 反向代理
  - 配置 HTTPS 证书（Let's Encrypt）

- [ ] **4.1.3 数据库迁移**
  - 导出本地数据库结构
  - 在 RDS 中执行迁移脚本
  - 配置数据库连接信息

- [ ] **4.1.4 后端代码部署**
  - 配置生产环境变量（.env.production）
  - 构建生产代码（`npm run build`）
  - 使用 PM2 启动服务
  - 配置自动重启和日志

- [ ] **4.1.5 定时任务部署**
  - 确认定时任务正常运行
  - 配置日志轮转

**验证标准**:
- 后端服务稳定运行
- 接口通过域名可访问
- 定时任务正常触发

#### 4.2 移动端打包（2天）

- [ ] **4.2.1 iOS 打包**
  - 配置 Apple Developer 账号
  - 配置 App ID 和证书
  - 使用 EAS Build 或 Xcode 打包
  - 上传到 App Store Connect
  - 提交审核

- [ ] **4.2.2 Android 打包**
  - 配置签名密钥
  - 生成 APK/AAB 文件
  - 上传到应用商店（如应用宝、华为应用市场）

- [ ] **4.2.3 配置生产环境API地址**
  - 修改 `mobile/src/config.ts`
  - 将 API_BASE_URL 改为生产域名

**验证标准**:
- iOS/Android 包能正常安装运行
- 连接生产服务器正常

#### 4.3 监控与运维（1天）

- [ ] **4.3.1 日志管理**
  - 配置日志收集（如 Winston + File Transport）
  - 配置日志告警（如 PM2 邮件通知）

- [ ] **4.3.2 性能监控**
  - 配置 APM 工具（如阿里云 ARMS）
  - 监控 API 响应时间
  - 监控数据库查询性能

- [ ] **4.3.3 备份策略**
  - 配置数据库自动备份（每日）
  - 配置代码自动备份（Git）

**验证标准**:
- 日志正常输出
- 监控告警生效
- 备份策略生效

---

## 📊 里程碑与验收标准

### Milestone 1: 后端核心功能完成（第10天）
- ✅ 用户认证模块完成
- ✅ 签到模块完成
- ✅ 联系人模块完成
- ✅ 通知模块完成
- ✅ 定时任务完成
- ✅ 所有接口通过 Postman 测试

### Milestone 2: 移动端核心功能完成（第20天）
- ✅ 登录注册页面完成
- ✅ 签到功能完成
- ✅ 联系人管理完成
- ✅ 个人中心完成
- ✅ 前后端联调完成

### Milestone 3: 测试与优化完成（第25天）
- ✅ 所有功能测试通过
- ✅ 性能优化完成
- ✅ 用户体验优化完成

### Milestone 4: 上线发布（第30天）
- ✅ 后端部署完成
- ✅ 移动端打包上传
- ✅ 监控运维配置完成

---

## 🚀 后续迭代计划（v1.1+）

### v1.1 功能增强（预计2周）
- [ ] 支持3个紧急联系人
- [ ] 签到提醒推送（每日固定时间）
- [ ] 签到数据统计图表
- [ ] 个性化签到文案

### v1.2 社区功能（预计3周）
- [ ] 用户动态/树洞
- [ ] 评论点赞功能
- [ ] 私信功能

### v1.3 商业化（预计2周）
- [ ] 付费订阅功能
- [ ] 会员权益体系
- [ ] 支付接口集成（微信/支付宝）

---

## 📝 注意事项与风险提示

### 技术风险
1. **短信通道稳定性**: 阿里云短信需要提前申请签名和模板，审核时间约1-3个工作日
2. **定时任务可靠性**: 需监控定时任务执行情况，避免漏发通知
3. **数据库性能**: 用户量增长后需优化查询索引

### 合规风险
1. **用户隐私保护**: 必须添加用户协议和隐私政策
2. **域名备案**: 使用阿里云需完成ICP备案（约7-20个工作日）
3. **应用商店审核**: 注意避免敏感词汇和功能描述

### 运营风险
1. **成本控制**: 短信费用按量计费，需监控成本
2. **用户留存**: 需设计有效的留存策略（如签到奖励）

---

## 📚 参考资源

### 技术文档
- NestJS 官方文档: https://docs.nestjs.com/
- React Native 官方文档: https://reactnative.dev/
- Expo 官方文档: https://docs.expo.dev/
- TypeORM 官方文档: https://typeorm.io/
- 阿里云短信服务: https://help.aliyun.com/product/44282.html

### 设计参考
- "死了么" APP 截图和功能分析
- Material Design 设计规范
- iOS Human Interface Guidelines

### 社区资源
- NestJS GitHub: https://github.com/nestjs/nest
- React Native Community: https://github.com/react-native-community

---

**计划制定完成时间**: 2026-01-22
**预计开发周期**: 4-6周（28-42天）
**负责人**: [待填写]
**开始日期**: [待确认]

---

## 🔄 计划变更记录

| 日期 | 版本 | 变更内容 | 变更人 |
|------|------|---------|--------|
| 2026-01-22 | v1.0 | 初始计划制定 | Plan AI |