'use client'

import { useTranslations } from 'next-intl'
import { BoltIcon, CheckCircleIcon, LockIcon, ImageIcon, ArchiveIcon, CogIcon } from './icons'

interface FeatureCardProps {
  icon: React.ReactNode
  titleKey: string
  descriptionKey: string
  bgColor: string
  iconColor: string
}

function FeatureCard({ icon, titleKey, descriptionKey, bgColor, iconColor }: FeatureCardProps) {
  const t = useTranslations()
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
        <div className={iconColor}>
          {icon}
        </div>
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

export function FeaturesSection({ toolType = 'compression' }: { toolType?: 'compression' | 'resize' | 'watermark' | 'converter' }) {
  const t = useTranslations()

  // 根据工具类型确定翻译命名空间和功能特性
  const namespace = toolType === 'compression' ? 'features' : `${toolType}Features`

  // 根据工具类型定义不同的功能特性
  const getFeaturesByToolType = (type: string) => {
    const baseFeatures = [
      {
        icon: <BoltIcon />,
        titleKey: `${namespace}.fast.title`,
        descriptionKey: `${namespace}.fast.description`,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      {
        icon: <CheckCircleIcon />,
        titleKey: `${namespace}.quality.title`,
        descriptionKey: `${namespace}.quality.description`,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      {
        icon: <LockIcon />,
        titleKey: `${namespace}.secure.title`,
        descriptionKey: `${namespace}.secure.description`,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600'
      }
    ]

    switch (type) {
      case 'resize':
        return [
          ...baseFeatures,
          {
            icon: <ImageIcon />,
            titleKey: `${namespace}.flexible.title`,
            descriptionKey: `${namespace}.flexible.description`,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600'
          },
          {
            icon: <CogIcon />,
            titleKey: `${namespace}.precise.title`,
            descriptionKey: `${namespace}.precise.description`,
            bgColor: 'bg-indigo-100',
            iconColor: 'text-indigo-600'
          },
          {
            icon: <ArchiveIcon />,
            titleKey: `${namespace}.batch.title`,
            descriptionKey: `${namespace}.batch.description`,
            bgColor: 'bg-teal-100',
            iconColor: 'text-teal-600'
          }
        ]
      case 'compression':
      default:
        return [
          ...baseFeatures,
          {
            icon: <ImageIcon />,
            titleKey: `${namespace}.formats.title`,
            descriptionKey: `${namespace}.formats.description`,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600'
          },
          {
            icon: <ArchiveIcon />,
            titleKey: `${namespace}.batch.title`,
            descriptionKey: `${namespace}.batch.description`,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600'
          },
          {
            icon: <CogIcon />,
            titleKey: `${namespace}.smart.title`,
            descriptionKey: `${namespace}.smart.description`,
            bgColor: 'bg-indigo-100',
            iconColor: 'text-indigo-600'
          }
        ]
    }
  }

  const features = getFeaturesByToolType(toolType)

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  )
}