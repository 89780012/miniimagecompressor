'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronDown, Check } from 'lucide-react'
import { locales, DEFAULT_LOCALE, getLocaleConfig } from '@/lib/locales'

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  /**
   * 从路径中提取不带语言前缀的纯路径
   * @param path - 当前完整路径
   * @returns 不带语言前缀的路径
   */
  const getPathWithoutLocale = (path: string): string => {
    // 检查路径是否以任何非默认语言开头
    for (const loc of locales) {
      if (loc.code !== DEFAULT_LOCALE) {
        const prefix = `/${loc.code}`
        if (path === prefix) return '/'
        if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length)
      }
    }
    return path
  }

  /**
   * 构建带语言前缀的路径
   * @param targetLocale - 目标语言代码
   * @param basePath - 基础路径（不带语言前缀）
   * @returns 完整的目标路径
   */
  const buildLocalizedPath = (targetLocale: string, basePath: string): string => {
    // 默认语言不需要前缀
    if (targetLocale === DEFAULT_LOCALE) {
      return basePath
    }
    
    // 其他语言添加前缀
    return `/${targetLocale}${basePath === '/' ? '' : basePath}`
  }

  /**
   * 切换语言
   * @param newLocale - 新的语言代码
   */
  const switchLanguage = (newLocale: string) => {
    // 如果是当前语言，直接关闭菜单
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }

    // 提取不带语言前缀的路径
    const basePath = getPathWithoutLocale(pathname)
    
    // 构建目标路径
    const targetPath = buildLocalizedPath(newLocale, basePath)
    
    // 执行路由跳转
    router.push(targetPath)
    setIsOpen(false)
  }

  const currentLocale = getLocaleConfig(locale) || locales[0]

  return (
    <div className="relative">
      {/* 下拉触发按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[120px] justify-between"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          <span>{currentLocale.flag}</span>
          <span className="font-medium">{currentLocale.name}</span>
        </div>
        <ChevronDown 
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </Button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉选项 */}
          <div className="absolute top-full right-0 mt-1 z-20 min-w-[140px] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
            <div className="py-1" role="listbox">
              {locales.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => switchLanguage(loc.code)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    loc.code === locale ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={loc.code === locale}
                >
                  <div className="flex items-center gap-2">
                    <span>{loc.flag}</span>
                    <span className="font-medium">{loc.name}</span>
                  </div>
                  {loc.code === locale && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}