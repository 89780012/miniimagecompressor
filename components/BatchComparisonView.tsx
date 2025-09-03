'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Grid3X3, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import { CompressionResult, formatFileSize, calculateSavings } from '@/lib/compression'
import { downloadAsZip, DownloadableItem } from '@/lib/batch-download'
import { useDownloadProgress } from '@/hooks/useDownloadProgress'
import { DownloadProgressModal } from '@/components/DownloadProgressModal'

interface ImageFile {
  id: string
  file: File
  preview: string
  size: number
  dimensions?: { width: number; height: number }
  progress: number
  status: 'pending' | 'compressing' | 'completed' | 'error'
  result?: CompressionResult & { url?: string }
  error?: string
  relativePath?: string // 添加相对路径字段
}

interface BatchComparisonViewProps {
  images: ImageFile[]
  onBack: () => void
  onDownloadAll?: () => void // 改为可选，保持向后兼容
  onDownloadSingle: (imageId: string) => void
  onReset: () => void
}

type ViewMode = 'grid' | 'single'

export function BatchComparisonView({
  images,
  onBack,
  onDownloadAll,
  onDownloadSingle,
  onReset
}: BatchComparisonViewProps) {
  const t = useTranslations()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})

  // 下载进度管理
  const {
    downloadState,
    startDownload,
    updateProgress,
    completeDownload,
    resetDownload
  } = useDownloadProgress()

  const completedImages = images.filter(img => img.status === 'completed' && img.result)
  
  // 计算总体统计
  const totalOriginalSize = images.reduce((sum, img) => sum + img.size, 0)
  const totalCompressedSize = completedImages.reduce((sum, img) => 
    sum + (img.result?.compressed.fileSize || 0), 0
  )
  const totalSavings = calculateSavings(totalOriginalSize, totalCompressedSize)

  // 使用新的批量下载逻辑
  const handleBatchDownload = async () => {
    if (onDownloadAll) {
      // 如果提供了自定义下载函数，使用它
      onDownloadAll()
      return
    }
    
    // 否则使用新的压缩包下载逻辑
    const downloadableItems: DownloadableItem[] = completedImages
      .filter(img => img.result?.compressed?.url)
      .map(img => ({
        id: img.id,
        fileName: img.file.name,
        url: img.result!.compressed.url!,
        relativePath: img.relativePath
      }))
    
    if (downloadableItems.length === 0) {
      alert(t('errors.noDownloadableFiles'))
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
  }

  // 切换显示原图还是压缩图
  const toggleImageView = (imageId: string) => {
    setShowOriginal(prev => ({
      ...prev,
      [imageId]: !prev[imageId]
    }))
  }

  if (completedImages.length === 0) {
    return null
  }

  return (
    <>
    <div className="space-y-6">
      {/* 头部控制栏 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('comparison.backToUpload')}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('single')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleBatchDownload}
              disabled={downloadState.isDownloading}
              className="flex items-center gap-2"
            >
              {downloadState.isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloadState.isDownloading ? t('downloadProgress.downloading') : t('comparison.downloadAll')}
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t('comparison.startOver')}
            </Button>
          </div>
        </div>
      </Card>

      {/* 总体统计 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('comparison.overallStats')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {totalSavings.savedPercentage}%
            </p>
            <p className="text-sm text-gray-600">{t('comparison.compressionRatio')}</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {formatFileSize(totalSavings.savedBytes)}
            </p>
            <p className="text-sm text-gray-600">{t('comparison.spaceSaved')}</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {completedImages.length}
            </p>
            <p className="text-sm text-gray-600">{t('comparison.imagesProcessed')}</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {formatFileSize(totalOriginalSize)} → {formatFileSize(totalCompressedSize)}
            </p>
            <p className="text-sm text-gray-600">{t('comparison.totalSize')}</p>
          </div>
        </div>
      </Card>

      {/* 图片对比视图 */}
      {viewMode === 'grid' ? (
        // 网格视图
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedImages.map((image, index) => {
            if (!image.result) return null
            
            const savings = calculateSavings(image.size, image.result.compressed.fileSize || 0)
            const isShowingOriginal = showOriginal[image.id]
            
            return (
              <Card key={image.id} className="p-4">
                <div className="space-y-4">
                  {/* 图片预览 */}
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={isShowingOriginal ? image.preview : (image.result.compressed.url || image.result.compressed.path || '')}
                      alt={image.file.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* 切换按钮 */}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                      onClick={() => toggleImageView(image.id)}
                    >
                      {isShowingOriginal ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    
                    {/* 状态标签 */}
                    <Badge 
                      className="absolute top-2 left-2" 
                      variant={isShowingOriginal ? 'secondary' : 'default'}
                    >
                      {isShowingOriginal ? t('comparison.original') : t('comparison.compressed')}
                    </Badge>
                  </div>

                  {/* 图片信息 */}
                  <div className="space-y-2">
                    <h4 className="font-medium truncate" title={image.file.name}>
                      {image.file.name}
                    </h4>
                    
                    {/* 压缩统计 */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">{t('comparison.original')}</p>
                        <p className="font-medium">{formatFileSize(image.size)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">{t('comparison.compressed')}</p>
                        <p className="font-medium text-green-600">
                          {formatFileSize(image.result.compressed.fileSize || 0)}
                        </p>
                      </div>
                    </div>
                    
                    {/* 压缩率 */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{t('comparison.saved')}</span>
                      <Badge variant="outline" className="text-xs">
                        -{savings.savedPercentage}%
                      </Badge>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadSingle(image.id)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {t('common.download')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCurrentImageIndex(index)
                          setViewMode('single')
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        // 单图详细视图
        (() => {
          const currentImage = completedImages[currentImageIndex]
          if (!currentImage?.result) return null

          const savings = calculateSavings(currentImage.size, currentImage.result.compressed.fileSize || 0)
          const isShowingOriginal = showOriginal[currentImage.id]

          return (
            <div className="space-y-6">
              {/* 导航 */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-gray-500">
                  {currentImageIndex + 1} / {completedImages.length}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentImageIndex(Math.min(completedImages.length - 1, currentImageIndex + 1))}
                  disabled={currentImageIndex === completedImages.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* 详细对比 */}
              <Card className="p-6">
                <div className="space-y-6">
                  {/* 图片展示 */}
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={isShowingOriginal ? currentImage.preview : (currentImage.result.compressed.url || currentImage.result.compressed.path || '')}
                      alt={currentImage.file.name}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        onClick={() => toggleImageView(currentImage.id)}
                        className="bg-white/90 hover:bg-white"
                      >
                        {isShowingOriginal ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            {t('comparison.showCompressed')}
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('comparison.showOriginal')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 详细信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">{t('comparison.original')}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('comparison.fileSize')}</span>
                          <span>{formatFileSize(currentImage.size)}</span>
                        </div>
                        {currentImage.dimensions && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('comparison.dimensions')}</span>
                            <span>{currentImage.dimensions.width} × {currentImage.dimensions.height}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">{t('comparison.compressed')}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('comparison.fileSize')}</span>
                          <span className="text-green-600">{formatFileSize(currentImage.result.compressed.fileSize || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('comparison.dimensions')}</span>
                          <span>{currentImage.result.compressed.width} × {currentImage.result.compressed.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('comparison.compressionRatio')}</span>
                          <span className="text-green-600">-{savings.savedPercentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('comparison.spaceSaved')}</span>
                          <span className="text-green-600">{formatFileSize(savings.savedBytes)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => onDownloadSingle(currentImage.id)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {t('comparison.downloadCompressed')}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )
        })()
      )}
    </div>
    
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