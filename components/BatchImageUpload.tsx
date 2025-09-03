'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Settings, Folder, FileImage, Download } from 'lucide-react'
import Image from 'next/image'
import JSZip from 'jszip'
import { DownloadProgressModal } from './DownloadProgressModal'
import { ImageFile } from '@/types/image'

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
  maxFiles = 30,
  disabled = false
}: BatchImageUploadProps) {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'files' | 'folder'>('files')
  
  // 下载进度状态
  const [downloadProgress, setDownloadProgress] = useState({
    isOpen: false,
    current: 0,
    total: 0,
    currentFile: '',
    isDownloading: false,
    error: ''
  })

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
        reject(new Error(t('errors.failedToLoadImage')))
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || disabled) return
    
    // 检查文件是否为图片
    const isImageFile = (file: File): boolean => {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/gif']
      return imageTypes.includes(file.type)
    }
    
    // 检查是否为文件夹上传（通过检查是否有 webkitRelativePath）
    const isFolderUpload = acceptedFiles.some(file => 'webkitRelativePath' in file && (file as File & { webkitRelativePath: string }).webkitRelativePath)
    
    let filesToProcess: File[] = []
    
    if (isFolderUpload) {
      // 文件夹上传：过滤出图片文件
      filesToProcess = acceptedFiles.filter(isImageFile)
    } else {
      // 普通文件上传
      filesToProcess = acceptedFiles.filter(isImageFile)
    }
    
    const remainingSlots = maxFiles - images.length
    const finalFilesToProcess = filesToProcess.slice(0, remainingSlots)
    
    if (finalFilesToProcess.length === 0) return

    setIsLoading(true)

    try {
      // 确保在浏览器环境中
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }
      
      const newImages: ImageFile[] = await Promise.all(
        finalFilesToProcess.map(async (file) => {
          const preview = URL.createObjectURL(file)
          let dimensions: { width: number; height: number } | undefined
          
          try {
            dimensions = await getImageDimensions(file)
          } catch (error) {
            console.error('Error getting image dimensions:', error)
          }
          
          // 获取相对路径（如果是文件夹上传）
          const relativePath = 'webkitRelativePath' in file ? (file as File & { webkitRelativePath: string }).webkitRelativePath : undefined
          
          return {
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview,
            size: file.size,
            dimensions,
            progress: 0,
            status: 'pending' as const,
            relativePath
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

  // 处理文件夹选择
  const handleFolderSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || disabled) return
    
    const fileArray = Array.from(files)
    await onDrop(fileArray)
    
    // 清空 input 的值，允许重复选择同一个文件夹
    event.target.value = ''
  }, [onDrop, disabled])

  // 批量下载功能
  const handleBatchDownload = useCallback(async () => {
    try {
      const completedImages = images.filter(img => img.status === 'completed')
      
      if (completedImages.length === 0) {
        alert(t('errors.noCompressedImages'))
        return
      }
      
      // 初始化下载进度
      setDownloadProgress({
        isOpen: true,
        current: 0,
        total: completedImages.length,
        currentFile: '',
        isDownloading: true,
        error: ''
      })
      
      console.log('批量下载调试信息:')
      console.log('完成的图片数量:', completedImages.length)
      
      const zip = new JSZip()
      let successCount = 0
      
      // 下载所有压缩后的图片
      for (let i = 0; i < completedImages.length; i++) {
        const image = completedImages[i]
        
        // 更新当前下载的文件名
        setDownloadProgress(prev => ({
          ...prev,
          current: i,
          currentFile: image.file.name
        }))
        
        try {
          const compressedImageUrl = await getCompressedImageUrl(image)
          
          if (compressedImageUrl) {
            try {
              // 直接使用API代理下载，避免CORS问题
              const proxyUrl = `/api/download?url=${encodeURIComponent(compressedImageUrl)}`
              const proxyResponse = await fetch(proxyUrl)
              
              if (!proxyResponse.ok) {
                throw new Error(`${t('errors.proxyDownloadFailed')}: ${proxyResponse.status} ${proxyResponse.statusText}`)
              }
              
              const blob = await proxyResponse.blob()
              
              // 确定文件在压缩包中的路径
              const filePath = image.relativePath 
                ? image.relativePath.replace(/\\/g, '/') 
                : `compressed_${image.file.name}`
              
              zip.file(filePath, blob)
              successCount++
            } catch (proxyError) {
              console.error(`下载图片 ${image.file.name} 失败:`, proxyError)
            }
          } else {
            console.error(`图片 ${image.file.name} 没有找到压缩URL`)
          }
        } catch (error) {
          console.error(`下载图片失败: ${image.file.name}`, error)
        }
      }
      
      console.log(`成功添加到压缩包的图片数量: ${successCount}`)
      
      if (successCount === 0) {
        setDownloadProgress(prev => ({
          ...prev,
          isDownloading: false,
          error: t('errors.noCompressedImageUrls')
        }))
        return
      }
      
      // 更新进度为正在生成压缩包
      setDownloadProgress(prev => ({
        ...prev,
        current: completedImages.length,
        currentFile: t('downloadProgress.generating')
      }))
      
      // 生成并下载压缩包
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `compressed_images_${Date.now()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log(`压缩包下载完成，包含 ${successCount} 张图片`)
      
      // 下载完成
      setDownloadProgress(prev => ({
        ...prev,
        isDownloading: false,
        currentFile: t('downloadProgress.archiveGenerated', { count: successCount })
      }))
      
    } catch (error) {
      console.error('批量下载失败:', error)
      setDownloadProgress(prev => ({
        ...prev,
        isDownloading: false,
        error: t('errors.batchDownloadFailed')
      }))
    }
  }, [images])
  
  // 关闭下载进度弹窗
  const handleCloseDownloadProgress = useCallback(() => {
    setDownloadProgress(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])
  
  // 获取压缩后的图片URL
  const getCompressedImageUrl = async (image: ImageFile): Promise<string | null> => {
    // 方式1: 从 image.result.compressed.url 中获取URL（标准结构）
    if (image.result?.compressed?.url) {
      return image.result.compressed.url
    }
    
    return null
  }

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
      {/* 下载进度弹窗 */}
      <DownloadProgressModal
        isOpen={downloadProgress.isOpen}
        current={downloadProgress.current}
        total={downloadProgress.total}
        currentFile={downloadProgress.currentFile}
        isDownloading={downloadProgress.isDownloading}
        error={downloadProgress.error}
        onClose={handleCloseDownloadProgress}
      />
      
      {/* 上传区域 */}
      <Card className="p-6">
        {/* 上传模式选择 */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUploadMode('files')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                uploadMode === 'files' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileImage className="w-4 h-4" />
              {t('upload.selectFiles')}
            </button>
            <button
              onClick={() => setUploadMode('folder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                uploadMode === 'folder' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Folder className="w-4 h-4" />
              {t('upload.selectFolder')}
            </button>
          </div>
        </div>

        {uploadMode === 'files' ? (
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
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              id="folder-input"
              {...({ webkitdirectory: "true", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
              multiple
              onChange={handleFolderSelect}
              disabled={disabled || images.length >= maxFiles}
              className="hidden"
              accept="image/*"
            />
            <label
              htmlFor="folder-input"
              className={`cursor-pointer block ${
                disabled || images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {t('upload.clickToSelectFolder')}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {t('upload.folderScanDescription')}
              </p>
              <p className="text-xs text-gray-400">
                {t('upload.maxFiles', { current: images.length, max: maxFiles })}
              </p>
            </label>
            {isLoading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 图片列表 */}
      {images.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {t('upload.selectedImages', { count: images.length })}
            </h3>
            <div className="flex items-center gap-2">
              {images.some(img => img.status === 'completed') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBatchDownload}
                  disabled={disabled}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('upload.batchDownload')}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onImagesClear}
                disabled={disabled}
              >
                {t('upload.clearAll')}
              </Button>
            </div>
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
                      <span className="font-medium truncate" title={image.file.name}>
                        {image.file.name}
                      </span>
                      <Settings className="h-3 w-3 text-gray-400" />
                    </div>
                    
                    {/* 显示相对路径 */}
                    {image.relativePath && (
                      <div className="text-xs text-gray-400 truncate" title={image.relativePath}>
                        📁 {image.relativePath.split('/').slice(0, -1).join('/')}
                      </div>
                    )}
                    
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