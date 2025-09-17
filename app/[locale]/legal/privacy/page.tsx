import Link from 'next/link'
import { AppHeader } from '@/components/AppHeader'
import { Footer } from '@/components/Footer'
import { getTranslations, getLocale } from 'next-intl/server'

type LegalSection = {
  title: string
  body?: string
  items?: string[]
}

const SECTION_KEYS = [
  'dataWeCollect',
  'howWeUse',
  'storage',
  'thirdParties',
  'yourChoices'
] as const

export async function generateMetadata() {
  const t = await getTranslations('legal')

  return {
    title: t('metadata.privacyTitle'),
    description: t('metadata.privacyDescription')
  }
}

export default async function PrivacyPolicyPage() {
  const locale = await getLocale()
  const t = await getTranslations('legal')

  const sections = t.raw('privacy.sections') as Record<string, LegalSection>
  const lastUpdated = t('common.lastUpdated', { date: t('common.lastUpdatedDate') })
  // const contactLine = t('common.contact', { email: t('common.contactEmail') })
  const backHref = locale === 'en' ? '/' : `/${locale}`

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link
            href={backHref}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← {t('common.backLink')}
          </Link>
        </div>

        <article className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {t('privacy.title')}
            </h1>
            <p className="text-sm text-gray-500">{lastUpdated}</p>
          </header>

          <p className="text-gray-700 leading-relaxed">
            {t('privacy.intro')}
          </p>

          {SECTION_KEYS.map((key) => {
            const section = sections[key]
            if (!section) return null

            return (
              <section key={key} className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  {section.title}
                </h2>
                {section.body && (
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    {section.body}
                  </p>
                )}
                {section.items && (
                  <ul className="mt-3 space-y-2 text-gray-700 leading-relaxed list-disc list-inside">
                    {section.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}

          <p className="mt-8 text-gray-700 leading-relaxed">
            {t('privacy.closing')}
          </p>

          {/* <p className="mt-4 text-gray-700 leading-relaxed">
            {contactLine}
          </p> */}
        </article>
      </main>
      <Footer />
    </div>
  )
}
