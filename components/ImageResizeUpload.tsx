'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { X, Upload, FileImage, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { ImageFile } from '@/types/image'

interface ImageResizeUploadProps {
  images: ImageFile[]
  onImagesAdd: (images: ImageFile[]) => void
  onImageRemove: (id: string) => void
  onImagesClear: () => void
  maxFiles?: number
  disabled?: boolean
}

export function ImageResizeUpload({
  images,
  onImagesAdd,
  onImageRemove,
  onImagesClear,
  maxFiles = 10,
  disabled = false
}: ImageResizeUploadProps) {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(false)

  // 获取图片尺寸
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      // 确保在浏览器环境中
      if (typeof window === 'undefined') {
        resolve({ width: 0, height: 0 })
        return
      }
      
      const img = new window.Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => {
        reject(new Error('无法读取图片尺寸'))
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  // 处理文件上传
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    setIsLoading(true)

    // 过滤文件
    const validFiles = acceptedFiles.filter(file => {
      // 支持的图片格式（不包含SVG，因为SVG处理比较特殊）
      const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
      return supportedTypes.includes(file.type)
    })

    if (validFiles.length !== acceptedFiles.length) {
      alert(`部分文件格式不支持。仅支持 JPEG, PNG, WebP, GIF, BMP 格式`)
    }

    // 检查数量限制
    const totalFiles = images.length + validFiles.length
    if (totalFiles > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 个文件`)
      setIsLoading(false)
      return
    }

    try {
      // 处理每个文件
      const imageFiles: ImageFile[] = []
      
      for (const file of validFiles) {
        try {
          const dimensions = await getImageDimensions(file)
          
          const imageFile: ImageFile = {
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: URL.createObjectURL(file),
            size: file.size,
            dimensions,
            progress: 0,
            status: 'pending'
          }
          
          imageFiles.push(imageFile)
        } catch (error) {
          console.error(`处理文件 ${file.name} 时出错:`, error)
        }
      }

      onImagesAdd(imageFiles)
    } catch (error) {
      console.error('文件处理失败:', error)
      alert('文件处理失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [disabled, images.length, maxFiles, onImagesAdd])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp']
    },
    multiple: true,
    disabled
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: ImageFile['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500'
      case 'compressing':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: ImageFile['status']) => {
    switch (status) {
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          {isDragActive ? (
            <p className="text-sm text-blue-600">{t('resize.dropHere')}</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600">{t('resize.clickOrDrag')}</p>
              <p className="text-xs text-gray-500 mt-1">
                支持 JPEG, PNG, WebP, GIF, BMP 格式
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 文件统计 */}
      {images.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {t('resize.selectedImages', { count: images.length })} 
            {maxFiles && ` (${images.length}/${maxFiles})`}
          </span>
          {images.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onImagesClear}
              className="text-red-600 hover:text-red-700"
              disabled={disabled}
            >
              清空全部
            </Button>
          )}
        </div>
      )}

      {/* 图片列表 */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="p-4">
              <div className="flex items-start space-x-4">
                {/* 图片预览 */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    {image.preview ? (
                      <Image
                        src={image.preview}
                        alt={image.file.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileImage className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(image.size)}</span>
                        {image.dimensions && (
                          <span>{image.dimensions.width} × {image.dimensions.height}</span>
                        )}
                      </div>
                      
                      {/* 状态显示 */}
                      <div className={`flex items-center space-x-1 text-xs mt-1 ${getStatusColor(image.status)}`}>
                        {getStatusIcon(image.status)}
                        <span>{t(`resize.status.${image.status}`)}</span>
                      </div>
                      
                      {/* 进度条 */}
                      {image.status === 'compressing' && (
                        <Progress value={image.progress} className="mt-2" />
                      )}
                      
                      {/* 错误信息 */}
                      {image.error && (
                        <p className="text-xs text-red-600 mt-1">{image.error}</p>
                      )}
                    </div>

                    {/* 删除按钮 */}
                    {!disabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onImageRemove(image.id)}
                        className="text-gray-400 hover:text-red-600 h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">正在处理图片...</span>
          </div>
        </div>
      )}
    </div>
  )
}