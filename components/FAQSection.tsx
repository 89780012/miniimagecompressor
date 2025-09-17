'use client'

import { useTranslations } from 'next-intl'

interface FAQItemProps {
  questionKey: string
  answerKey: string
}

function FAQItem({ questionKey, answerKey }: FAQItemProps) {
  const t = useTranslations()
  
  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t(questionKey)}
      </h3>
      <p className="text-gray-600">
        {t(answerKey)}
      </p>
    </div>
  )
}

export function FAQSection({ toolType = 'compression' }: { toolType?: 'compression' | 'resize' | 'watermark' | 'converter' }) {
  const t = useTranslations()

  const namespace = toolType === 'compression' ? 'faq' : `${toolType}FAQ`

  const faqs = [
    {
      questionKey: `${namespace}.q1.question`,
      answerKey: `${namespace}.q1.answer`
    },
    {
      questionKey: `${namespace}.q2.question`,
      answerKey: `${namespace}.q2.answer`
    },
    // {
    //   questionKey: `${namespace}.q3.question`,
    //   answerKey: `${namespace}.q3.answer`
    // },
    {
      questionKey: `${namespace}.q4.question`,
      answerKey: `${namespace}.q4.answer`
    },
    {
      questionKey: `${namespace}.q5.question`,
      answerKey: `${namespace}.q5.answer`
    }
  ]

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

      <div className="max-w-4xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <FAQItem key={index} {...faq} />
        ))}
      </div>
    </section>
  )
}