'use client'

import { useState, useCallback } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { StructuredData } from '@/components/StructuredData'
import { ImageCompressionPage } from '@/components/ImageCompressionPage'
import { ImageResizePage } from '@/components/ImageResizePage'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { HowItWorksSection } from '@/components/HowItWorksSection'
import { FAQSection } from '@/components/FAQSection'
import { BenefitsSection } from '@/components/BenefitsSection'
import { Footer } from '@/components/Footer'

type FeatureType = 'compression' | 'resize'

export default function HomePage() {
  const [currentFeature, setCurrentFeature] = useState<FeatureType>('compression')
  const [showHistory, setShowHistory] = useState(false)

  const handleFeatureChange = useCallback((feature: FeatureType) => {
    setCurrentFeature(feature)
    setShowHistory(false)
  }, [])

  return (
    <>
      <StructuredData />
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          currentFeature={currentFeature}
          onFeatureChange={handleFeatureChange}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HeroSection />

          <section className="mb-16">
            {currentFeature === 'resize' ? (
              <ImageResizePage />
            ) : (
              <ImageCompressionPage
                initialView={showHistory ? 'history' : 'upload'}
              />
            )}
          </section>

          <FeaturesSection />
          <HowItWorksSection />
          <FAQSection />
          <BenefitsSection />
        </main>

        <Footer />
      </div>
    </>
  )
}