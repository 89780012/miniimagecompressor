# 图片压缩工具 - 开发文档

> 这是一个基于Next.js 15的现代化图片压缩应用，集成了Cloudflare R2云存储、多语言支持和批量处理功能。

## 常用命令

### 开发与构建
```bash
# 开发服务器 (使用Turbopack加速)
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 数据库操作
```bash
# 生成Prisma客户端
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate

# 查看数据库迁移状态
npx prisma migrate status

# 重置数据库 (开发环境)
npx prisma migrate reset
```

### R2存储配置
```bash
# 检查R2配置
npm run check-r2

# 测试R2连接
node -e "require('./lib/r2.ts')"
```

## 高层架构

### 核心技术栈
- **前端**: Next.js 15 (App Router) + React 19 + TypeScript
- **UI**: Tailwind CSS 4 + Radix UI + Lucide Icons  
- **存储**: Cloudflare R2 (S3兼容) + PostgreSQL (Prisma ORM)
- **图片处理**: Sharp (高性能图像处理)
- **国际化**: next-intl (支持中文/英文)
- **定时任务**: node-cron (自动清理过期文件)

### 应用架构模式

```
┌─────────────────────────────────────────────────────────────┐
│                    客户端 (React)                             │
├─────────────────────────────────────────────────────────────┤
│ • 批量上传组件     • 压缩控制面板     • 结果对比视图           │
│ • 多语言切换       • 进度显示         • 文件下载管理           │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                  API路由层 (/api)                            │
├─────────────────────────────────────────────────────────────┤
│ • /compress     - 图片压缩处理                               │
│ • /cleanup      - 手动清理接口                               │
│ • /init         - 系统初始化                                 │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    核心服务层                                 │
├─────────────────────────────────────────────────────────────┤
│ • compression.ts   - 图片压缩逻辑                            │
│ • r2.ts           - Cloudflare R2操作                       │
│ • cleanup.ts      - 过期文件清理                             │
│ • scheduler.ts    - 定时任务调度                             │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                   存储层                                      │
├─────────────────────────────────────────────────────────────┤
│ • Cloudflare R2   - 图片文件存储 (原图+压缩图)              │
│ • PostgreSQL      - 压缩记录、状态跟踪                       │
└─────────────────────────────────────────────────────────────┘
```

### 数据流设计

1. **上传流程**: 用户选择图片 → 批量上传组件 → FormData提交到`/api/compress`
2. **处理流程**: 图片压缩(Sharp) → R2存储 → 数据库记录 → 返回结果URLs
3. **清理流程**: 定时任务(cron) → 识别过期记录 → 批量删除R2文件 → 清理数据库

### 关键设计决策

#### 存储策略 - 云端优先
- **现状**: 已完全迁移到Cloudflare R2云存储
- **兼容性**: 保留本地路径字段(`originalPath`/`compressedPath`)用于数据迁移
- **URL生成**: 优先使用自定义域名(`R2_PUBLIC_DOMAIN`)，降级到默认R2端点

#### 压缩算法 - 自适应质量
- **按质量模式**: 直接设置压缩质量(10-100%)
- **按大小模式**: 迭代压缩找到最优质量，必要时调整尺寸
- **格式支持**: JPEG(最小)、PNG(透明度)、WebP(现代浏览器最优)

#### 批量处理 - 渐进式体验
- **状态管理**: `pending → compressing → completed/error`
- **进度反馈**: 实时进度条 + 单项状态显示
- **错误处理**: 单个失败不影响整体批次，错误信息详细记录

#### 国际化架构
- **路由结构**: `/[locale]/page` 基于locale的动态路由
- **消息管理**: `messages/{locale}.json` 集中式翻译文件
- **中间件**: 自动检测和重定向到合适的语言版本

## 核心业务逻辑

### 图片压缩引擎 (`/api/compress`)
```typescript
// 核心压缩流程
1. 接收FormData (file + 压缩参数)
2. 生成R2键名 (时间戳 + 随机字符 + 原文件名)
3. 上传原图到R2 → 创建数据库记录
4. Sharp图像处理:
   - 质量模式: 直接应用质量设置
   - 大小模式: 迭代压缩直到达到目标大小
   - 必要时调整尺寸 (保持宽高比)
5. 上传压缩图到R2 → 更新数据库记录
6. 返回对比结果 (原图/压缩图URLs + 统计信息)
```

### 自动清理机制 (`lib/cleanup.ts` + `lib/scheduler.ts`)
```typescript
// 默认每天凌晨0点执行
- 查询过期记录 (24小时 + expiresAt字段)
- 批量删除R2文件 (原图+压缩图)  
- 清理数据库记录
- 错误容忍: 部分失败不影响其他清理操作
```

### 状态管理模式
- **客户端**: React useState管理上传列表、压缩进度、结果展示
- **服务端**: 数据库记录状态变更(PENDING→PROCESSING→COMPLETED/FAILED)
- **持久化**: 所有操作结果保存到PostgreSQL，支持状态查询和恢复

## 环境配置

### 必需环境变量
```bash
# 数据库连接
DATABASE_URL="postgresql://..."

# Cloudflare R2存储
R2_ENDPOINT="https://xxx.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"  
R2_BUCKET_NAME="your_bucket_name"

# 可选：自定义域名(推荐用于生产环境)
R2_PUBLIC_DOMAIN="image.yourapp.com"

# 定时清理配置
ENABLE_CLEANUP_SCHEDULER="true"
CLEANUP_CRON_SCHEDULE="0 0 0 * * *"  # 每天凌晨0点
TZ="Asia/Shanghai"
```

### 部署前检查清单
1. ✅ 运行 `npm run check-r2` 验证R2配置
2. ✅ 确认数据库迁移: `npm run prisma:migrate`
3. ✅ 测试图片上传和压缩功能
4. ✅ 验证定时清理任务启动日志
5. ✅ 配置自定义域名(生产环境推荐)

## 开发指南

### 添加新的压缩格式
1. 修改 `lib/compression.ts` 中的格式处理逻辑
2. 更新 `components/CompressionControls.tsx` 的格式选项
3. 添加对应的MIME类型映射

### 扩展清理策略  
1. 修改 `lib/cleanup.ts` 的查询条件
2. 调整 `CLEANUP_CRON_SCHEDULE` 环境变量
3. 考虑添加手动清理的管理界面

### 自定义UI组件
- 基于Radix UI + Tailwind CSS构建
- 遵循 `components/ui/` 目录下的设计模式
- 使用 `cn()` 工具函数合并样式类名

## 故障排除

### 常见问题
1. **R2上传失败**: 检查API密钥权限和存储桶名称
2. **压缩处理缓慢**: 考虑调整Sharp的并发处理参数
3. **定时任务未运行**: 确认 `ENABLE_CLEANUP_SCHEDULER=true`
4. **图片无法访问**: 验证R2自定义域名DNS配置

### 日志监控要点
- R2上传操作的成功/失败状态
- 图片压缩处理时间和压缩比
- 定时清理任务的执行结果
- 数据库连接和查询性能

---

*最后更新: 2025-01-01*  
*如有疑问或需要协助，请查看项目的R2_SETUP.md文件或检查相关API文档。*