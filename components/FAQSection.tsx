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

export function FAQSection() {
  const t = useTranslations()
  
  const faqs = [
    {
      questionKey: 'faq.q1.question',
      answerKey: 'faq.q1.answer'
    },
    {
      questionKey: 'faq.q2.question',
      answerKey: 'faq.q2.answer'
    },
    // {
    //   questionKey: 'faq.q3.question',
    //   answerKey: 'faq.q3.answer'
    // },
    {
      questionKey: 'faq.q4.question',
      answerKey: 'faq.q4.answer'
    },
    {
      questionKey: 'faq.q5.question',
      answerKey: 'faq.q5.answer'
    }
  ]

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {t('faq.title')}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('faq.subtitle')}
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