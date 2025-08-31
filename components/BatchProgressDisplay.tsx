'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Download, Eye } from 'lucide-react'
import { useState } from 'react'
import { CompressionResult } from '@/lib/compression'

interface ImageFile {
  id: string
  file: File
  preview: string
  size: number
  dimensions?: { width: number; height: number }
  progress: number
  status: 'pending' | 'compressing' | 'completed' | 'error'
  result?: CompressionResult
  error?: string
}

interface BatchProgress {
  completed: number
  total: number
  isRunning: boolean
}

interface BatchProgressDisplayProps {
  images: ImageFile[]
  batchProgress: BatchProgress
  onDownloadAll: () => void
  onDownloadSingle: (imageId: string) => void
  onPreview: (imageId: string) => void
}

export function BatchProgressDisplay({
  images,
  batchProgress,
  onDownloadAll,
  onDownloadSingle,
  onPreview
}: BatchProgressDisplayProps) {
  const t = useTranslations()
  const [showDetails, setShowDetails] = useState(false)

  const completedImages = images.filter(img => img.status === 'completed')
  const errorImages = images.filter(img => img.status === 'error')
  const processingImages = images.filter(img => img.status === 'compressing')
  
  const overallProgress = images.length > 0 
    ? ((completedImages.length + errorImages.length) / images.length) * 100 
    : 0

  const totalOriginalSize = images.reduce((sum, img) => sum + img.size, 0)
  const totalCompressedSize = completedImages.reduce((sum, img) => 
    sum + (img.result?.compressed.fileSize || 0), 0
  )
  const totalSavings = totalOriginalSize - totalCompressedSize
  const savingsPercent = totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (images.length === 0) {
    return null
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('progress.batchProgress')}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? t('progress.hideDetails') : t('progress.showDetails')}
          </Button>
        </div>

        {/* 总体进度 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('progress.overall')}</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {completedImages.length + errorImages.length} / {images.length} {t('progress.imagesProcessed')}
            </span>
            <span>
              {batchProgress.isRunning ? t('progress.running') : t('progress.paused')}
            </span>
          </div>
        </div>

        {/* 统计信息 */}
        {completedImages.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {completedImages.length}
                </div>
                <div className="text-xs text-green-500">{t('progress.completed')}</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {formatFileSize(totalSavings)}
                </div>
                <div className="text-xs text-green-500">{t('progress.saved')}</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {savingsPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-green-500">{t('progress.reduction')}</div>
              </div>
              <div>
                <Button
                  size="sm"
                  onClick={onDownloadAll}
                  disabled={completedImages.length === 0}
                  className="w-full"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {t('progress.downloadAll')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {errorImages.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">
                {t('progress.errorsOccurred', { count: errorImages.length })}
              </span>
            </div>
            {showDetails && (
              <div className="space-y-1">
                {errorImages.map(img => (
                  <div key={img.id} className="text-xs text-red-500">
                    {img.file.name}: {img.error || t('progress.unknownError')}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 详细进度列表 */}
        {showDetails && (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {images.map(image => (
              <div key={image.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {image.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {image.status === 'error' && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {image.status === 'compressing' && (
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {image.status === 'pending' && (
                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{image.file.name}</span>
                    <div className="flex items-center gap-1">
                      {image.status === 'completed' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPreview(image.id)}
                            className="h-6 px-2"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownloadSingle(image.id)}
                            className="h-6 px-2"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {image.status === 'compressing' && (
                      <Progress value={image.progress} className="h-1" />
                    )}
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatFileSize(image.size)}</span>
                      {image.result && (
                        <span className="text-green-600">
                          {formatFileSize(image.result.compressed.fileSize)} 
                          (-{(((image.size - image.result.compressed.fileSize) / image.size) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 当前处理的图片 */}
        {processingImages.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-600 mb-2">
              {t('progress.currentlyProcessing')}:
            </div>
            {processingImages.map(img => (
              <div key={img.id} className="text-xs text-blue-500">
                {img.file.name} ({img.progress}%)
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}