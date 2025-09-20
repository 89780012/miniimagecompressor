'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { BatchImageUpload } from '@/components/BatchImageUpload'
import { BatchCompressionControls } from '@/components/BatchCompressionControls'
import { BatchProgressDisplay } from '@/components/BatchProgressDisplay'
import { BatchComparisonView } from '@/components/BatchComparisonView'
import { HistoryView } from '@/components/HistoryView'
import { compressImage } from '@/lib/smart-compression'
import { CompressionSettings } from '@/types/image'
import { 
  saveToHistory, 
  getHistory, 
  clearExpiredHistory,
  HistoryItem 
} from '@/lib/history'
import { downloadAsZip, DownloadableItem } from '@/lib/batch-download'
import { useDownloadProgress } from '@/hooks/useDownloadProgress'
import { DownloadProgressModal } from '@/components/DownloadProgressModal'
import { ImageFile, BatchProgress } from '@/types/image'

interface ImageCompressionPageProps {
  // 可选的初始状态或配置
  initialView?: 'upload' | 'comparison' | 'history'
}

export function ImageCompressionPage({ initialView = 'upload' }: ImageCompressionPageProps) {
  const t = useTranslations()
  const [images, setImages] = useState<ImageFile[]>([])
  const [currentView, setCurrentView] = useState<'upload' | 'comparison' | 'history'>(initialView)
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    completed: 0,
    total: 0,
    isRunning: false
  })
  const [defaultSettings, setDefaultSettings] = useState<CompressionSettings>({
    mode: 'size',
    targetSizeKb: 50,
    format: 'jpeg'
  })
  
  // 下载进度管理
  const {
    downloadState,
    startDownload,
    updateProgress,
    completeDownload,
    resetDownload
  } = useDownloadProgress()
  
  // 初始化时加载历史记录并清理过期记录
  useEffect(() => {
    try {
      clearExpiredHistory() // 清理过期记录
      const history = getHistory()
      setHistoryItems(history)
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }, [])
  
  // 添加图片到批量列表
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
    setBatchProgress({ completed: 0, total: 0, isRunning: false })
  }, [images])
  
  // 更新图片列表
  const handleImagesUpdate = useCallback((updatedImages: ImageFile[]) => {
    setImages(updatedImages)
  }, [])
  
  // 开始批量压缩
  const handleStartBatch = useCallback(async () => {
    const pendingImages = images.filter(img => img.status === 'pending')
    if (pendingImages.length === 0) return

    setBatchProgress(prev => ({ ...prev, isRunning: true, total: pendingImages.length }))

    let completed = 0
    for (const image of pendingImages) {
      const settings = image.settings || defaultSettings

      // 更新状态为压缩中
      setImages(prev => prev.map(img =>
        img.id === image.id
          ? { ...img, status: 'compressing' as const, progress: 0 }
          : img
      ))

      try {
        // 使用智能压缩函数，自动选择上传方式
        const result = await compressImage(image.file, settings, (progress) => {
          // 更新单个图片的进度
          setImages(prev => prev.map(img =>
            img.id === image.id
              ? { ...img, progress: Math.round(progress) }
              : img
          ))
        })

        // 更新为完成状态
        setImages(prev => prev.map(img =>
          img.id === image.id ? {
            ...img,
            status: 'completed' as const,
            progress: 100,
            result: {
              ...result,
              url: result.compressed.url || result.compressed.path
            }
          } : img
        ))

        // 保存到历史记录
        try {
          saveToHistory(result, settings)
          const updatedHistory = getHistory()
          setHistoryItems(updatedHistory)
        } catch (error) {
          console.error('Failed to save to history:', error)
        }
      } catch (error) {
        // 更新为错误状态
        const errorMessage = error instanceof Error ? error.message : t('errors.unknownError')
        setImages(prev => prev.map(img =>
          img.id === image.id ? {
            ...img,
            status: 'error' as const,
            progress: 0,
            error: errorMessage
          } : img
        ))
      }

      completed++
      setBatchProgress(prev => ({ ...prev, completed }))
    }

    setBatchProgress(prev => ({ ...prev, isRunning: false }))
  }, [images, defaultSettings, t])
  
  // 暂停批量压缩
  const handlePauseBatch = useCallback(() => {
    setBatchProgress(prev => ({ ...prev, isRunning: false }))
  }, [])
  
  // 重置批量压缩
  const handleResetBatch = useCallback(() => {
    setImages(prev => prev.map(img => ({
      ...img,
      status: 'pending' as const,
      progress: 0,
      result: undefined,
      error: undefined
    })))
    setBatchProgress({ completed: 0, total: 0, isRunning: false })
  }, [])
  
  // 下载所有完成的图片（统一使用压缩包下载）
  const handleDownloadAll = useCallback(async () => {
    const completedImages = images.filter(img => img.status === 'completed' && img.result)
    
    const downloadableItems: DownloadableItem[] = completedImages
      .filter(img => img.result?.compressed?.url)
      .map(img => ({
        id: img.id,
        fileName: img.file.name,
        url: img.result!.compressed.url!,
        relativePath: img.relativePath
      }))
    
    if (downloadableItems.length === 0) {
      alert('没有可下载的文件')
      return
    }

    // 开始下载进度
    startDownload(downloadableItems.length)
    
    try {
      const success = await downloadAsZip(
        downloadableItems, 
        `compressed_batch_${Date.now()}.zip`,
        updateProgress
      )
      
      completeDownload(!!success, success ? undefined : '下载失败，请重试')
    } catch (error) {
      console.error('Download error:', error)
      completeDownload(false, '下载出错，请重试')
    }
  }, [images, startDownload, updateProgress, completeDownload])
  
  // 下载单个图片
  const handleDownloadSingle = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (image?.result?.compressed?.url) {
      const link = document.createElement('a')
      link.href = `/api/download?url=${encodeURIComponent(image.result.compressed.url)}`
      link.download = `compressed_${image.file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [images])
  
  // 预览图片
  const handlePreview = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (image?.result?.compressed?.url) {
      window.open(image.result.compressed.url, '_blank')
    }
  }, [images])

  // 重试单个失败的图片
  const handleRetrySingle = useCallback(async (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (!image || image.status !== 'error') return

    const settings = image.settings || defaultSettings

    // 重置图片状态
    setImages(prev => prev.map(img =>
      img.id === imageId
        ? { ...img, status: 'compressing' as const, progress: 0, error: undefined, result: undefined }
        : img
    ))

    try {
      // 使用智能压缩函数
      const result = await compressImage(image.file, settings, (progress) => {
        setImages(prev => prev.map(img =>
          img.id === imageId
            ? { ...img, progress: Math.round(progress) }
            : img
        ))
      })

      // 更新为完成状态
      setImages(prev => prev.map(img =>
        img.id === imageId ? {
          ...img,
          status: 'completed' as const,
          progress: 100,
          result: {
            ...result,
            url: result.compressed.url || result.compressed.path
          }
        } : img
      ))

      // 保存到历史记录
      try {
        saveToHistory(result, settings)
        const updatedHistory = getHistory()
        setHistoryItems(updatedHistory)
      } catch (error) {
        console.error('Failed to save to history:', error)
      }
    } catch (error) {
      // 更新为错误状态
      const errorMessage = error instanceof Error ? error.message : t('errors.unknownError')
      setImages(prev => prev.map(img =>
        img.id === imageId ? {
          ...img,
          status: 'error' as const,
          progress: 0,
          error: errorMessage
        } : img
      ))
    }
  }, [images, defaultSettings, t])

  // 批量重试所有失败的图片
  const handleRetryAllFailed = useCallback(async () => {
    const failedImages = images.filter(img => img.status === 'error')
    if (failedImages.length === 0) return

    // 重置所有失败图片的状态
    setImages(prev => prev.map(img =>
      img.status === 'error'
        ? { ...img, status: 'pending' as const, progress: 0, error: undefined, result: undefined }
        : img
    ))

    // 更新批量进度状态
    setBatchProgress(prev => ({
      ...prev,
      isRunning: true,
      completed: Math.max(0, prev.completed - failedImages.length),
      total: prev.total
    }))

    for (const image of failedImages) {
      const settings = image.settings || defaultSettings

      // 更新状态为压缩中
      setImages(prev => prev.map(img =>
        img.id === image.id
          ? { ...img, status: 'compressing' as const, progress: 0 }
          : img
      ))

      try {
        // 使用智能压缩函数
        const result = await compressImage(image.file, settings, (progress) => {
          setImages(prev => prev.map(img =>
            img.id === image.id
              ? { ...img, progress: Math.round(progress) }
              : img
          ))
        })

        // 更新为完成状态
        setImages(prev => prev.map(img =>
          img.id === image.id ? {
            ...img,
            status: 'completed' as const,
            progress: 100,
            result: {
              ...result,
              url: result.compressed.url || result.compressed.path
            }
          } : img
        ))

        // 保存到历史记录
        try {
          saveToHistory(result, settings)
          const updatedHistory = getHistory()
          setHistoryItems(updatedHistory)
        } catch (error) {
          console.error('Failed to save to history:', error)
        }
      } catch (error) {
        // 更新为错误状态
        const errorMessage = error instanceof Error ? error.message : t('errors.unknownError')
        setImages(prev => prev.map(img =>
          img.id === image.id ? {
            ...img,
            status: 'error' as const,
            progress: 0,
            error: errorMessage
          } : img
        ))
      }

      // 更新批量进度
      setBatchProgress(prev => ({ ...prev, completed: prev.completed + 1 }))
    }

    setBatchProgress(prev => ({ ...prev, isRunning: false }))
  }, [images, defaultSettings, t])

  // 回到上传界面
  const handleBackToUpload = useCallback(() => {
    setCurrentView('upload')
  }, [])

  // 查看压缩结果
  const handleViewResults = useCallback(() => {
    setCurrentView('comparison')
  }, [])

  // 从历史记录刷新数据
  const handleRefreshHistory = useCallback(() => {
    try {
      const history = getHistory()
      setHistoryItems(history)
    } catch (error) {
      console.error('Failed to refresh history:', error)
    }
  }, [])

  return (
    <>
      {currentView === 'history' ? (
        <HistoryView
          historyItems={historyItems}
          onBack={handleBackToUpload}
          onRefresh={handleRefreshHistory}
        />
      ) : currentView === 'comparison' ? (
        // 批量对比视图
        <BatchComparisonView
          images={images}
          onBack={handleBackToUpload}
          onDownloadAll={handleDownloadAll}
          onDownloadSingle={handleDownloadSingle}
          onReset={handleImagesClear}
        />
      ) : (
        // 上传和压缩界面
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：图片上传 */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('upload.batchTitle')}
              </h2>
              <BatchImageUpload
                images={images}
                onImagesAdd={handleImagesAdd}
                onImageRemove={handleImageRemove}
                onImagesClear={handleImagesClear}
                maxFiles={10}
                disabled={batchProgress.isRunning}
              />
            </div>
            
            {/* 进度显示 */}
            {images.length > 0 && (
              <BatchProgressDisplay
                images={images}
                batchProgress={batchProgress}
                onDownloadAll={handleDownloadAll}
                onDownloadSingle={handleDownloadSingle}
                onPreview={handlePreview}
                onRetrySingle={handleRetrySingle}
                onRetryAllFailed={handleRetryAllFailed}
              />
            )}

            {/* 查看结果按钮 */}
            {images.some(img => img.status === 'completed') && (
              <div className="text-center">
                <button
                  onClick={handleViewResults}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {t('comparison.viewResults')}
                </button>
              </div>
            )}
          </div>

          {/* 右侧：压缩控制 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('compression.title')}
              </h2>
              <BatchCompressionControls
                images={images}
                onImagesUpdate={handleImagesUpdate}
                onStartBatch={handleStartBatch}
                onPauseBatch={handlePauseBatch}
                onResetBatch={handleResetBatch}
                batchProgress={batchProgress}
                defaultSettings={defaultSettings}
                onDefaultSettingsChange={setDefaultSettings}
                disabled={batchProgress.isRunning}
              />
            </div>

            {images.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center">
                  {t('compression.batchEnableMessage')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features - 只在上传页面且没有图片时显示 */}
      {/* {currentView === 'upload' && images.length === 0 && (
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
      )} */}
      
      {/* 下载进度弹窗 */}
      <DownloadProgressModal
        isOpen={downloadState.isDownloading || downloadState.error !== undefined}
        current={downloadState.current}
        total={downloadState.total}
        currentFile={downloadState.currentFile}
        isDownloading={downloadState.isDownloading}
        error={downloadState.error}
        onClose={resetDownload}
      />
    </>
  )
}

// 导出组件实例的历史记录getter，供父组件获取历史记录
ImageCompressionPage.displayName = 'ImageCompressionPage'

export default ImageCompressionPage