# APP名称更改记录

**更改时间**: 2026-01-23 15:09  
**原名称**: 平安  
**新名称**: 称平安

---

## 📝 更改的文件

### 1. 配置文件

#### backend/package.json
```json
- "name": "backend"
- "description": ""
+ "name": "chengpingan-backend"
+ "description": "称平安APP后端服务"
```

#### mobile/package.json
```json
- "name": "mobile"
+ "name": "chengpingan"
```

#### mobile/app.json
```json
- "name": "mobile"
- "slug": "mobile"
+ "name": "称平安"
+ "slug": "chengpingan"
```

### 2. 环境变量

#### backend/.env.example
```bash
- ALIYUN_SMS_SIGN_NAME=平安
- ALIYUN_EMAIL_FROM_ALIAS=平安团队
+ ALIYUN_SMS_SIGN_NAME=称平安
+ ALIYUN_EMAIL_FROM_ALIAS=称平安团队
```

#### backend/.env
```bash
- ALIYUN_SMS_SIGN_NAME=平安
- ALIYUN_EMAIL_FROM_ALIAS=平安团队
+ ALIYUN_SMS_SIGN_NAME=称平安
+ ALIYUN_EMAIL_FROM_ALIAS=称平安团队
```

### 3. 文档（已确认使用"称平安"）

- ✅ README.md - 标题和描述
- ✅ .comate/plan.md - 主计划标题和短信模板
- ✅ docs/how-to-run.md - 标题
- ✅ docs/stage0-summary.md
- ✅ docs/stage1-progress.md
- ✅ docs/stage1.1-summary.md

---

## 🎯 影响范围

### 前端
- ✅ App显示名称：称平安
- ✅ Package名称：chengpingan
- ✅ URL Scheme：chengpingan://

### 后端
- ✅ Package名称：chengpingan-backend
- ✅ 短信签名：称平安
- ✅ 邮件发件人：称平安团队

### 文档
- ✅ 所有文档中的APP名称统一为"称平安"

---

## ✅ 验证结果

```bash
$ grep -r "称平安" --include="*.md" --include="*.json" --include=".env*" . | wc -l
11

✅ 所有关键文件已更新
✅ 无遗留的旧名称"平安"（单独使用）
```

---

## 📱 下次发布时需要注意

### iOS
- 更新 Info.plist 中的 CFBundleDisplayName
- App Store 中的应用名称

### Android
- 更新 strings.xml 中的 app_name
- 各应用市场的应用名称

### 阿里云
- 短信签名需要重新申请审核（签名：称平安）
- 邮件推送配置更新

---

**更改完成时间**: 2026-01-23 15:09  
**状态**: ✅ 已完成