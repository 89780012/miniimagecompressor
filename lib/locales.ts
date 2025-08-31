// 语言配置文件
// 添加新语言时，只需在此处添加新的语言对象

export interface LocaleConfig {
  code: string        // 语言代码 (ISO 639-1)
  name: string        // 语言显示名称
  flag: string        // 国旗表情符号
  nativeName?: string // 本地语言名称（可选）
}

// 默认语言（不需要URL前缀）
export const DEFAULT_LOCALE = 'zh'

// 支持的语言列表
export const locales: LocaleConfig[] = [
  { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' },
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  // 未来可以轻松添加更多语言：
  // { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  // { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  // { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  // { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  // { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  // { code: 'pt', name: 'Português', flag: '🇵🇹', nativeName: 'Português' },
  // { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
  // { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
  // { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', nativeName: 'हिन्दी' },
  // { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
]

// 从语言代码获取语言配置
export const getLocaleConfig = (code: string): LocaleConfig | undefined => {
  return locales.find(locale => locale.code === code)
}

// 获取所有语言代码
export const getLocaleCodes = (): string[] => {
  return locales.map(locale => locale.code)
}

// 验证语言代码是否有效
export const isValidLocale = (code: string): boolean => {
  return locales.some(locale => locale.code === code)
}