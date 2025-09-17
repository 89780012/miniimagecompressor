'use client'

import { useTranslations } from 'next-intl'
import { CheckIcon } from './icons'

export type ToolType = 'compression' | 'resize' | 'watermark' | 'converter'

interface HeroSectionProps {
  toolType?: ToolType
}

export function HeroSection({ toolType = 'compression' }: HeroSectionProps) {
  const t = useTranslations()

  const features = [
    { key: 'free', color: 'green' },
    { key: 'fast', color: 'blue' },
    { key: 'secure', color: 'purple' }
  ] as const

  // 根据工具类型确定翻译命名空间
  const namespace = toolType === 'compression' ? 'hero' : `${toolType}Hero`

  return (
    <section className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        {t(`${namespace}.title`)}
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        {t(`${namespace}.description`)}
      </p>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {features.map(({ key, color }) => (
          <div key={key} className={`flex items-center bg-${color}-50 px-4 py-2 rounded-full`}>
            <CheckIcon className={`text-${color}-500 mr-2`} />
            <span className={`text-${color}-700 font-medium`}>{t(`${namespace}.features.${key}`)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}