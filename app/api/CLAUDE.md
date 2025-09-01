[根目录](../../CLAUDE.md) > **app/api**

# API服务层 - 压缩处理接口

> Next.js App Router API路由，处理图片压缩、清理管理、文件下载和系统初始化等核心业务接口。

## 模块职责

提供RESTful API接口，作为前端React组件与后端业务逻辑之间的桥梁，处理文件上传、压缩任务调度、资源清理和下载代理等功能。

## 入口与启动

| 路由路径 | 方法 | 功能描述 | 主要依赖 |
|----------|------|----------|----------|
| `/api/compress` | POST | 图片压缩核心接口 | Sharp, R2存储, Prisma |
| `/api/cleanup` | POST | 手动清理过期文件 | cleanup服务, R2批量删除 |
| `/api/download` | GET | 文件下载代理 | fetch, CORS处理 |
| `/api/init` | GET | 系统健康检查 | Prisma连接测试 |

## 对外接口

### 压缩接口 (`/api/compress`)
```typescript
// 请求格式 (FormData)
{
  file: File,                    // 图片文件
  targetSizeKb?: string,         // 目标大小(KB)
  quality?: string,              // 压缩质量(1-100)
  format?: string,               // 输出格式(jpeg/png/webp)
  mode: 'quality' | 'size'       // 压缩模式
}

// 响应格式 (JSON)
{
  id: string,                    // 压缩任务ID
  original: {
    fileName: string,
    fileSize: number,
    width?: number,
    height?: number,
    url: string                  // R2公开访问URL
  },
  compressed: {
    fileSize: number,
    width?: number,
    height?: number,
    url: string                  // 压缩后R2 URL
  },
  compressionRatio: number,      // 压缩比例
  processingTime: number,        // 处理时间(ms)
  expiresAt: string             // ISO时间戳
}
```

### 清理接口 (`/api/cleanup`)
```typescript
// 响应格式
{
  success: boolean,
  deletedRecords: number,        // 删除的数据库记录数
  deletedFiles: number,          // 删除的R2文件数
  errors: string[]               // 错误信息列表
}
```

## 关键依赖与配置

### 核心依赖
- **Sharp**: 高性能图像处理引擎
- **@aws-sdk/client-s3**: Cloudflare R2 S3兼容操作
- **@prisma/client**: 数据库ORM客户端
- **Next.js**: App Router API处理框架

### 环境变量需求
```bash
# R2存储配置
R2_ENDPOINT="https://xxx.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_BUCKET_NAME="your_bucket_name"
R2_PUBLIC_DOMAIN="image.yourapp.com"  # 可选

# 数据库连接
DATABASE_URL="postgresql://..."
```

## 数据模型

### 请求处理流程
1. **文件接收**: FormData解析 → 文件验证 → Buffer转换
2. **元数据提取**: Sharp获取尺寸 → MIME类型检测 → 文件大小计算
3. **存储操作**: R2上传原图 → 数据库记录创建 → 状态设置为PROCESSING
4. **压缩处理**: 根据模式选择算法 → Sharp图像处理 → 质量/大小迭代优化
5. **结果存储**: R2上传压缩图 → 数据库更新 → 返回对比结果

### 错误处理模式
```typescript
// 分层错误处理
try {
  // 业务逻辑处理
  const result = await processCompression(file, options)
  return NextResponse.json(result)
} catch (compressionError) {
  // 更新数据库错误状态
  await updateCompressionStatus(taskId, 'FAILED', errorMessage)
  throw compressionError
} catch (globalError) {
  // 全局错误兜底
  return NextResponse.json({ 
    error: '图片压缩失败', 
    details: error.message 
  }, { status: 500 })
}
```

## 测试与质量

### API测试覆盖
- **压缩接口**: 支持JPEG/PNG/WebP格式，质量模式和大小模式测试
- **错误处理**: 文件类型验证，大小限制，R2上传失败场景
- **并发处理**: 批量请求压力测试（生产环境验证）
- **清理接口**: 过期文件识别和批量删除功能

### 性能监控
```typescript
// 处理时间记录
const startTime = Date.now()
// ... 压缩处理 ...
const processingTime = Date.now() - startTime

// 数据库性能指标
await prisma.imageCompression.update({
  where: { id },
  data: { 
    processingTime,
    compressionRatio,
    status: 'COMPLETED'
  }
})
```

## 常见问题 (FAQ)

### Q: 压缩后文件为什么变大了？
**A**: 对于已高度压缩的图片，进一步压缩可能增加文件大小。系统会自动检测并尝试不同的压缩策略，包括轻微调整尺寸。

### Q: R2上传失败如何处理？
**A**: 
1. 检查R2配置和网络连接
2. 验证存储桶权限设置
3. 查看控制台错误日志中的详细信息
4. 使用 `npm run check-r2` 验证配置

### Q: 如何调整压缩算法参数？
**A**: 修改 `/api/compress/route.ts` 中的Sharp配置：
- JPEG: `quality`, `progressive` 选项
- PNG: `compressionLevel` (0-9)
- WebP: `quality`, `effort` 参数

## 相关文件清单

### 核心API路由
- `compress/route.ts` - 图片压缩主接口 (284行)
- `cleanup/route.ts` - 清理管理接口 (约50行)
- `download/route.ts` - 下载代理接口 (约30行) 
- `init/route.ts` - 系统初始化接口 (约20行)

### 依赖的业务逻辑
- `../../lib/r2.ts` - R2存储操作封装
- `../../lib/cleanup.ts` - 清理服务逻辑
- `../../lib/prisma.ts` - 数据库客户端

## 变更记录 (Changelog)

### 2025-09-01 20:35:45
- **新增**: API模块文档生成，接口规范和错误处理说明
- **完善**: 压缩算法智能优化逻辑，支持质量和大小双模式
- **优化**: R2存储路径结构，使用时间戳和随机字符防冲突