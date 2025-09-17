'use client'

import { useTranslations } from 'next-intl'

interface StepCardProps {
  stepNumber: number
  titleKey: string
  descriptionKey: string
  bgColor: string
  textColor: string
}

function StepCard({ stepNumber, titleKey, descriptionKey, bgColor, textColor }: StepCardProps) {
  const t = useTranslations()
  
  return (
    <div className="text-center">
      <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <span className={`text-2xl font-bold ${textColor}`}>{stepNumber}</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {t(titleKey)}
      </h3>
      <p className="text-gray-600">
        {t(descriptionKey)}
      </p>
    </div>
  )
}

export function HowItWorksSection({ toolType = 'compression' }: { toolType?: 'compression' | 'resize' | 'watermark' | 'converter' }) {
  const t = useTranslations()

  const namespace = toolType === 'compression' ? 'howItWorks' : `${toolType}HowItWorks`

  const steps = [
    {
      stepNumber: 1,
      titleKey: `${namespace}.step1.title`,
      descriptionKey: `${namespace}.step1.description`,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      stepNumber: 2,
      titleKey: `${namespace}.step2.title`,
      descriptionKey: `${namespace}.step2.description`,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      stepNumber: 3,
      titleKey: `${namespace}.step3.title`,
      descriptionKey: `${namespace}.step3.description`,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ]

  return (
    <section className="mb-16 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t(`${namespace}.title`)}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t(`${namespace}.subtitle`)}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <StepCard key={step.stepNumber} {...step} />
          ))}
        </div>
      </div>
    </section>
  )
}