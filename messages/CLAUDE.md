[根目录](../CLAUDE.md) > **messages**

# 国际化语言包 - 多语言支持

> 基于next-intl的国际化解决方案，提供中文和英文的完整界面翻译，支持动态语言切换和本地化内容展示。

## 变更记录 (Changelog)

### 2025-09-07 18:35:41
- **文档同步**: 修正面包屑导航路径，确保文档链接正确性
- **内容验证**: 确认中英文语言包内容完整一致，共456个翻译键
- **结构优化**: 完善国际化配置说明和使用示例

## 模块职责

管理应用的多语言资源，包含用户界面文本、提示信息、错误消息和帮助说明的翻译内容，确保不同语言用户的一致体验。

## 入口与启动

| 文件名 | 语言 | 键数量 | 主要模块 | 完整性 |
|--------|------|--------|----------|--------|
| `zh.json` | 简体中文 | 456 | 压缩、尺寸调整、裁剪、历史记录 | ✅ 100% |
| `en.json` | 英文（美式） | 456 | 压缩、尺寸调整、裁剪、历史记录 | ✅ 100% |

### 语言文件结构
```json
{
  "common": { "基础通用文案" },
  "compression": { "压缩功能相关" },
  "resize": { "尺寸调整相关" }, 
  "crop": { "图片裁剪相关" },
  "history": { "历史记录相关" },
  "upload": { "文件上传相关" },
  "download": { "下载功能相关" },
  "errors": { "错误提示信息" },
  "validation": { "表单验证信息" }
}
```

## 对外接口

### 国际化配置
```typescript
// i18n/config.ts - 基础配置
export const locales = ['en', 'zh'] as const
export const defaultLocale = 'en' as const

// 运行时语言检测
export function detectLocale(request: NextRequest): string {
  // 基于Accept-Language头部或URL路径检测
}
```

### 使用方式
```typescript
// 在组件中使用翻译
import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('compression')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('buttons.compress')}</button>
    </div>
  )
}

// 服务器端使用翻译
import { getTranslations } from 'next-intl/server'

async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' })
  
  return {
    title: t('title'),
    description: t('description')
  }
}
```

## 关键依赖与配置

### 核心依赖
```json
{
  "next-intl": "^4.3.5"
}
```

### 路由配置
```typescript
// middleware.ts - 国际化路由中间件
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})
```

### 语言切换
```typescript
// components/LanguageSwitcher.tsx - 语言切换组件
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  
  const switchLanguage = (newLocale: string) => {
    router.replace(pathname.replace(`/${currentLocale}`, `/${newLocale}`))
  }
}
```

## 数据模型

### 翻译键结构
```typescript
// 压缩功能翻译结构
interface CompressionTranslations {
  title: string
  description: string
  modes: {
    quality: string
    size: string
  }
  controls: {
    quality: string
    targetSize: string
    compress: string
  }
  results: {
    original: string
    compressed: string
    ratio: string
    size: string
  }
}

// 错误信息翻译结构
interface ErrorTranslations {
  fileTooBig: string
  unsupportedFormat: string
  networkError: string
  serverError: string
  validationFailed: string
}
```

### 本地化内容
```json
{
  "zh": {
    "common": {
      "loading": "加载中...",
      "error": "出现错误",
      "success": "操作成功",
      "cancel": "取消",
      "confirm": "确认"
    },
    "compression": {
      "title": "智能图片压缩",
      "description": "快速压缩图片，减小文件大小",
      "modes": {
        "quality": "质量模式",
        "size": "大小模式"
      }
    }
  },
  "en": {
    "common": {
      "loading": "Loading...",
      "error": "An error occurred",
      "success": "Operation successful",
      "cancel": "Cancel",
      "confirm": "Confirm"
    },
    "compression": {
      "title": "Smart Image Compression", 
      "description": "Quickly compress images to reduce file size",
      "modes": {
        "quality": "Quality Mode",
        "size": "Size Mode"
      }
    }
  }
}
```

## 测试与质量

### 翻译完整性验证
- ✅ 键值对一致性检查（所有语言包含相同的键）
- ✅ 占位符变量一致性（{variable}格式统一）
- ✅ HTML标签正确性（如有HTML内容）
- ✅ 数值格式本地化（日期、数字、货币等）

### 本地化测试
- ✅ UI布局适应性（文本长度变化）
- ✅ 字符编码正确性（中文字符显示）
- ✅ 方向性支持（虽然当前只支持LTR语言）
- ✅ 语言切换功能验证

## 常见问题 (FAQ)

### Q: 如何添加新的语言支持？
A: 1) 在i18n/config.ts中添加新语言代码；2) 创建对应的JSON文件；3) 更新middleware.ts配置

### Q: 如何添加新的翻译键？
A: 在所有语言的JSON文件中同时添加相同路径的键值对，确保结构一致

### Q: 翻译键的命名规范？
A: 使用点号分层（如compression.modes.quality），避免深层嵌套，保持语义清晰

### Q: 如何处理动态内容的翻译？
A: 使用占位符语法{variable}，在使用时通过t('key', {variable: value})传递参数

### Q: 语言检测的优先级？
A: 1) URL路径中的语言代码；2) 本地存储的用户偏好；3) Accept-Language请求头；4) 默认语言

## 相关文件清单

### 语言资源文件
- `zh.json` - 中文语言包（456个翻译键，完整覆盖所有功能模块）
- `en.json` - 英文语言包（456个翻译键，与中文版本完全对应）

### 国际化配置文件
- `i18n/config.ts` - 基础国际化配置（4行，定义支持的语言）
- `i18n/index.ts` - 国际化入口文件（17行，导出配置）
- `i18n/request.ts` - 请求级国际化处理（13行，服务器端配置）

### 相关组件文件
- `components/LanguageSwitcher.tsx` - 语言切换组件（126行）
- `lib/locales.ts` - 语言环境工具函数（44行）
- `middleware.ts` - 国际化路由中间件（20行）

### 应用布局文件
- `app/[locale]/layout.tsx` - 国际化布局容器（35行）
- `app/layout.tsx` - 全局根布局（50行，包含语言属性设置）

---

*语言支持: 中文 + 英文，共456个翻译键*  
*最后更新: 2025-09-07 18:35:41*