import { getLocale, getTranslations } from 'next-intl/server'
import { AppHeader } from '@/components/AppHeader'
import { StructuredData } from '@/components/StructuredData'
import { GridCollagePage } from '@/components/GridCollagePage'
import { Footer } from '@/components/Footer'
import { generateSEOMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const locale = await getLocale()
  const t = await getTranslations({ locale })

  const path = locale === 'en' ? '/grid' : `/${locale}/grid`

  return await generateSEOMetadata({
    title: t('gridMetadata.title'),
    description: t('gridMetadata.description'),
    keywords: t('gridMetadata.keywords'),
    locale,
    url: path
  })
}

export default async function GridPage() {
  const locale = await getLocale()
  const t = await getTranslations({ locale })

  const breadcrumbs = [
    {
      name: t('common.title'),
      url: locale === 'en' ? '/' : `/${locale}`
    },
    {
      name: t('gridMetadata.title'),
      url: locale === 'en' ? '/grid' : `/${locale}/grid`
    }
  ]

  return (
    <>
      <StructuredData pageType="grid" breadcrumbs={breadcrumbs} />
      <div className="min-h-screen bg-gray-50">
        <AppHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GridCollagePage />
        </main>

        <Footer />
      </div>
    </>
  )
}
