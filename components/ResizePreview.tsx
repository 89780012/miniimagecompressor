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
            返回编辑
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">调整结果预览</h2>
            <p className="text-sm text-gray-600">
              共 {completedImages.length} 张图片调整完成
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={onReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            重新开始
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
                    预览
                  </Button>
                  <Button
                    onClick={() => onDownloadSingle(image.id)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    下载
                  </Button>
                </div>
              </div>

              {/* 对比视图 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 原图 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">原图</h4>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                    <Image
                      src={image.preview}
                      alt={`${image.file.name} - 原图`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>尺寸: {image.result?.stats?.originalDimensions}</div>
                    <div>大小: {formatFileSize(image.result?.stats?.originalSize || 0)}</div>
                  </div>
                </div>

                {/* 调整后 */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">调整后</h4>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                    {image.result?.compressed?.url && (
                      <Image
                        src={image.result.compressed.url}
                        alt={`${image.file.name} - 调整后`}
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>尺寸: {image.result?.stats?.compressedDimensions}</div>
                    <div>大小: {formatFileSize(image.result?.stats?.compressedSize || 0)}</div>
                  </div>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">调整统计</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">原始尺寸</div>
                    <div className="font-medium">
                      {image.result?.stats?.originalDimensions}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">调整后尺寸</div>
                    <div className="font-medium">
                      {image.result?.stats?.compressedDimensions}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">文件大小变化</div>
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
                    <div className="text-gray-500">调整设置</div>
                    <div className="font-medium text-xs">
                      {image.resizeSettings?.maintainAspectRatio ? '保持宽高比' : '自由调整'} / 
                      {image.resizeSettings?.resizeMode === 'fit' ? '适应' : 
                       image.resizeSettings?.resizeMode === 'fill' ? '填充' : '覆盖'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">没有已完成的图片</div>
          <p className="text-gray-600">
            请返回编辑页面上传并调整图片尺寸
          </p>
        </div>
      )}

      {/* 全局统计 */}
      {completedImages.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">总体统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">处理图片数</div>
              <div className="text-2xl font-bold text-blue-600">{completedImages.length}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">原始总大小</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatFileSize(
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.originalSize || 0), 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">调整后总大小</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatFileSize(
                  completedImages.reduce((sum, img) => sum + (img.result?.stats?.compressedSize || 0), 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">总体大小变化</div>
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