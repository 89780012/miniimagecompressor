'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Settings } from 'lucide-react'
import Image from 'next/image'

interface ImageFile {
  id: string
  file: File
  preview: string
  size: number
  dimensions?: { width: number; height: number }
  progress: number
  status: 'pending' | 'compressing' | 'completed' | 'error'
}

interface BatchImageUploadProps {
  images: ImageFile[]
  onImagesAdd: (images: ImageFile[]) => void
  onImageRemove: (id: string) => void
  onImagesClear: () => void
  maxFiles?: number
  disabled?: boolean
}

export function BatchImageUpload({
  images,
  onImagesAdd,
  onImageRemove,
  onImagesClear,
  maxFiles = 10,
  disabled = false
}: BatchImageUploadProps) {
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
        reject(new Error('Failed to load image'))
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || disabled) return
    
    const remainingSlots = maxFiles - images.length
    const filesToProcess = acceptedFiles.slice(0, remainingSlots)
    
    if (filesToProcess.length === 0) return

    setIsLoading(true)

    try {
      // 确保在浏览器环境中
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }
      
      const newImages: ImageFile[] = await Promise.all(
        filesToProcess.map(async (file) => {
          const preview = URL.createObjectURL(file)
          let dimensions: { width: number; height: number } | undefined
          
          try {
            dimensions = await getImageDimensions(file)
          } catch (error) {
            console.error('Error getting image dimensions:', error)
          }
          
          return {
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview,
            size: file.size,
            dimensions,
            progress: 0,
            status: 'pending' as const
          }
        })
      )
      
      onImagesAdd(newImages)
    } catch (error) {
      console.error('Error processing images:', error)
    } finally {
      setIsLoading(false)
    }
  }, [images.length, maxFiles, onImagesAdd, disabled])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp', '.gif']
    },
    maxFiles: maxFiles - images.length,
    disabled: disabled || isLoading || images.length >= maxFiles
  })

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id)
    if (imageToRemove?.preview && typeof window !== 'undefined') {
      URL.revokeObjectURL(imageToRemove.preview)
    }
    onImageRemove(id)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: ImageFile['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500'
      case 'compressing': return 'text-blue-500'
      case 'completed': return 'text-green-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = (status: ImageFile['status']) => {
    switch (status) {
      case 'pending': return t('upload.status.pending')
      case 'compressing': return t('upload.status.compressing')
      case 'completed': return t('upload.status.completed')
      case 'error': return t('upload.status.error')
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* 上传区域 */}
      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled || images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? t('upload.dropHere') : t('upload.clickOrDrag')}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {t('upload.supportFormats')}
          </p>
          <p className="text-xs text-gray-400">
            {t('upload.maxFiles', { current: images.length, max: maxFiles })}
          </p>
          {isLoading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          )}
        </div>
      </Card>

      {/* 图片列表 */}
      {images.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {t('upload.selectedImages', { count: images.length })}
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onImagesClear}
              disabled={disabled}
            >
              {t('upload.clearAll')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="border rounded-lg p-3 space-y-3">
                  {/* 图片预览 */}
                  <div className="relative aspect-video bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={image.preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(image.id)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* 图片信息 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium truncate">{image.file.name}</span>
                      <Settings className="h-3 w-3 text-gray-400" />
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>{formatFileSize(image.size)}</div>
                      {image.dimensions && (
                        <div>{image.dimensions.width} × {image.dimensions.height}</div>
                      )}
                      <div className={getStatusColor(image.status)}>
                        {getStatusText(image.status)}
                      </div>
                    </div>
                    
                    {/* 进度条 */}
                    {image.status === 'compressing' && (
                      <Progress value={image.progress} className="h-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}