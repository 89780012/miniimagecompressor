'use client'

import { useTranslations } from 'next-intl'
import { CheckIcon } from './icons'

interface BenefitItemProps {
  titleKey: string
  descriptionKey: string
}

function BenefitItem({ titleKey, descriptionKey }: BenefitItemProps) {
  const t = useTranslations()
  
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <CheckIcon className="text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t(titleKey)}
        </h3>
        <p className="text-gray-600">
          {t(descriptionKey)}
        </p>
      </div>
    </div>
  )
}

export function BenefitsSection() {
  const t = useTranslations()
  
  const benefits = [
    {
      titleKey: 'benefits.webOptimization.title',
      descriptionKey: 'benefits.webOptimization.description'
    },
    {
      titleKey: 'benefits.storage.title',
      descriptionKey: 'benefits.storage.description'
    },
    {
      titleKey: 'benefits.bandwidth.title',
      descriptionKey: 'benefits.bandwidth.description'
    },
    {
      titleKey: 'benefits.seo.title',
      descriptionKey: 'benefits.seo.description'
    }
  ]

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('benefits.title')}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('benefits.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {benefits.map((benefit, index) => (
          <BenefitItem key={index} {...benefit} />
        ))}
      </div>
    </section>
  )
}