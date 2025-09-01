[根目录](../../CLAUDE.md) > **messages**

# 国际化语言包 - 多语言支持

> 基于next-intl的国际化解决方案，提供中文和英文的完整界面翻译，支持动态语言切换和本地化内容展示。

## 模块职责

管理应用的多语言资源，包含用户界面文本、提示信息、错误消息和帮助说明的翻译内容，确保不同语言用户的一致体验。

## 入口与启动

| 语言包文件 | 语言代码 | 覆盖范围 | 维护状态 |
|-----------|----------|----------|----------|
| `zh.json` | zh (中文简体) | 100% 完整覆盖 | ✅ 主要语言 |
| `en.json` | en (英文) | 95% 基础覆盖 | 🚧 补充完善中 |

## 对外接口

### 翻译键值结构
```typescript
// 通过useTranslations hook使用
const t = useTranslations()

// 使用示例
t('common.title')                    // "图片压缩工具"
t('upload.maxFiles', { current: 5, max: 10 })  // "5 / 10 个文件"
t('compression.qualityGuide.high')   // "• 85-95%: 高质量，文件较大"
```

### 主要翻译分组
```json
{
  "common": {          // 通用文本：标题、按钮、状态
    "title": "图片压缩工具",
    "loading": "加载中...",
    "error": "错误",
    "success": "成功"
  },
  "upload": {          // 上传相关：拖拽、选择、状态
    "clickOrDrag": "点击选择文件或拖拽上传",
    "supportFormats": "支持 JPEG, PNG, WebP, BMP, GIF 格式",
    "status": {
      "pending": "等待中",
      "compressing": "压缩中...",
      "completed": "已完成"
    }
  },
  "compression": {     // 压缩相关：参数、模式、提示
    "qualityMode": "质量模式",
    "sizeMode": "大小模式", 
    "targetSize": "目标文件大小",
    "formatHints": "JPEG: 最小文件大小 | PNG: 支持透明度 | WebP: 现代浏览器的最佳选择"
  },
  "comparison": {      // 对比相关：结果、统计、下载
    "compressionRatio": "压缩率",
    "downloadCompressed": "下载压缩图",
    "overallStats": "总体统计"
  },
  "progress": {        // 进度相关：批量处理、状态显示
    "batchProgress": "批量处理进度",
    "currentlyProcessing": "正在处理"
  },
  "errors": {          // 错误信息：失败提示、异常处理
    "compressionFailed": "压缩失败",
    "downloadFailed": "下载失败"
  }
}
```

## 关键依赖与配置

### 国际化框架
```json
{
  "next-intl": "^4.3.5"     // Next.js 国际化解决方案
}
```

### 路由配置 (`i18n/config.ts`)
```typescript
export const locales = ['zh', 'en'] as const
export const defaultLocale = 'zh' as const

// URL结构: /zh/... 或 /en/...
// 默认重定向: / -> /zh
```

### 中间件配置 (`middleware.ts`)
```typescript
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localePrefix: 'always'    // 总是显示语言前缀
})
```

## 数据模型

### 翻译内容层次结构
```
messages/
├── zh.json (中文主语言包)
│   ├── common (通用组件文本)
│   ├── upload (上传功能文本)
│   ├── compression (压缩功能文本)
│   ├── comparison (对比功能文本)
│   ├── progress (进度显示文本)
│   ├── features (特性介绍文本)
│   ├── footer (页脚信息文本)
│   ├── history (历史记录文本)
│   ├── downloadProgress (下载进度文本)
│   └── errors (错误信息文本)
└── en.json (英文语言包 - 基础版本)
```

### 翻译文本特点
- **参数化支持**: 使用`{变量名}`进行动态内容插入
- **嵌套结构**: 按功能模块分组，便于维护和查找
- **用户友好**: 提供详细的操作提示和说明文档
- **专业术语**: 图片压缩领域的准确术语翻译

### 特殊翻译处理
```json
{
  "upload": {
    "maxFiles": "{current} / {max} 个文件",      // 参数化文本
    "tips": {                                    // 嵌套提示内容
      "format": "• 支持 JPEG, PNG, WebP, BMP, GIF 格式",
      "size": "• 建议上传大小不超过 10MB 的图片"
    }
  },
  "compression": {
    "qualityGuide": {                           // 分级说明
      "high": "• 85-95%: 高质量，文件较大",
      "balanced": "• 75-85%: 平衡质量和大小",
      "medium": "• 60-75%: 中等质量，文件较小"
    }
  }
}
```

## 测试与质量

### 翻译完整性检查
```typescript
// 计划中的翻译验证脚本
describe('Translation Completeness', () => {
  test('English translations should match Chinese keys')
  test('All placeholder parameters should be consistent')
  test('No missing translations in production keys')
})
```

### 语言质量标准
- **中文（主语言）**: 100% 完整，符合中文用户习惯表达
- **英文（次语言）**: 基础完整，技术术语准确
- **一致性**: 同一概念在不同页面使用相同翻译
- **用户导向**: 优先考虑用户理解，避免直译

## 常见问题 (FAQ)

### Q: 如何添加新的翻译内容？
**A**: 
1. 在`zh.json`中添加新的键值对
2. 在`en.json`中添加对应的英文翻译
3. 在组件中使用`t('your.new.key')`调用
4. 测试两种语言的显示效果

### Q: 动态内容如何处理翻译？
**A**: 使用参数化翻译：
```typescript
// messages/zh.json
"upload.maxFiles": "{current} / {max} 个文件"

// 组件中使用
t('upload.maxFiles', { current: 5, max: 30 })  // "5 / 30 个文件"
```

### Q: 如何处理复杂的HTML内容翻译？
**A**: 
- 简单HTML: 使用`dangerouslySetInnerHTML`
- 复杂内容: 拆分为多个翻译键
- Rich text: 考虑使用`next-intl`的rich text功能

### Q: 语言切换如何实现？
**A**: 通过`LanguageSwitcher.tsx`组件：
```typescript
const switchLanguage = (locale: 'zh' | 'en') => {
  router.push(`/${locale}${pathname}`)
}
```

## 相关文件清单

### 语言包文件
- `zh.json` - 中文简体完整语言包 (201行，~8KB)
- `en.json` - 英文基础语言包 (预计150行，~6KB，计划中)

### 国际化配置
- `../i18n/config.ts` - 语言环境配置 (~20行)
- `../i18n/request.ts` - 服务端请求处理 (~30行) 
- `../middleware.ts` - 路由中间件配置 (~15行)
- `../next-intl.config.ts` - next-intl框架配置 (~20行)

### 相关组件
- `../components/LanguageSwitcher.tsx` - 语言切换器 (~50行)

## 变更记录 (Changelog)

### 2025-09-01 20:35:45
- **新增**: 国际化模块文档生成，包含翻译结构和使用说明
- **完善**: 中文语言包内容覆盖，涵盖所有功能模块的用户界面文本
- **计划**: 英文语言包补充完善，提升国际化用户体验