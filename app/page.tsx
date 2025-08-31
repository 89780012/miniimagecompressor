'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { CompressionControls, CompressionSettings } from '@/components/CompressionControls'
import { ComparisonView } from '@/components/ComparisonView'
import { compressImage, CompressionResult } from '@/lib/compression'

interface ImageFile {
  file: File
  preview: string
  size: number
  dimensions?: { width: number; height: number }
}

export default function HomePage() {
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
      console.error('压缩失败:', error)
      alert('压缩失败: ' + (error instanceof Error ? error.message : '未知错误'))
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">图片压缩工具</h1>
            <p className="text-sm text-gray-600">快速、高效的在线图片压缩服务</p>
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
                  步骤 1: 上传图片
                </h2>
                <ImageUpload
                  selectedImage={selectedImage}
                  onImageSelect={setSelectedImage}
                />
              </div>
              
              {selectedImage && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">提示</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 支持 JPEG, PNG, WebP, BMP, GIF 格式</li>
                    <li>• 建议上传大小不超过 10MB 的图片</li>
                    <li>• 压缩后的图片将保持原有的长宽比</li>
                  </ul>
                </div>
              )}
            </div>

            {/* 右侧：压缩设置 */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  步骤 2: 设置压缩参数
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
                    请先上传图片以启用压缩设置
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
              <h2 className="text-3xl font-bold text-gray-900">为什么选择我们的压缩工具？</h2>
              <p className="mt-4 text-lg text-gray-600">专业的图片压缩技术，为您提供最佳的体验</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">快速压缩</h3>
                <p className="text-gray-600">采用先进的压缩算法，几秒钟内完成图片压缩处理</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">高质量保证</h3>
                <p className="text-gray-600">智能压缩算法确保在减小文件大小的同时保持图片质量</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">安全可靠</h3>
                <p className="text-gray-600">所有处理均在本地完成，确保您的图片隐私安全</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 图片压缩工具. 为您提供专业的图片优化服务.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
