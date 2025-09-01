[根目录](../../CLAUDE.md) > **prisma**

# 数据持久化层 - 数据模型与迁移

> 基于Prisma ORM的数据访问层，管理PostgreSQL数据库的模式定义、迁移脚本和客户端生成，支持图片压缩记录的完整生命周期管理。

## 模块职责

定义和维护数据库结构，管理图片压缩任务的元数据、状态跟踪、结果存储和过期清理等数据持久化需求。

## 入口与启动

| 核心文件 | 功能职责 | 作用范围 | 维护频率 |
|----------|----------|----------|----------|
| `schema.prisma` | 数据模型定义 | 整个应用的数据结构 | 功能迭代时更新 |
| `migrations/` | 数据库版本管理 | 生产环境数据迁移 | 每次模型变更 |
| `../lib/generated/prisma/` | 客户端代码生成 | TypeScript类型安全 | 自动生成 |

## 对外接口

### 核心数据模型 (`schema.prisma`)
```prisma
model ImageCompression {
  id                String   @id @default(cuid())
  
  // 原始图片信息
  originalFileName  String
  originalFileSize  Int      // bytes
  originalMimeType  String
  originalWidth     Int?
  originalHeight    Int?
  originalR2Key     String?  // R2存储键名
  originalR2Url     String?  // R2公开访问URL
  
  // 压缩配置
  targetSizeKb      Int?     // 目标大小(KB)
  quality           Int?     // 压缩质量 (1-100)
  format            String?  // 输出格式 (jpeg, png, webp)
  
  // 压缩结果
  compressedFileSize Int?    // bytes
  compressedWidth    Int?
  compressedHeight   Int?
  compressedR2Key    String? // 压缩文件R2存储键名
  compressedR2Url    String? // 压缩文件R2公开访问URL
  compressionRatio   Float?  // 压缩比例
  
  // 元数据
  status            CompressionStatus @default(PENDING)
  processingTime    Int?              // 处理时间(毫秒)
  errorMessage      String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  expiresAt         DateTime?         // 过期时间（R2文件）
  
  @@map("image_compressions")
}

enum CompressionStatus {
  PENDING      // 待处理
  PROCESSING   // 处理中
  COMPLETED    // 已完成
  FAILED       // 处理失败
}
```

### Prisma客户端使用模式
```typescript
import { prisma } from '@/lib/prisma'

// 创建压缩任务记录
const compression = await prisma.imageCompression.create({
  data: {
    originalFileName: file.name,
    originalFileSize: buffer.length,
    originalMimeType: file.type,
    originalR2Key: r2Key,
    status: 'PROCESSING',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
  }
})

// 更新压缩结果
await prisma.imageCompression.update({
  where: { id: compression.id },
  data: {
    compressedFileSize: compressedBuffer.length,
    compressedR2Key: compressedR2Key,
    compressionRatio: compressionRatio,
    status: 'COMPLETED',
    processingTime: Date.now() - startTime
  }
})

// 查询过期记录
const expiredImages = await prisma.imageCompression.findMany({
  where: {
    OR: [
      { expiresAt: { lt: new Date() } },
      { 
        AND: [
          { expiresAt: null },
          { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      }
    ]
  }
})
```

## 关键依赖与配置

### Prisma生态系统
```json
{
  "@prisma/client": "^6.15.0",   // 客户端运行时
  "prisma": "^6.15.0"            // CLI工具和生成器
}
```

### 数据库配置
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"  // 自定义输出路径
}
```

### 环境变量要求
```bash
# PostgreSQL连接字符串
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# 示例配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/imagecompressor"
```

## 数据模型

### 表结构设计思路
1. **兼容性考虑**: 保留`originalPath`/`compressedPath`字段，支持从本地存储迁移到R2
2. **状态管理**: 使用枚举类型明确定义处理状态，支持任务跟踪
3. **性能优化**: 添加适当索引，支持过期查询和状态筛选
4. **数据完整性**: 必填字段和可选字段明确区分，支持渐进式功能扩展

### 迁移历史
```sql
-- 20250831065957_init: 初始数据模型
CREATE TABLE "image_compressions" (
    "id" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "originalFileSize" INTEGER NOT NULL,
    ...
    PRIMARY KEY ("id")
);

-- 20250831114531_add_r2_storage_support: R2存储支持
ALTER TABLE "image_compressions" 
ADD COLUMN "originalR2Key" TEXT,
ADD COLUMN "originalR2Url" TEXT,
ADD COLUMN "compressedR2Key" TEXT,
ADD COLUMN "compressedR2Url" TEXT,
ADD COLUMN "expiresAt" TIMESTAMP(3);
```

### 索引策略 (计划中)
```sql
-- 过期查询优化
CREATE INDEX idx_image_compressions_expires_at ON image_compressions(expiresAt);
CREATE INDEX idx_image_compressions_created_at ON image_compressions(createdAt);

-- 状态查询优化  
CREATE INDEX idx_image_compressions_status ON image_compressions(status);
```

## 测试与质量

### 数据完整性测试
```typescript
// 计划中的数据模型测试
describe('ImageCompression Model', () => {
  test('should create compression record with required fields')
  test('should update status transitions correctly')
  test('should handle null values for optional fields')
  test('should enforce enum constraints for status')
})
```

### 迁移验证流程
```bash
# 检查迁移状态
npx prisma migrate status

# 预览迁移变更  
npx prisma migrate diff --preview-feature

# 执行迁移
npx prisma migrate deploy

# 验证数据完整性
npx prisma db seed  # 如果有种子数据
```

## 常见问题 (FAQ)

### Q: 如何处理数据库迁移？
**A**: 
```bash
# 开发环境 - 原型迁移
npx prisma db push

# 生产环境 - 正式迁移
npx prisma migrate deploy
```

### Q: 客户端代码如何更新？
**A**: 修改schema.prisma后运行：
```bash
npx prisma generate
```
这会更新`lib/generated/prisma/`下的TypeScript类型定义。

### Q: 如何查看数据库内容？
**A**: 使用Prisma Studio：
```bash
npx prisma studio
```
会在浏览器中打开数据库管理界面。

### Q: R2迁移如何处理历史数据？
**A**: 
- 新记录优先使用R2字段(`originalR2Key`等)
- 历史记录保留本地路径字段兼容性
- 清理任务会同时检查两种存储方式

### Q: 过期时间如何设计？
**A**: 
- 新记录：创建时设置`expiresAt = now() + 24h`  
- 历史记录：通过`createdAt`字段推算过期
- 支持自定义过期时间（功能扩展）

## 相关文件清单

### 核心配置文件
- `schema.prisma` - 数据模型定义 (61行)
- `migrations/migration_lock.toml` - 迁移锁定文件

### 迁移脚本
- `migrations/20250831065957_init/migration.sql` - 初始建表脚本
- `migrations/20250831114531_add_r2_storage_support/migration.sql` - R2存储扩展

### 生成的客户端文件 (`../lib/generated/prisma/`)
- `index.js` / `index.d.ts` - 主客户端入口
- `client.js` / `client.d.ts` - 客户端实现  
- `runtime/` - 运行时支持文件
- `query_engine-windows.dll.node` - 平台查询引擎

### 配置与工具
- `../lib/prisma.ts` - 客户端实例化和连接池配置

## 变更记录 (Changelog)

### 2025-09-01 20:35:45
- **新增**: 数据持久化层文档生成，包含模型设计和迁移说明
- **完善**: R2存储字段设计，支持云端存储和本地存储的平滑迁移
- **优化**: 过期清理查询逻辑，兼容历史数据和新数据的不同过期策略