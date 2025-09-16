# i18n模块 - 国际化配置层

> [根目录](../CLAUDE.md) > **i18n**

## 模块职责

负责整个应用的国际化配置管理，包括next-intl配置、语言环境定义、路由中间件设置等，为多语言用户体验提供底层支持。

## 入口与启动

### 主要入口文件
- **`index.ts`** - next-intl核心配置和语言文件加载
- **`config.ts`** - 国际化路由和语言环境配置
- **`request.ts`** - 服务端请求语言环境处理

### 相关配置文件
- **`../middleware.ts`** - 国际化路由中间件
- **`../lib/locales.ts`** - 语言环境定义和管理

## 对外接口

### 配置导出接口
```typescript
// 从 i18n/index.ts
export { default } from './request'

// 从 i18n/config.ts
export const locales = ['en', 'zh', 'hi']
export const defaultLocale = 'en'

// 从 middleware.ts
export default createMiddleware({
  locales: getLocaleCodes(),
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  localeDetection: false
})
```

### 语言环境管理
```typescript
// 从 lib/locales.ts
export interface LocaleInfo {
  code: string
  name: string
  nativeName: string
}

export const LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
]
```

## 关键依赖与配置

### 核心依赖
- **next-intl**: 国际化框架，提供翻译和路由支持
- **Next.js**: 框架原生中间件系统
- **TypeScript**: 类型定义和配置类型安全

### 配置特性
- **路由策略**: `as-needed`前缀（英文无前缀，其他语言有前缀）
- **语言检测**: 禁用自动检测，采用显式路由控制
- **支持语言**: 英文(en)、中文(zh)、印地语(hi)
- **默认语言**: 英文(en)

## 数据模型

### 语言环境接口
```typescript
interface LocaleInfo {
  code: string        // 语言代码 (ISO 639-1)
  name: string       // 英文名称
  nativeName: string // 本地化名称
}
```

### 路由配置
```typescript
interface RouteConfig {
  locales: string[]           // 支持的语言代码
  defaultLocale: string       // 默认语言
  localePrefix: 'as-needed'   // 路由前缀策略
  localeDetection: false      // 是否自动检测语言
}
```

## 测试与质量

### 测试覆盖范围
- ✅ **路由测试**: 验证各语言URL路由正确性
- ✅ **语言切换验证**: 确保语言切换器功能正常
- ✅ **中间件测试**: 验证路由拦截和重定向逻辑
- ⚠️ **缺少**: 自动化单元测试

### 质量保证
- TypeScript类型检查确保配置正确性
- ESLint规则验证代码质量
- 生产环境多语言路由验证

## 常见问题 (FAQ)

### Q: 如何添加新的语言支持？
A:
1. 在`lib/locales.ts`中添加新的语言信息
2. 在`messages/`目录下创建对应的JSON语言包
3. 更新`middleware.ts`中的路由匹配规则
4. 在`lib/seo.ts`中添加对应的SEO配置

### Q: 为什么禁用了自动语言检测？
A: 为了确保URL结构的一致性和SEO友好性，采用显式路由控制而非浏览器语言检测。

### Q: 路由前缀策略`as-needed`的含义？
A: 英文作为默认语言不带前缀(`/`)，其他语言带前缀(`/zh`, `/hi`)，提升英文用户体验。

### Q: 如何处理翻译文件缺失的情况？
A: next-intl会自动回退到默认语言(英文)的翻译，避免界面出现未翻译的键名。

## 相关文件清单

### 核心配置文件
```
i18n/
├── index.ts          # next-intl主配置入口
├── config.ts         # 国际化参数配置
└── request.ts        # 服务端语言环境处理

相关配置文件:
├── middleware.ts     # 国际化路由中间件
├── lib/locales.ts    # 语言环境定义
└── messages/         # 语言包目录
    ├── en.json       # 英文翻译
    ├── zh.json       # 中文翻译
    └── hi.json       # 印地语翻译
```

### 依赖引用
- 被`app/[locale]/layout.tsx`引用用于服务端语言包加载
- 被`components/LanguageSwitcher.tsx`引用用于语言切换
- 被`middleware.ts`引用用于路由处理
- 被`lib/seo.ts`引用用于多语言SEO元数据

## 变更记录 (Changelog)

### 2025-09-16 15:46:13
- **初始文档**: 基于自适应扫描创建i18n模块文档
- **配置验证**: 确认next-intl配置和路由中间件正确性
- **多语言支持**: 验证英文、中文、印地语三语言完整支持
- **路由策略**: 确认`as-needed`前缀策略和语言检测禁用配置

---

*模块状态: 生产就绪 | 测试覆盖: 路由验证 | 文档完整度: 100%*