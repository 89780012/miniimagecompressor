'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageFile {
  file: File
  preview: string
  size: number
  dimensions?: { width: number; height: number }
}

interface ImageUploadProps {
  onImageSelect: (imageFile: ImageFile) => void
  selectedImage?: ImageFile | null
}

export function ImageUpload({ onImageSelect, selectedImage }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setIsLoading(true)

    try {
      // 创建预览 URL
      const preview = URL.createObjectURL(file)
      
      // 获取图片尺寸
      const dimensions = await getImageDimensions(file)
      
      const imageFile: ImageFile = {
        file,
        preview,
        size: file.size,
        dimensions
      }
      
      onImageSelect(imageFile)
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onImageSelect])

  // 获取图片尺寸
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp', '.gif']
    },
    maxFiles: 1,
    disabled: isLoading
  })

  const removeImage = () => {
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview)
    }
    onImageSelect(null as any)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (selectedImage) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">已选择的图片</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={removeImage}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              移除
            </Button>
          </div>
          
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={selectedImage.preview}
              alt="预览图片"
              fill
              className="object-contain"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">文件名:</span> {selectedImage.file.name}
            </div>
            <div>
              <span className="font-medium">大小:</span> {formatFileSize(selectedImage.size)}
            </div>
            {selectedImage.dimensions && (
              <>
                <div>
                  <span className="font-medium">宽度:</span> {selectedImage.dimensions.width}px
                </div>
                <div>
                  <span className="font-medium">高度:</span> {selectedImage.dimensions.height}px
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            {isLoading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            ) : isDragActive ? (
              <Upload className="w-full h-full" />
            ) : (
              <ImageIcon className="w-full h-full" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isLoading ? '正在处理图片...' : 
               isDragActive ? '释放以上传图片' : '拖拽图片到这里'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              或 <span className="text-blue-600 font-medium">点击选择文件</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              支持 JPEG, PNG, WebP, BMP, GIF 格式
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}