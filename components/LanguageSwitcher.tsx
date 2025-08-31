'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

const locales = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: string) => {
    // Remove the current locale from pathname if it exists
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    const newPath = newLocale === 'zh' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`
    router.push(newPath)
  }

  const currentLocale = locales.find(l => l.code === locale) || locales[0]
  const otherLocales = locales.filter(l => l.code !== locale)

  return (
    <div className="relative inline-block">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Globe className="h-4 w-4" />
          <span>{currentLocale.flag}</span>
          <span className="hidden sm:inline">{currentLocale.name}</span>
        </Button>
        
        <div className="flex space-x-1">
          {otherLocales.map((loc) => (
            <Button
              key={loc.code}
              variant="ghost"
              size="sm"
              onClick={() => switchLanguage(loc.code)}
              className="flex items-center space-x-1 text-xs"
            >
              <span>{loc.flag}</span>
              <span className="hidden sm:inline">{loc.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}