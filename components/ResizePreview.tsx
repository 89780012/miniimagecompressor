'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Eye, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { ImageFile } from '@/types/image'

interface ResizePreviewProps {
  images: ImageFile[]
  onBack: () => void
  onDownloadSingle: (imageId: string) => void
  onReset: () => void
}

export function ResizePreview({
  images,
  onBack,
  onDownloadSingle,
  onReset
}: ResizePreviewProps) {
  const t = useTranslations()
  const completedImages = images.filter(img => img.status === 'completed' && img.result)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const calculateSizeChange = (original: number, resized: number) => {
    const change = ((resized - original) / original * 100)
    return change.toFixed(1)
  }

  // 预览图片
  const handlePreview = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (image?.result?.compressed?.url) {
      window.open(image.result.compressed.url, '_blank')
    }
  }, [images])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('resize.preview.backToEdit')}
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('resize.preview.title')}</h2>
            <p className="text-sm text-gray-600">
              {t('resize.preview.completedCount', { count: completedImages.length })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={onReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('resize.preview.restart')}
          </Button>
        </div>
      </div>

      {/* 预览网格 */}
      {completedImages.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {completedImages.map((image) => (
            <Card key={image.id} className="p-6 space-y-4">
              {/* 文件名 */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {image.file.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handlePreview(image.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('common.preview')}
                  </Button>
                  <Button
                    onClick={() => onDownloadSingle(image.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {t('common.download')}
                  </Button>
                </div>
              </div>

              {/* 对比视图 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 原图 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">{t('resize.preview.original')}</h4>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                    <Image
                      src={image.preview}
                      alt={`${image.file.name} - ${t('resize.preview.original')}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{t('resize.preview.dimensions')}: {image.result?.stats?.originalDimensions}</div>
                    <div>{t('resize.preview.size')}: {formatFileSize(image.result?.stats?.originalSize || 0)}</div>
                  </div>
                </div>

                {/* 调整后 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">{t('resize.preview.resized')}</h4>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                    {image.result?.compressed?.url && (
                      <Image
                        src={image.result.compressed.url}
                        alt={`${image.file.name} - ${t('resize.preview.resized')}`}
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{t('resize.preview.dimensions')}: {image.result?.stats?.compressedDimensions}</div>
                    <div>{t('resize.preview.size')}: {formatFileSize(image.result?.stats?.compressedSize || 0)}</div>
                  </div>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">{t('resize.preview.stats')}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">{t('resize.preview.originalDimensions')}</div>
                    <div className="font-medium">
                      {image.result?.stats?.originalDimensions}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">{t('resize.preview.resizedDimensions')}</div>
                    <div className="font-medium">
                      {image.result?.stats?.compressedDimensions}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">{t('resize.preview.fileSizeChange')}</div>
                    <div className={`font-medium ${
                      parseFloat(calculateSizeChange(
                        image.result?.stats?.originalSize || 0,
                        image.result?.stats?.compressedSize || 0
                      )) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {parseFloat(calculateSizeChange(
                        image.result?.stats?.originalSize || 0,
                        image.result?.stats?.compressedSize || 0
                      )) > 0 ? '+' : ''}
                      {calculateSizeChange(
                        image.result?.stats?.originalSize || 0,
                        image.result?.stats?.compressedSize || 0
                      )}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">{t('resize.preview.resizeSettings')}</div>
                    <div className="font-medium text-xs">
                      {image.resizeSettings?.maintainAspectRatio 
                        ? t('resize.preview.maintainAspectRatio') 
                        : t('resize.preview.freeAdjustment')
                      } / 
                      {image.resizeSettings?.resizeMode === 'fit' 
                        ? t('resize.controls.fit') 
                        : image.resizeSettings?.resizeMode === 'fill' 
                          ? t('resize.controls.fill') 
                          : t('resize.controls.cover')
                      }
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">{t('resize.preview.noCompletedImages')}</div>
          <p className="text-gray-600">
            {t('resize.preview.backToEditHint')}
          </p>
        </div>
      )}

      {/* 全局统计 */}
      {completedImages.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('resize.preview.overallStats')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">{t('resize.preview.processedCount')}</div>
              <div className="text-2xl font-bold text-blue-600">{completedImages.length}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">{t('resize.preview.originalTotalSize')}</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatFileSize(
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.originalSize || 0), 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">{t('resize.preview.resizedTotalSize')}</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatFileSize(
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.compressedSize || 0), 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">{t('resize.preview.overallSizeChange')}</div>
              <div className={`text-2xl font-bold ${
                parseFloat(calculateSizeChange(
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.originalSize || 0), 0),
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.compressedSize || 0), 0)
                )) > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {parseFloat(calculateSizeChange(
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.originalSize || 0), 0),
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.compressedSize || 0), 0)
                )) > 0 ? '+' : ''}
                {calculateSizeChange(
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.originalSize || 0), 0),
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.compressedSize || 0), 0)
                )}%
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}