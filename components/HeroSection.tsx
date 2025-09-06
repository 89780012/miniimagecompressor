'use client'

import { useTranslations } from 'next-intl'
import { CheckIcon } from './icons'

export function HeroSection() {
  const t = useTranslations()
  
  const features = [
    { key: 'free', color: 'green' },
    { key: 'fast', color: 'blue' },
    { key: 'secure', color: 'purple' }
  ] as const

  return (
    <section className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        {t('hero.title')}
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        {t('hero.description')}
      </p>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {features.map(({ key, color }) => (
          <div key={key} className={`flex items-center bg-${color}-50 px-4 py-2 rounded-full`}>
            <CheckIcon className={`text-${color}-500 mr-2`} />
            <span className={`text-${color}-700 font-medium`}>{t(`hero.features.${key}`)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}