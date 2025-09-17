import { getLocale, getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo'
import { AppHeader } from '@/components/AppHeader'
import { StructuredData } from '@/components/StructuredData'
import { ImageCompressionPage } from '@/components/ImageCompressionPage'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { HowItWorksSection } from '@/components/HowItWorksSection'
import { FAQSection } from '@/components/FAQSection'
import { BenefitsSection } from '@/components/BenefitsSection'
import { Footer } from '@/components/Footer'

export async function generateMetadata() {
  const locale = await getLocale();
  const t = await getTranslations({ locale });

  return await generateSEOMetadata({
    title: t("metadata.title"),
    description: t("metadata.description"),
    keywords: t("metadata.keywords"),
    locale: locale,
    url: locale === 'en' ? '' : `/${locale}`
  });
}

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <div className="min-h-screen bg-gray-50">
        <AppHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSection toolType="compression" />

          <section className="mb-16">
            <ImageCompressionPage />
          </section>

          <FeaturesSection toolType="compression" />
          <HowItWorksSection toolType="compression" />
          <FAQSection toolType="compression" />
          <BenefitsSection toolType="compression" />
        </main>

        <Footer />
      </div>
    </>
  )
}