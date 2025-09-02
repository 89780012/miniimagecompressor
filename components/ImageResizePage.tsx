'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { ImageFile, ResizeSettings } from '@/types/image'

// 动态导入组件以避免Turbopack SSR问题
const ImageResizeUpload = dynamic(() => import('@/components/ImageResizeUpload').then(mod => ({ default: mod.ImageResizeUpload })), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
})

const ResizeControls = dynamic(() => import('@/components/ResizeControls').then(mod => ({ default: mod.ResizeControls })), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
})

const ResizePreview = dynamic(() => import('@/components/ResizePreview').then(mod => ({ default: mod.ResizePreview })), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
})

interface ImageResizePageProps {
  // 可选的初始状态或配置
  initialView?: 'upload' | 'preview'
}

export function ImageResizePage({ initialView = 'upload' }: ImageResizePageProps) {
  const t = useTranslations()
  const [images, setImages] = useState<ImageFile[]>([])
  const [currentView, setCurrentView] = useState<'upload' | 'preview'>(initialView)
  
  // 默认调整设置
  const [defaultSettings, setDefaultSettings] = useState<ResizeSettings>({
    width: 800,
    height: 600,
    maintainAspectRatio: true,
    resizeMode: 'fit' // 'fit' | 'fill' | 'cover'
  })

  // 添加图片到调整列表
  const handleImagesAdd = useCallback((newImages: ImageFile[]) => {
    setImages(prev => [...prev, ...newImages])
  }, [])

  // 移除单个图片
  const handleImageRemove = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }, [])

  // 清空所有图片
  const handleImagesClear = useCallback(() => {
    // 清理预览URL
    images.forEach(img => {
      if (img.preview && typeof window !== 'undefined') {
        URL.revokeObjectURL(img.preview)
      }
    })
    setImages([])
  }, [images])

  // 开始批量调整尺寸
  const handleStartResize = useCallback(async () => {
    const pendingImages = images.filter(img => img.status === 'pending')
    if (pendingImages.length === 0) return

    for (const image of pendingImages) {
      const settings = image.resizeSettings || defaultSettings
      
      // 更新状态为处理中
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { ...img, status: 'compressing' as const, progress: 0 } 
          : img
      ))
      
      let progressInterval: NodeJS.Timeout | undefined
      try {
        // 模拟进度更新
        progressInterval = setInterval(() => {
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { ...img, progress: Math.min(img.progress + 15, 90) } 
              : img
          ))
        }, 200)
        
        // 调用调整尺寸API
        const formData = new FormData()
        formData.append('file', image.file)
        formData.append('settings', JSON.stringify(settings))
        
        const response = await fetch('/api/resize', {
          method: 'POST',
          body: formData
        })
        
        clearInterval(progressInterval)
        
        if (!response.ok) {
          throw new Error('尺寸调整失败')
        }
        
        const result = await response.json()
        
        // 更新为完成状态
        setImages(prev => prev.map(img => 
          img.id === image.id ? {
            ...img,
            status: 'completed' as const,
            progress: 100,
            result: {
              id: result.id || `resize_${Date.now()}`,
              original: {
                ...result.original,
                size: result.original.size,
                fileSize: result.original.size
              },
              compressed: {
                ...result.resized,
                size: result.resized.size,
                fileSize: result.resized.size
              },
              stats: {
                originalSize: result.original.size || 0,
                compressedSize: result.resized.size || 0,
                compressionRatio: ((result.original.size - result.resized.size) / result.original.size * 100).toFixed(1),
                originalDimensions: `${result.original.dimensions?.width || 0} × ${result.original.dimensions?.height || 0}`,
                compressedDimensions: `${result.resized.dimensions?.width || 0} × ${result.resized.dimensions?.height || 0}`
              }
            }
          } : img
        ))
        
      } catch (error) {
        if (progressInterval) {
          clearInterval(progressInterval)
        }
        // 更新为错误状态
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        setImages(prev => prev.map(img => 
          img.id === image.id ? {
            ...img,
            status: 'error' as const,
            progress: 0,
            error: errorMessage
          } : img
        ))
      }
    }
    
    // 如果有成功处理的图片，自动切换到预览视图
    const hasCompletedImages = pendingImages.length > 0
    if (hasCompletedImages) {
      setTimeout(() => setCurrentView('preview'), 1000)
    }
  }, [images, defaultSettings])

  // 下载单个调整后的图片
  const handleDownloadSingle = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (image?.result?.compressed?.url) {
      const link = document.createElement('a')
      link.href = `/api/download?url=${encodeURIComponent(image.result.compressed.url)}`
      link.download = `resized_${image.file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [images])

  // 回到上传界面
  const handleBackToUpload = useCallback(() => {
    setCurrentView('upload')
  }, [])

  // 查看预览结果
  const handleViewPreview = useCallback(() => {
    setCurrentView('preview')
  }, [])

  return (
    <>
      {currentView === 'preview' ? (
        <ResizePreview
          images={images}
          onBack={handleBackToUpload}
          onDownloadSingle={handleDownloadSingle}
          onReset={handleImagesClear}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：图片上传 */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('resize.uploadTitle')}
              </h2>
              <ImageResizeUpload
                images={images}
                onImagesAdd={handleImagesAdd}
                onImageRemove={handleImageRemove}
                onImagesClear={handleImagesClear}
                maxFiles={10}
              />
            </div>
            
            {/* 查看预览按钮 */}
            {images.some(img => img.status === 'completed') && (
              <div className="text-center">
                <button
                  onClick={handleViewPreview}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {t('resize.viewPreview')}
                </button>
              </div>
            )}
          </div>

          {/* 右侧：尺寸调整控制 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('resize.controlsTitle')}
              </h2>
              <ResizeControls
                images={images}
                onImagesUpdate={setImages}
                onStartResize={handleStartResize}
                defaultSettings={defaultSettings}
                onDefaultSettingsChange={setDefaultSettings}
              />
            </div>

            {images.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center">
                  {t('resize.uploadMessage')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      {currentView === 'upload' && images.length === 0 && (
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('resize.featuresTitle')}</h2>
            <p className="mt-4 text-lg text-gray-600">{t('resize.featuresSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a1 1 0 011-1h4m0 0L9 9V8a1 1 0 011-1h4l1 1v1M7 8v8a1 1 0 001 1h8a1 1 0 001-1V8M7 8l8 8m0-8l-8 8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('resize.features.precise.title')}</h3>
              <p className="text-gray-600">{t('resize.features.precise.description')}</p>
            </article>
            
            <article className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('resize.features.ratio.title')}</h3>
              <p className="text-gray-600">{t('resize.features.ratio.description')}</p>
            </article>
            
            <article className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('resize.features.formats.title')}</h3>
              <p className="text-gray-600">{t('resize.features.formats.description')}</p>
            </article>
          </div>
        </div>
      )}
    </>
  )
}

ImageResizePage.displayName = 'ImageResizePage'

export default ImageResizePage