'use client'

import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { History } from 'lucide-react'
import Link from 'next/link'
import { LanguageSwitcher } from './LanguageSwitcher'
import { changelogTranslations } from '@/lib/changelog-data'
import { SupportedLocale } from '@/types/changelog'

export function AppHeader() {
  const t = useTranslations()
  const locale = useLocale() as SupportedLocale
  const pathname = usePathname()
  const changelogT = changelogTranslations[locale]

  // 判断当前路由
  const isCompressionPage = pathname === `/${locale}` || pathname === '/'
  const isResizePage = pathname.includes('/resizeimage')

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('common.title')}</h1>
            <p className="text-sm text-gray-600">{t('common.subtitle')}</p>
          </div>

          {/* 功能切换按钮组 */}
          <div className="flex items-center gap-2">
            {/* 图片压缩按钮 */}
            <Link
              href={locale === 'en' ? '/' : `/${locale}`}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md h-9 transition-colors ${
                isCompressionPage
                  ? 'text-white bg-blue-600 border border-blue-600'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('compress.title')}
            </Link>

            {/* 图片尺寸调整按钮 */}
            <Link
              href={locale === 'en' ? '/resizeimage' : `/${locale}/resizeimage`}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md h-9 transition-colors ${
                isResizePage
                  ? 'text-white bg-blue-600 border border-blue-600'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a1 1 0 011-1h4m0 0L9 9V8a1 1 0 011-1h4l1 1v1M7 8v8a1 1 0 001 1h8a1 1 0 001-1V8M7 8l8 8m0-8l-8 8" />
              </svg>
              {t('resize.title')}
            </Link>

            {/* 语言切换 */}
            <LanguageSwitcher />

            {/* Changelog 链接 */}
            <Link
              href={locale === 'en' ? '/changelog' : `/${locale}/changelog`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md h-9 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <History className="w-4 h-4" />
              {changelogT.title}
            </Link>

          </div>
        </div>
      </div>
    </header>
  )
}