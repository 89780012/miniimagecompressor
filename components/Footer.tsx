'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations()
  const locale = useLocale()

  const legalBase = locale === 'en' ? '' : `/${locale}`
  const privacyHref = `${legalBase}/legal/privacy`
  const termsHref = `${legalBase}/legal/terms`

  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href={privacyHref} className="hover:text-blue-600 transition-colors">
              {t('footer.links.privacy')}
            </Link>
            <span className="hidden sm:block text-gray-300">|</span>
            <Link href={termsHref} className="hover:text-blue-600 transition-colors">
              {t('footer.links.terms')}
            </Link>
          </div>
          <p className="text-center sm:text-right text-gray-500">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
