# 称平安 APP

面向独居人群的轻量化安全工具，通过每日签到机制和自动通知系统，为独居者提供安全守护。

## 📱 项目简介

"称平安"是一款关注独居人群安全的移动应用，核心功能包括：

- ✅ 每日签到打卡（24小时内任意时间）
- ✅ 连续2天未签到自动触发通知
- ✅ 短信通知（优先）+ 邮件通知（备用）
- ✅ 紧急联系人管理
- ✅ 手机号验证码登录

## 🛠️ 技术栈

### 前端
- React Native + Expo
- TypeScript
- React Navigation

### 后端
- NestJS + TypeScript
- PostgreSQL
- Redis
- TypeORM

### 部署
- 阿里云 ECS
- 阿里云 RDS (PostgreSQL)
- 阿里云 Redis
- 阿里云短信服务
- 阿里云邮件推送

## 📂 项目结构

```
rnMobile/
├── backend/          # NestJS 后端服务
├── mobile/           # React Native 移动端
├── docs/             # 项目文档
├── .plan/          # 开发计划
│   └── plan.md       # 详细开发计划
└── README.md         # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 10.0.0
- PostgreSQL >= 14
- Redis >= 6

### 后端启动

```bash
cd backend
npm install
npm run start:dev
```

### 移动端启动

```bash
cd mobile
npm install
expo start
```

## 📋 开发计划

详细的开发计划请查看 [.plan/plan.md](.plan/plan.md)

## 📝 开发进度

- [x] 项目初始化
- [ ] 后端核心模块开发
- [ ] 移动端开发
- [ ] 联调测试
- [ ] 部署上线

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)

## 👥 团队

- 项目负责人: [待填写]
- 开发周期: 4-6周
- 开始日期: [待确认]

## 📞 联系方式

如有问题，请联系：[待填写]
```
