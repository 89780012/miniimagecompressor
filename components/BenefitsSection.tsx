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

export function BenefitsSection({ toolType = 'compression' }: { toolType?: 'compression' | 'resize' | 'watermark' | 'converter' }) {
  const t = useTranslations()

  const namespace = toolType === 'compression' ? 'benefits' : `${toolType}Benefits`

  const getBenefitsByToolType = (type: string) => {
    switch (type) {
      case 'resize':
        return [
          {
            titleKey: `${namespace}.responsive.title`,
            descriptionKey: `${namespace}.responsive.description`
          },
          {
            titleKey: `${namespace}.performance.title`,
            descriptionKey: `${namespace}.performance.description`
          },
          {
            titleKey: `${namespace}.compatibility.title`,
            descriptionKey: `${namespace}.compatibility.description`
          },
          {
            titleKey: `${namespace}.workflow.title`,
            descriptionKey: `${namespace}.workflow.description`
          }
        ]
      case 'compression':
      default:
        return [
          {
            titleKey: `${namespace}.webOptimization.title`,
            descriptionKey: `${namespace}.webOptimization.description`
          },
          {
            titleKey: `${namespace}.storage.title`,
            descriptionKey: `${namespace}.storage.description`
          },
          {
            titleKey: `${namespace}.bandwidth.title`,
            descriptionKey: `${namespace}.bandwidth.description`
          },
          {
            titleKey: `${namespace}.seo.title`,
            descriptionKey: `${namespace}.seo.description`
          }
        ]
    }
  }

  const benefits = getBenefitsByToolType(toolType)

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t(`${namespace}.title`)}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t(`${namespace}.subtitle`)}
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