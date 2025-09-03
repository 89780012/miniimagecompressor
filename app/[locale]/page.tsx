'use client'

import { useState, useCallback } from 'react'
import { useTranslations} from 'next-intl'
import { AppHeader } from '@/components/AppHeader'
import { StructuredData } from '@/components/StructuredData'
import { ImageCompressionPage } from '@/components/ImageCompressionPage'
import { ImageResizePage } from '@/components/ImageResizePage'


// 功能类型定义
type FeatureType = 'compression' | 'resize'

export default function HomePage() {
  const t = useTranslations()
  const [currentFeature, setCurrentFeature] = useState<FeatureType>('compression')
  const [showHistory, setShowHistory] = useState(false)


  // 切换功能
  const handleFeatureChange = useCallback((feature: FeatureType) => {
    setCurrentFeature(feature)
    setShowHistory(false) // 切换功能时隐藏历史记录
  }, [])

  return (
    <>
      <StructuredData />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <AppHeader 
          currentFeature={currentFeature}
          onFeatureChange={handleFeatureChange}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentFeature === 'resize' ? (
            <ImageResizePage />
          ) : (
            <ImageCompressionPage 
              initialView={showHistory ? 'history' : 'upload'}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>{t('footer.copyright')}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}