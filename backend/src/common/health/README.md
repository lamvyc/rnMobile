# 健康检查系统文档

本模块使用 `@nestjs/terminus` 提供完善的健康检查功能，帮助监控应用及其依赖服务的健康状态。

---

## 📋 健康检查端点

### **基础健康检查**
```http
GET /health
```

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": "2024-01-28T10:15:00.000Z",
  "uptime": 3600.123
}
```

**用途：**
- Kubernetes 活性探针（liveness probe）
- 负载均衡器健康检查
- 简单应用状态监控

---

### **全面健康检查**
```http
GET /health/full
```

**响应示例（正常）：**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "disk": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "disk": { "status": "up" }
  }
}
```

**响应示例（异常）：**
```json
{
  "status": "error",
  "info": {
    "memory_heap": { "status": "up" }
  },
  "error": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  },
  "details": {
    "memory_heap": { "status": "up" },
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  }
}
```

**用途：**
- Kubernetes 就绪探针（readiness probe）
- 全面系统健康监控
- 依赖服务健康检查

---

### **专用健康检查端点**

| 端点 | 用途 | 阈值配置 |
|------|------|----------|
| `GET /health/database` | 数据库连接检查 | 5秒超时 |
| `GET /health/memory` | 内存使用检查 | Heap: 200MB, RSS: 500MB |
| `GET /health/disk` | 磁盘空间检查 | 85% 使用率警告 |

---

## 🎯 集成方案

### **1. 容器化部署（Docker + Kubernetes）**

**Dockerfile：**
```dockerfile
# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5210/health || exit 1
```

**Kubernetes 配置：**
```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: chengpingan-backend
        # 活性探针 - 检查容器是否存活
        livenessProbe:
          httpGet:
            path: /health
            port: 5210
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          
        # 就绪探针 - 检查容器是否就绪接受流量
        readinessProbe:
          httpGet:
            path: /health/full
            port: 5210
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
```

### **2. 负载均衡器配置（Nginx）**

```nginx
upstream backend {
  server 127.0.0.1:5210;
  
  # 健康检查
  check interval=3000 rise=2 fall=3 timeout=1000;
}

server {
  location /health {
    # 用于负载均衡器健康检查
    proxy_pass http://backend;
    access_log off;
  }
  
  location / {
    proxy_pass http://backend;
  }
}
```

### **3. 监控系统（Prometheus + Grafana）**

虽然 terminus 不直接输出 Prometheus 指标，但可以通过：

1. **定期健康检查**：定时调用健康检查端点
2. **日志监控**：记录健康检查结果
3. **报警系统**：基于 HTTP 状态码设置报警

---

## 🔧 使用方法

### **作为开发者**

**查看健康状态：**
```bash
# 基础检查
curl http://localhost:5210/health

# 全面检查
curl http://localhost:5210/health/full

# 仅检查数据库
curl http://localhost:5210/health/database
```

**Swagger 文档：**
访问 `http://localhost:5210/api-docs` 查看健康检查 API 文档。

### **作为运维人员**

**容器编排监控：**
```bash
# Kubernetes 查看 Pod 状态
kubectl get pods
kubectl describe pod <pod-name>

# 查看健康检查日志
kubectl logs <pod-name> | grep -i health
```

**生产环境监控：**
```bash
# 使用监控工具定期检查
#!/bin/bash
while true; do
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5210/health/full)
  if [ "$response" != "200" ]; then
    echo "Health check failed: $response"
    # 发送报警
  fi
  sleep 60
done
```

---

## ⚙️ 配置调优

### **健康检查阈值**

当前配置（可在 `health.controller.ts` 中调整）：

| 检查项 | 阈值 | 说明 |
|--------|------|------|
| 数据库超时 | 5秒 | 数据库连接最大等待时间 |
| 内存堆使用 | 200MB | Node.js 堆内存使用警告阈值 |
| 内存 RSS 使用 | 500MB | 进程总内存使用警告阈值 |
| 磁盘使用率 | 85% | 根目录磁盘空间使用率警告 |

**调整示例：**
```typescript
// 降低内存阈值（适用于低配置服务器）
() => this.memory.checkHeap('memory_heap', 100 * 1024 * 1024), // 100MB
() => this.memory.checkRSS('memory_rss', 200 * 1024 * 1024),   // 200MB

// 提高磁盘使用率阈值
() => this.disk.checkStorage('disk', {
  path: '/',
  thresholdPercent: 0.95, // 95% 使用率警告
}),
```

### **环境特定配置**

**开发环境：**
```typescript
if (process.env.NODE_ENV === 'development') {
  // 放宽开发环境阈值
  thresholds = {
    memoryHeap: 500 * 1024 * 1024, // 500MB
    memoryRss: 1000 * 1024 * 1024, // 1GB
    diskUsage: 0.95, // 95%
  };
}
```

**生产环境：**
```typescript
if (process.env.NODE_ENV === 'production') {
  // 严格的生成环境阈值
  thresholds = {
    memoryHeap: 150 * 1024 * 1024, // 150MB
    memoryRss: 300 * 1024 * 1024,  // 300MB
    diskUsage: 0.8, // 80%
  };
}
```

---

## 🔍 故障排查

### **常见问题**

**1. 数据库连接失败**
```json
{
  "status": "error",
  "error": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  }
}
```

**解决方案：**
- 检查数据库服务状态
- 验证数据库连接配置
- 检查网络连通性

**2. 内存使用过高**
```json
{
  "status": "error",
  "error": {
    "memory_heap": {
      "status": "down",
      "message": "Used heap exceeded threshold"
    }
  }
}
```

**解决方案：**
- 检查内存泄漏
- 增加内存限制阈值
- 优化内存使用

**3. 磁盘空间不足**
```json
{
  "status": "error",
  "error": {
    "disk": {
      "status": "down",
      "message": "Disk usage exceeded threshold"
    }
  }
}
```

**解决方案：**
- 清理日志文件
- 增加磁盘空间
- 调整阈值配置

### **日志诊断**

健康检查会记录相应的日志：

```typescript
// 正常情况
logger.log('Health check requested', 'HealthController');

// 详细检查时
logger.debug('Database health check requested', 'HealthController');
```

查看日志定位问题：
```bash
# 查看健康检查相关日志
tail -f logs/combined.log | grep -i health

# 查看错误日志
tail -f logs/error.log
```

---

## ?? 扩展功能

### **自定义健康指示器**

如需添加更多健康检查项：

1. **创建自定义指示器：**
```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private redis: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}
```

2. **添加到健康检查：**
```typescript
@HealthCheck()
async redisCheck() {
  return this.health.check([
    () => this.redisHealth.isHealthy('redis'),
  ]);
}
```

### **第三方服务健康检查**

可以添加对依赖服务的检查：
- Redis 连接状态
- 外部 API 可用性
- 文件系统权限
- 环境变量配置

---

## 📊 监控指标

虽然 terminus 主要提供 HTTP 端点，但可以配合其他工具：

### **结合应用指标**
```typescript
// 在健康检查中添加自定义指标
async fullCheck() {
  const metrics = {
    activeConnections: this.getActiveConnections(),
    queueLength: this.getQueueLength(),
    cacheHitRate: this.getCacheHitRate(),
  };
  
  // 返回健康状态和指标
  return {
    ...healthStatus,
    metrics,
  };
}
```

---

## 🔒 安全考虑

### **访问控制**

**生产环境建议：**
- 限制健康检查端点的访问权限
- 使用防火墙规则限制 IP
- 考虑添加基础认证

**网络配置：**
```nginx
# 限制健康检查端点访问
location /health {
  allow 10.0.0.0/8;  # 内网 IP 段
  deny all;
  proxy_pass http://backend;
}
```

### **信息泄露**

健康检查响应可能包含敏感信息（如内部错误详情），建议：
- 生产环境简化错误信息
- 记录详细错误到日志而非响应体

---

**最后更新时间：2024-01-28**