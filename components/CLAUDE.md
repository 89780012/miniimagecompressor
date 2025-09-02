[根目录](../../CLAUDE.md) > **components**

# UI组件库 - 批量压缩交互界面

> React函数式组件库，基于Radix UI + Tailwind CSS，提供文件上传、压缩控制、结果展示和批量下载等完整的用户交互界面。

## 模块职责

构建现代化的图片压缩用户界面，支持拖拽上传、文件夹批量选择、实时压缩进度、对比展示和批量下载等功能，提供直观友好的用户体验。

## 入口与启动

| 组件名称 | 主要功能 | 使用场景 | 依赖组件 |
|----------|----------|----------|----------|
| `BatchImageUpload.tsx` | 批量文件上传和管理 | 主页面核心组件 | react-dropzone, Image |
| `BatchCompressionControls.tsx` | 批量压缩控制面板 | 压缩参数设置 | Slider, Switch, Tabs |
| `BatchComparisonView.tsx` | 批量结果对比展示 | 压缩完成后预览 | Card, Progress, Button |

## 对外接口

### 批量上传组件 (`BatchImageUpload.tsx`)
```typescript
interface BatchImageUploadProps {
  images: ImageFile[]                    // 图片列表
  onImagesAdd: (images: ImageFile[]) => void     // 添加图片回调
  onImageRemove: (id: string) => void            // 移除图片回调
  onImagesClear: () => void                      // 清空列表回调
  maxFiles?: number                              // 最大文件数限制
  disabled?: boolean                             // 禁用状态
}

// 图片文件类型定义
interface ImageFile {
  id: string
  file: File
  preview: string                        // blob URL预览地址
  size: number
  dimensions?: { width: number; height: number }
  progress: number                       // 压缩进度 0-100
  status: 'pending' | 'compressing' | 'completed' | 'error'
  relativePath?: string                  // 文件夹上传时的相对路径
  result?: CompressionResult             // 压缩完成后的结果
}
```

### 压缩控制组件 (`BatchCompressionControls.tsx`)
```typescript
interface CompressionSettings {
  mode: 'quality' | 'size'
  quality: number                        // 1-100
  targetSizeKb: number                   // 目标大小KB
  format: 'jpeg' | 'png' | 'webp'
  applyToAll: boolean                    // 应用到所有图片
}

interface BatchCompressionControlsProps {
  images: ImageFile[]
  settings: CompressionSettings
  onSettingsChange: (settings: CompressionSettings) => void
  onStartBatch: () => void
  onPauseBatch: () => void
  onResetBatch: () => void
  isProcessing: boolean
}
```

### 下载进度弹窗 (`DownloadProgressModal.tsx`)
```typescript
interface DownloadProgressModalProps {
  isOpen: boolean
  current: number                        // 当前进度
  total: number                          // 总数量
  currentFile: string                    // 当前处理文件名
  isDownloading: boolean                 // 下载状态
  error: string                          // 错误信息
  onClose: () => void                    // 关闭回调
}
```

## 关键依赖与配置

### UI框架依赖
```json
{
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-dropzone": "^14.3.8",          // 拖拽上传
  "@radix-ui/react-dialog": "^1.1.15",   // 弹窗组件
  "@radix-ui/react-progress": "^1.1.7",  // 进度条
  "@radix-ui/react-slider": "^1.3.6",    // 滑块控件
  "tailwind-merge": "^3.3.1",           // 样式类合并
  "class-variance-authority": "^0.7.1",  // 变体样式管理
  "lucide-react": "^0.542.0",           // 图标组件
  "jszip": "^3.10.1"                    // 批量下载压缩包
}
```

### 国际化支持
```typescript
// 使用next-intl进行多语言支持
const t = useTranslations()

// 支持的语言键值
t('upload.clickOrDrag')          // "点击选择文件或拖拽上传"
t('compression.qualityMode')     // "质量模式"  
t('comparison.compressionRatio') // "压缩率"
t('progress.batchProgress')      // "批量处理进度"
```

### 样式设计系统
```typescript
// 基于Tailwind CSS + CVA的组件变体
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent"
      }
    }
  }
)
```

## 数据模型

### 状态管理模式
```typescript
// 客户端状态管理 (useState + 本地状态)
const [images, setImages] = useState<ImageFile[]>([])
const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>()
const [batchProgress, setBatchProgress] = useState<BatchProgress>()

// 状态流转: pending -> compressing -> completed/error
const updateImageStatus = (id: string, status: ImageFile['status']) => {
  setImages(prev => prev.map(img => 
    img.id === id ? { ...img, status } : img
  ))
}
```

### 文件处理流程
1. **拖拽/选择**: react-dropzone接收文件 → 类型验证 → 预览生成
2. **批量管理**: 文件列表显示 → 支持单个删除 → 支持全部清空
3. **文件夹支持**: webkitRelativePath解析 → 保持目录结构 → 批量下载时还原路径
4. **进度跟踪**: 每个文件独立状态 → 实时进度更新 → 错误处理显示

### 批量下载机制
```typescript
// JSZip批量打包下载
const handleBatchDownload = async () => {
  const zip = new JSZip()
  const completedImages = images.filter(img => img.status === 'completed')
  
  for (const image of completedImages) {
    const response = await fetch(`/api/download?url=${encodeURIComponent(image.result.compressed.url)}`)
    const blob = await response.blob()
    
    // 保持原目录结构
    const filePath = image.relativePath || `compressed_${image.file.name}`
    zip.file(filePath, blob)
  }
  
  const content = await zip.generateAsync({ type: 'blob' })
  downloadBlob(content, `compressed_images_${Date.now()}.zip`)
}
```

## 测试与质量

### 组件测试覆盖 (计划中)
```typescript
// 批量上传测试
describe('BatchImageUpload', () => {
  test('should accept dragged image files')
  test('should reject non-image files')
  test('should respect maxFiles limit')
  test('should generate preview URLs correctly')
})

// 压缩控制测试
describe('BatchCompressionControls', () => {
  test('should update settings correctly')
  test('should validate quality range')
  test('should handle batch start/pause/reset')
})
```

### 用户体验优化
- **响应式设计**: 支持移动端和桌面端适配
- **无障碍访问**: ARIA标签和键盘导航支持
- **性能优化**: 图片预览懒加载，大文件处理优化
- **错误边界**: 组件级错误捕获和用户友好提示

### 交互设计原则
- **渐进式交互**: 上传 → 设置 → 压缩 → 下载的清晰流程
- **实时反馈**: 进度条、状态图标、处理时间显示
- **批量操作**: 支持全选、批量设置、批量下载
- **错误恢复**: 单个失败不影响整体，支持重试机制

## 常见问题 (FAQ)

### Q: 如何支持文件夹批量上传？
**A**: 使用HTML5的webkitdirectory属性：
```typescript
<input 
  type="file" 
  webkitdirectory 
  directory="" 
  multiple 
  onChange={handleFolderSelect} 
/>
```

### Q: 批量下载时如何处理CORS问题？
**A**: 通过`/api/download`代理接口避免跨域：
```typescript
const proxyUrl = `/api/download?url=${encodeURIComponent(imageUrl)}`
const response = await fetch(proxyUrl)
```

### Q: 如何优化大量图片的渲染性能？
**A**: 
- 使用Next.js Image组件的懒加载
- 虚拟滚动（计划中）
- 预览图片尺寸限制
- 及时清理blob URL内存

### Q: 压缩进度如何实时更新？
**A**: 
- API接口返回任务ID
- 客户端轮询状态或使用WebSocket（计划中）
- 本地状态管理同步更新
- 进度条动画平滑过渡

## 相关文件清单

### 主要组件
- `BatchImageUpload.tsx` - 批量上传核心组件 (533行)
- `BatchCompressionControls.tsx` - 压缩控制面板 (约300行)
- `BatchComparisonView.tsx` - 结果对比展示 (约200行)
- `BatchProgressDisplay.tsx` - 进度显示组件 (约150行)
- `DownloadProgressModal.tsx` - 下载进度弹窗 (约100行)

### 工具组件
- `ComparisonView.tsx` - 单图对比视图 (兼容性组件)
- `CompressionControls.tsx` - 单图压缩控制 (已删除)
- `LanguageSwitcher.tsx` - 语言切换组件 (约50行)
- `StructuredData.tsx` - SEO结构化数据 (约30行)

### UI基础组件 (`ui/`)
- `button.tsx`, `card.tsx`, `dialog.tsx` - Radix UI封装
- `progress.tsx`, `slider.tsx`, `tabs.tsx` - 交互控件
- `input.tsx`, `label.tsx`, `badge.tsx` - 表单组件

### 历史记录相关
- `HistoryView.tsx` - 压缩历史展示 (约150行)

## 变更记录 (Changelog)

### 2025-09-01 20:35:45
- **新增**: UI组件库文档生成，包含批量处理和交互设计说明
- **完善**: 文件夹上传功能，支持目录结构保持和批量下载
- **优化**: 下载进度体验，使用JSZip实现客户端压缩包生成