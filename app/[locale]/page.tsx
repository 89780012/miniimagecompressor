'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ImageUpload } from '@/components/ImageUpload'
import { CompressionControls, CompressionSettings } from '@/components/CompressionControls'
import { ComparisonView } from '@/components/ComparisonView'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { StructuredData } from '@/components/StructuredData'
import { compressImage, CompressionResult } from '@/lib/compression'

interface ImageFile {
  file: File
  preview: string
  size: number
  dimensions?: { width: number; height: number }
}

export default function HomePage() {
  const t = useTranslations()
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null)
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [settings, setSettings] = useState<CompressionSettings>({
    mode: 'quality',
    quality: 80,
    format: 'jpeg'
  })

  const handleCompress = async () => {
    if (!selectedImage) return

    setIsCompressing(true)
    try {
      const result = await compressImage(selectedImage.file, settings)
      setCompressionResult(result)
    } catch (error) {
      console.error(t('errors.compressionFailed'), error)
      alert(t('errors.compressionFailed') + ': ' + (error instanceof Error ? error.message : t('errors.unknownError')))
    } finally {
      setIsCompressing(false)
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setCompressionResult(null)
    setIsCompressing(false)
  }

  return (
    <>
      <StructuredData />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('common.title')}</h1>
                <p className="text-sm text-gray-600">{t('common.subtitle')}</p>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {compressionResult ? (
            <ComparisonView
              result={compressionResult}
              onReset={handleReset}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左侧：图片上传 */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('upload.title')}
                  </h2>
                  <ImageUpload
                    selectedImage={selectedImage}
                    onImageSelect={setSelectedImage}
                  />
                </div>
                
                {selectedImage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">{t('upload.tips.title')}</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>{t('upload.tips.format')}</li>
                      <li>{t('upload.tips.size')}</li>
                      <li>{t('upload.tips.ratio')}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 右侧：压缩设置 */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('compression.title')}
                  </h2>
                  <CompressionControls
                    settings={settings}
                    onSettingsChange={setSettings}
                    onCompress={handleCompress}
                    isCompressing={isCompressing}
                    disabled={!selectedImage}
                  />
                </div>

                {!selectedImage && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 text-center">
                      {t('compression.enableMessage')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features */}
          {!compressionResult && (
            <div className="mt-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">{t('features.title')}</h2>
                <p className="mt-4 text-lg text-gray-600">{t('features.subtitle')}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <article className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.fast.title')}</h3>
                  <p className="text-gray-600">{t('features.fast.description')}</p>
                </article>
                
                <article className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.quality.title')}</h3>
                  <p className="text-gray-600">{t('features.quality.description')}</p>
                </article>
                
                <article className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.secure.title')}</h3>
                  <p className="text-gray-600">{t('features.secure.description')}</p>
                </article>
              </div>
            </div>
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