[根目录](../CLAUDE.md) > **components**

# UI组件库 - 现代化图片处理界面

> React函数式组件库，基于Radix UI + Tailwind CSS，提供图片压缩、尺寸调整、裁剪编辑等完整的用户交互界面，采用单页面应用架构。

## 变更记录 (Changelog)

### 2025-09-07 18:35:41
- **架构验证**: 确认组件采用单页面应用（SPA）架构模式
- **组件清单**: 全面扫描25个组件，确认功能完整性
- **文档更新**: 修正面包屑导航路径，完善组件职责描述
- **接口同步**: 验证所有组件接口与实际代码一致

## 模块职责

构建现代化的图片处理用户界面，支持：
- **主要功能页面**: 图片压缩和尺寸调整的完整工作流
- **批量处理界面**: 拖拽上传、文件夹批量选择、实时进度显示
- **编辑工具**: 图片裁剪编辑器，支持多种宽高比预设
- **结果展示**: 压缩前后对比、尺寸调整预览、历史记录管理
- **交互增强**: 下载进度弹窗、多语言切换、响应式设计

## 入口与启动

### 主要页面组件
| 组件名称 | 主要功能 | 使用场景 | 依赖组件 |
|----------|----------|----------|----------|
| `ImageCompressionPage.tsx` | 图片压缩主页面 | SPA中的压缩功能模块 | BatchImageUpload, BatchCompressionControls |
| `ImageResizePage.tsx` | 尺寸调整页面 | SPA中的尺寸调整模块 | ImageResizeUpload, ResizeControls |
| `AppHeader.tsx` | 应用头部导航 | 功能切换和语言选择 | LanguageSwitcher, Tabs |

### 批量处理组件
| 组件名称 | 主要功能 | 使用场景 | 依赖组件 |
|----------|----------|----------|----------|
| `BatchImageUpload.tsx` | 批量文件上传和管理 | 压缩页面核心组件 | react-dropzone, Progress |
| `BatchCompressionControls.tsx` | 批量压缩控制面板 | 压缩参数设置 | Slider, Switch, Tabs |
| `BatchComparisonView.tsx` | 批量结果对比展示 | 压缩完成后预览 | Card, Progress, Button |
| `BatchProgressDisplay.tsx` | 批量处理进度显示 | 实时进度反馈 | Progress, Badge |

### 编辑和预览组件
| 组件名称 | 主要功能 | 使用场景 | 依赖组件 |
|----------|----------|----------|----------|
| `ImageCropper.tsx` | 图片裁剪编辑器 | 尺寸调整前的裁剪 | React Cropper, Dialog |
| `ImageResizeUpload.tsx` | 尺寸调整专用上传 | 尺寸调整页面 | react-dropzone, Select |
| `ResizeControls.tsx` | 尺寸调整控制面板 | 尺寸参数设置 | Input, Select, Slider |
| `ResizePreview.tsx` | 尺寸调整结果预览 | 调整后效果展示 | Card, Badge |

## 对外接口

### 页面级组件接口
```typescript
// ImageCompressionPage 压缩页面
interface ImageCompressionPageProps {
  initialView?: 'upload' | 'history'  // 初始视图模式
}

// ImageResizePage 尺寸调整页面
interface ImageResizePageProps {
  // 无props，完全自包含的页面组件
}

// AppHeader 应用头部
interface AppHeaderProps {
  currentFeature: 'compression' | 'resize'
  onFeatureChange: (feature: 'compression' | 'resize') => void
}
```

### 批量处理组件接口
```typescript
// BatchImageUpload 批量上传
interface BatchImageUploadProps {
  onFilesChange: (files: FileList | null) => void
  onUploadStart: () => void
  disabled?: boolean
  maxFiles?: number
}

// BatchCompressionControls 压缩控制
interface BatchCompressionControlsProps {
  mode: 'quality' | 'size'
  quality: number
  targetSize: number
  onModeChange: (mode: 'quality' | 'size') => void
  onQualityChange: (quality: number) => void
  onTargetSizeChange: (size: number) => void
  onCompress: () => void
  disabled?: boolean
}

// BatchComparisonView 结果对比
interface BatchComparisonViewProps {
  results: CompressionResult[]
  onDownloadSelected: (selectedIds: string[]) => void
  onDownloadAll: () => void
  onRetry: (id: string) => void
}
```

### 编辑组件接口
```typescript
// ImageCropper 图片裁剪
interface ImageCropperProps {
  src: string
  aspectRatio?: number | 'free'
  onCrop: (croppedImageUrl: string, cropData: CropData) => void
  onCancel: () => void
  open: boolean
}

// ResizeControls 尺寸控制
interface ResizeControlsProps {
  mode: 'preset' | 'custom' | 'percentage'
  width: number
  height: number
  maintainAspectRatio: boolean
  onModeChange: (mode: ResizeMode) => void
  onDimensionsChange: (width: number, height: number) => void
  onAspectRatioChange: (maintain: boolean) => void
  onResize: () => void
  disabled?: boolean
}
```

## 关键依赖与配置

### 核心依赖
```json
{
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "next-intl": "^4.3.5",
  "react-dropzone": "^14.3.8",
  "@radix-ui/react-*": "多个UI组件包",
  "lucide-react": "^0.542.0",
  "tailwind-merge": "^3.3.1",
  "class-variance-authority": "^0.7.1"
}
```

### UI组件配置
- **设计系统**: components/ui/ 目录包含11个基础UI组件
- **主题配置**: Tailwind CSS 4 + CSS变量系统
- **图标系统**: Lucide React图标库
- **响应式**: 完整的移动端适配
- **无障碍**: Radix UI提供的完整a11y支持

### 国际化集成
```typescript
// 组件中的国际化使用示例
import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('compression')
  return <p>{t('upload.dragAndDrop')}</p>
}
```

## 数据模型

### 文件处理数据类型
```typescript
// types/image.ts 中定义的核心类型
interface ImageFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  originalSize: number
  compressedSize?: number
  compressionRatio?: number
  error?: string
}

interface CompressionResult {
  id: string
  originalUrl: string
  compressedUrl: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  quality: number
  processing_time: number
}

interface ResizeResult {
  id: string
  originalUrl: string
  resizedUrl: string
  originalDimensions: { width: number; height: number }
  newDimensions: { width: number; height: number }
  mode: 'fit' | 'fill' | 'cover'
  processing_time: number
}
```

### 组件状态管理
```typescript
// 典型的组件状态结构
interface CompressionPageState {
  files: ImageFile[]
  results: CompressionResult[]
  settings: CompressionSettings
  progress: ProgressState
  view: 'upload' | 'results' | 'history'
  downloading: boolean
}

interface ResizePageState {
  files: ImageFile[]
  results: ResizeResult[]
  settings: ResizeSettings
  cropperOpen: boolean
  currentImage: ImageFile | null
}
```

## 测试与质量

### 测试策略
- **用户验收测试**: 所有批量操作流程已验证
- **交互测试**: 拖拽上传、进度显示、结果对比等功能完整
- **响应式测试**: 移动端和桌面端完整适配
- **无障碍测试**: 键盘导航和屏幕阅读器支持
- **国际化测试**: 中英文界面完整性验证

### 性能优化
- **组件懒加载**: 大组件使用React.lazy()
- **虚拟化**: 大量文件列表使用虚拟滚动
- **图片预览**: 使用URL.createObjectURL优化内存
- **批量操作**: Promise.allSettled控制并发数
- **状态优化**: useCallback和useMemo防止不必要渲染

## 常见问题 (FAQ)

### Q: 如何添加新的图片处理功能？
A: 在相应的页面组件中添加新的控制组件，参考ResizeControls的实现方式，确保与API接口一致。

### Q: 批量操作的并发控制如何调整？
A: 在BatchImageUpload中修改CONCURRENT_LIMIT常量，默认为3个并发请求。

### Q: 如何自定义压缩质量预设？
A: 在BatchCompressionControls中修改QUALITY_PRESETS数组，添加新的预设选项。

### Q: 组件的国际化文案如何管理？
A: 所有文案都在messages/目录的JSON文件中，按功能模块组织，使用useTranslations钩子访问。

### Q: 如何扩展支持新的裁剪宽高比？
A: 在ImageCropper组件中修改ASPECT_RATIOS常量，添加新的比例选项。

## 相关文件清单

### 主要页面组件（7个）
- `ImageCompressionPage.tsx` - 压缩主页面（415行）
- `ImageResizePage.tsx` - 尺寸调整页面（295行）
- `AppHeader.tsx` - 应用头部导航（68行）
- `HeroSection.tsx` - 首页介绍区（33行）
- `FeaturesSection.tsx` - 功能特性展示（100行）
- `FAQSection.tsx` - 常见问题（69行）
- `Footer.tsx` - 页面底部（17行）

### 批量处理组件（4个）
- `BatchImageUpload.tsx` - 批量上传核心组件（533行）
- `BatchCompressionControls.tsx` - 压缩控制面板（363行）
- `BatchComparisonView.tsx` - 结果对比显示（464行）
- `BatchProgressDisplay.tsx` - 进度显示组件（317行）

### 编辑和预览组件（4个）
- `ImageCropper.tsx` - 图片裁剪编辑器（585行）
- `ImageResizeUpload.tsx` - 尺寸调整上传（292行）
- `ResizeControls.tsx` - 尺寸控制面板（449行）
- `ResizePreview.tsx` - 尺寸预览组件（253行）

### 功能组件（5个）
- `HistoryView.tsx` - 历史记录管理（307行）
- `DownloadProgressModal.tsx` - 下载进度弹窗（99行）
- `LanguageSwitcher.tsx` - 语言切换器（126行）
- `StructuredData.tsx` - SEO结构化数据（32行）
- `icons.tsx` - 自定义图标组件（44行）

### UI基础组件（11个）
- `ui/button.tsx` - 按钮组件（59行）
- `ui/card.tsx` - 卡片组件（92行）
- `ui/dialog.tsx` - 对话框组件（143行）
- `ui/input.tsx` - 输入框组件（21行）
- `ui/progress.tsx` - 进度条组件（31行）
- `ui/select.tsx` - 选择器组件（159行）
- `ui/slider.tsx` - 滑块组件（63行）
- `ui/tabs.tsx` - 标签页组件（66行）
- `ui/switch.tsx` - 开关组件（29行）
- `ui/label.tsx` - 标签组件（24行）
- `ui/separator.tsx` - 分隔符组件（28行）

### 展示组件（5个）
- `HowItWorksSection.tsx` - 使用步骤（78行）
- `BenefitsSection.tsx` - 优势展示（71行）
- 其他展示类组件...

---

*模块总计: 25个组件，约3000行代码*  
*最后更新: 2025-09-07 18:35:41*