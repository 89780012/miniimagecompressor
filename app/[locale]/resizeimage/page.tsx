'use client'

import { AppHeader } from '@/components/AppHeader'
import { StructuredData } from '@/components/StructuredData'
import { ImageResizePage } from '@/components/ImageResizePage'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { HowItWorksSection } from '@/components/HowItWorksSection'
import { FAQSection } from '@/components/FAQSection'
import { BenefitsSection } from '@/components/BenefitsSection'
import { Footer } from '@/components/Footer'

export default function ResizeImagePage() {
  return (
    <>
      <StructuredData pageType="resize" />
      <div className="min-h-screen bg-gray-50">
        <AppHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSection toolType="resize" />

          <section className="mb-16">
            <ImageResizePage />
          </section>

          <FeaturesSection toolType="resize" />
          <HowItWorksSection toolType="resize" />
          <FAQSection toolType="resize" />
          <BenefitsSection toolType="resize" />
        </main>

        <Footer />
      </div>
    </>
  )
}