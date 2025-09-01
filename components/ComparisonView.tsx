'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Download, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { CompressionResult, formatFileSize, calculateSavings } from '@/lib/compression'

interface ComparisonViewProps {
  result: CompressionResult
  onReset: () => void
}

export function ComparisonView({ result, onReset }: ComparisonViewProps) {
  const t = useTranslations()
  const savings = calculateSavings(result.original.fileSize, result.compressed.fileSize)

  const downloadImage = async (path: string, filename: string) => {
    try {
      const response = await fetch(path)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 统计信息卡片 */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {savings.savedPercentage}%
            </p>
            <p className="text-sm text-gray-600">压缩率</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {formatFileSize(savings.savedBytes)}
            </p>
            <p className="text-sm text-gray-600">节省空间</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {result.processingTime}ms
            </p>
            <p className="text-sm text-gray-600">处理时间</p>
          </div>
          
          <div className="text-center flex justify-center">
            <Button 
              onClick={onReset} 
              variant="outline" 
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重新压缩
            </Button>
          </div>
        </div>
      </Card>

      {/* 图片对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 原始图片 */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">原始图片</h3>
              <Badge variant="secondary">原图</Badge>
            </div>
          </div>
          
          <div className="aspect-video relative bg-gray-100">
            <Image
              src={result.original.url || result.original.path || ''}
              alt="原始图片"
              fill
              className="object-contain"
            />
          </div>
          
          <div className="p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">文件名:</span>
                <p className="truncate">{result.original.fileName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">文件大小:</span>
                <p>{formatFileSize(result.original.fileSize)}</p>
              </div>
              {result.original.width && result.original.height && (
                <>
                  <div>
                    <span className="font-medium text-gray-600">宽度:</span>
                    <p>{result.original.width}px</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">高度:</span>
                    <p>{result.original.height}px</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* 压缩后图片 */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-green-50 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">压缩后图片</h3>
              <Badge variant="default" className="bg-green-600">
                压缩后
              </Badge>
            </div>
          </div>
          
          <div className="aspect-video relative bg-gray-100">
            <Image
              src={result.compressed.url || result.compressed.path || ''}
              alt="压缩后图片"
              fill
              className="object-contain"
            />
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">文件大小:</span>
                <p className="font-semibold text-green-600">
                  {formatFileSize(result.compressed.fileSize)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">压缩比:</span>
                <p className="font-semibold text-green-600">
                  {result.compressionRatio}%
                </p>
              </div>
              {result.compressed.width && result.compressed.height && (
                <>
                  <div>
                    <span className="font-medium text-gray-600">宽度:</span>
                    <p>{result.compressed.width}px</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">高度:</span>
                    <p>{result.compressed.height}px</p>
                  </div>
                </>
              )}
            </div>
            
            <Separator />
            
            <Button 
              onClick={() => downloadImage(result.compressed.url || result.compressed.path || '', `compressed_${result.original.fileName}`)}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              下载压缩后图片
            </Button>
          </div>
        </Card>
      </div>

      {/* 详细对比信息 */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">详细对比</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">原始大小</span>
            <span>{formatFileSize(result.original.fileSize)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">压缩后大小</span>
            <span className="text-green-600">{formatFileSize(result.compressed.fileSize)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">节省大小</span>
            <span className="text-green-600 font-semibold">
              {formatFileSize(savings.savedBytes)} ({savings.savedPercentage}%)
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-medium">处理时间</span>
            <span>{result.processingTime}ms</span>
          </div>
        </div>
      </Card>
    </div>
  )
}