[根目录](../../CLAUDE.md) > **lib**

# 核心业务层 - 存储与压缩服务

> 封装图像处理、R2存储操作、数据访问和定时清理等核心业务逻辑，为API层提供可复用的服务组件。

## 模块职责

提供底层业务服务支撑，包括Cloudflare R2云存储操作、Sharp图像压缩算法、Prisma数据访问、定时任务调度和系统清理等功能模块。

## 入口与启动

| 服务模块 | 主要功能 | 对外接口 | 依赖关系 |
|----------|----------|----------|----------|
| `r2.ts` | R2存储操作 | 上传/删除/批量删除/URL生成 | @aws-sdk/client-s3 |
| `compression.ts` | 图像压缩算法 | 质量压缩/大小压缩/智能优化 | Sharp |
| `cleanup.ts` | 过期文件清理 | 清理服务/统计查询 | r2.ts + prisma.ts |
| `scheduler.ts` | 定时任务调度 | cron任务管理 | node-cron |
| `prisma.ts` | 数据库客户端 | ORM实例导出 | @prisma/client |

## 对外接口

### R2存储服务 (`r2.ts`)
```typescript
// 文件上传
async function uploadToR2(
  key: string, 
  buffer: Buffer, 
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }>

// 批量删除
async function batchDeleteFromR2(
  keys: string[]
): Promise<{ success: boolean; deletedCount: number; errors: string[] }>

// 路径生成
function generateR2Key(originalFileName: string, prefix: string): string
// 返回格式: images/2025/09/original_1725192945123_abc123_filename.jpg
```

### 压缩算法服务 (`compression.ts`)
```typescript
// 智能压缩接口 (计划中)
interface CompressionOptions {
  mode: 'quality' | 'size'
  quality?: number        // 1-100
  targetSizeKb?: number   // 目标大小
  format?: 'jpeg' | 'png' | 'webp'
  maxWidth?: number       // 最大宽度限制
  maxHeight?: number      // 最大高度限制
}

async function compressImage(
  buffer: Buffer, 
  options: CompressionOptions
): Promise<{
  buffer: Buffer
  metadata: Sharp.Metadata
  compressionRatio: number
  processingTime: number
}>
```

### 清理服务 (`cleanup.ts`)
```typescript
// 主清理函数
async function cleanupExpiredImages(): Promise<{
  success: boolean
  deletedRecords: number
  deletedFiles: number
  errors: string[]
}>

// 统计信息
async function getCleanupStats(): Promise<{
  totalRecords: number
  expiredRecords: number
  totalFilesEstimated: number
}>
```

## 关键依赖与配置

### 核心依赖包
```json
{
  "sharp": "^0.34.3",                    // 图像处理引擎
  "@aws-sdk/client-s3": "^3.879.0",     // R2 S3兼容客户端
  "@prisma/client": "^6.15.0",          // 数据库ORM
  "node-cron": "^4.2.1",                // 定时任务调度
  "pg": "^8.16.3"                       // PostgreSQL驱动
}
```

### R2存储配置
```typescript
// lib/r2.ts 配置项
const R2_CONFIG = {
  region: 'auto',                        // Cloudflare R2固定值
  endpoint: process.env.R2_ENDPOINT,     // R2端点URL
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
}

// 文件路径结构
const r2KeyPattern = `images/{year}/{month}/{prefix}_{timestamp}_{random}_{filename}.{ext}`
```

### 数据库模型
```prisma
model ImageCompression {
  id                String   @id @default(cuid())
  
  // 原始图片信息 
  originalFileName  String
  originalFileSize  Int
  originalR2Key     String?   // R2存储键名
  originalR2Url     String?   // 公开访问URL
  
  // 压缩结果
  compressedFileSize Int?
  compressedR2Key    String?
  compressedR2Url    String?
  compressionRatio   Float?
  
  // 元数据与状态
  status            CompressionStatus @default(PENDING)
  processingTime    Int?              // 毫秒
  expiresAt         DateTime?         // 过期时间
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
}
```

## 数据模型

### R2存储架构
```
Cloudflare R2 Bucket
├── images/
│   ├── 2025/
│   │   ├── 01/
│   │   │   ├── original_1704067200000_abc123_photo.jpg
│   │   │   ├── compressed_1704067200000_abc123_photo.jpg
│   │   │   └── ...
│   │   ├── 02/
│   │   └── ...
│   └── ...
```

### 压缩处理流程
1. **算法选择**: 根据mode参数选择质量压缩或大小压缩
2. **迭代优化**: 大小模式下自动调整质量直到达标
3. **尺寸调整**: 必要时缩小图像尺寸保持压缩比
4. **智能兜底**: 质量压缩后文件变大时自动优化处理

### 定时清理策略
```typescript
// 默认配置: 每日凌晨0点执行
const CLEANUP_CRON_SCHEDULE = "0 0 0 * * *"

// 过期条件: 满足以下任一条件
const expiredCondition = {
  OR: [
    { expiresAt: { lt: new Date() } },           // 明确过期时间
    { 
      AND: [
        { expiresAt: null },                     // 兼容旧数据
        { createdAt: { lt: 24小时前 } }          // 创建超过24小时
      ]
    }
  ]
}
```

## 测试与质量

### 单元测试覆盖 (计划中)
```typescript
// R2操作测试
describe('R2 Storage Operations', () => {
  test('uploadToR2 should upload file and return public URL')
  test('batchDeleteFromR2 should handle partial failures gracefully')
  test('generateR2Key should create unique structured paths')
})

// 压缩算法测试  
describe('Image Compression', () => {
  test('quality mode should preserve dimensions')
  test('size mode should reduce file to target size')
  test('smart optimization should handle edge cases')
})
```

### 性能基准
- **R2上传**: ~2-5秒 for 5MB图片
- **Sharp压缩**: ~500ms-2秒 根据图片大小
- **批量删除**: ~100-500ms for 50个文件
- **数据库查询**: ~10-50ms 常规CRUD操作

## 常见问题 (FAQ)

### Q: R2存储的文件路径规则是什么？
**A**: 使用年月分层 + 时间戳防冲突的结构：
```
images/{year}/{month}/{prefix}_{timestamp}_{random}_{sanitized_filename}.{ext}
```

### Q: 压缩算法如何选择最优质量？
**A**: 
- **质量模式**: 直接应用指定质量值
- **大小模式**: 从80%开始迭代降低质量，必要时缩小尺寸
- **智能优化**: 检测压缩效果，自动尝试不同策略

### Q: 定时清理任务如何确保可靠性？
**A**: 
- 错误容忍设计，部分失败不影响其他清理
- 详细错误日志记录
- 支持手动触发清理接口
- 数据库事务保证一致性

### Q: 如何扩展支持新的图片格式？
**A**: 
1. 在Sharp处理逻辑中添加格式支持
2. 更新MIME类型映射
3. 调整前端组件的accept配置
4. 添加相应的压缩参数选项

## 相关文件清单

### 核心服务模块
- `r2.ts` - R2存储操作封装 (160行)
- `compression.ts` - 压缩算法实现 (计划中)
- `cleanup.ts` - 清理服务逻辑 (176行)
- `scheduler.ts` - 定时任务调度 (约50行)
- `prisma.ts` - 数据库客户端 (约10行)

### 工具与配置
- `utils.ts` - 通用工具函数 (约50行)
- `locales.ts` - 语言环境配置 (约20行)
- `init.ts` - 系统初始化逻辑 (约30行)

### 业务支撑
- `batch-download.ts` - 批量下载逻辑 (约100行)
- `history.ts` - 历史记录管理 (约80行)
- `seo.ts` - SEO优化支持 (约40行)

## 变更记录 (Changelog)

### 2025-09-01 20:35:45
- **新增**: 核心业务层文档生成，服务接口和数据模型说明
- **完善**: R2存储路径规范，支持中文文件名安全化处理
- **优化**: 批量删除错误处理，提供详细的删除结果统计