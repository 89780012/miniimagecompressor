'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Check, X, RotateCcw, Move } from 'lucide-react'

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

// 拖拽类型
type DragType = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'resize-n' | 'resize-s' | 'resize-w' | 'resize-e' | null

interface ImageCropperProps {
  imageUrl: string
  imageName: string
  onCancel: () => void
}

export function ImageCropper({ imageUrl, imageName, onCancel }: ImageCropperProps) {
  const t = useTranslations()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 })
  const [dragType, setDragType] = useState<DragType>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropArea: { x: 0, y: 0, width: 0, height: 0 } })
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(null)
  const [imageScale, setImageScale] = useState(1)
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 })

  // 动态生成预设宽高比（支持多语言）
  const aspectRatios = [
    { label: t('resize.crop.aspectRatios.free'), value: null },
    { label: t('resize.crop.aspectRatios.square'), value: 1 },
    { label: t('resize.crop.aspectRatios.standard'), value: 4/3 },
    { label: t('resize.crop.aspectRatios.photo'), value: 3/2 },
    { label: t('resize.crop.aspectRatios.widescreen'), value: 16/9 },
    { label: t('resize.crop.aspectRatios.portrait'), value: 9/16 },
    { label: t('resize.crop.aspectRatios.vertical'), value: 3/4 },
    { label: t('resize.crop.aspectRatios.verticalPhoto'), value: 2/3 }
  ]
  
  // 画布尺寸
  const CANVAS_WIDTH = 500
  const CANVAS_HEIGHT = 400

  // 加载图片
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (imageRef.current) {
        imageRef.current = img
        
        // 计算图片缩放比例以适应画布
        const scaleX = CANVAS_WIDTH / img.width
        const scaleY = CANVAS_HEIGHT / img.height
        const scale = Math.min(scaleX, scaleY)
        
        setImageScale(scale)
        setImageOffset({
          x: (CANVAS_WIDTH - img.width * scale) / 2,
          y: (CANVAS_HEIGHT - img.height * scale) / 2
        })
        
        // 设置初始裁剪区域
        const initialSize = Math.min(200, img.width * scale * 0.5, img.height * scale * 0.5)
        setCropArea({
          x: (CANVAS_WIDTH - initialSize) / 2,
          y: (CANVAS_HEIGHT - initialSize) / 2,
          width: initialSize,
          height: initialSize
        })
        
        setIsLoaded(true)
      }
    }
    img.src = imageUrl
    imageRef.current = img
  }, [imageUrl])

  // 绘制画布
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const img = imageRef.current
    
    if (!canvas || !ctx || !img || !isLoaded) return

    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // 绘制图片
    ctx.drawImage(
      img,
      imageOffset.x,
      imageOffset.y,
      img.width * imageScale,
      img.height * imageScale
    )
    
    // 绘制遮罩层
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // 清除裁剪区域的遮罩
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
    
    // 重新绘制裁剪区域的图片
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(
      img,
      imageOffset.x,
      imageOffset.y,
      img.width * imageScale,
      img.height * imageScale
    )
    
    // 绘制裁剪框边界
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
    
    // 绘制裁剪框角点和边缘控制点
    ctx.setLineDash([])
    ctx.fillStyle = '#3b82f6'
    const handleSize = 8
    
    // 四个角点
    const cornerHandles = [
      { x: cropArea.x - handleSize/2, y: cropArea.y - handleSize/2 }, // 左上
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y - handleSize/2 }, // 右上
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 }, // 左下
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 } // 右下
    ]
    
    // 四条边的中点
    const edgeHandles = [
      { x: cropArea.x + cropArea.width/2 - handleSize/2, y: cropArea.y - handleSize/2 }, // 上边
      { x: cropArea.x + cropArea.width/2 - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 }, // 下边
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height/2 - handleSize/2 }, // 左边
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height/2 - handleSize/2 } // 右边
    ]
    
    // 绘制所有控制点
    const allHandles = [...cornerHandles, ...edgeHandles]
    allHandles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
    })
  }, [cropArea, isLoaded, imageScale, imageOffset])

  // 重绘画布
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // 检测拖拽类型
  const detectDragType = useCallback((x: number, y: number): DragType => {
    const handleSize = 8
    const tolerance = handleSize / 2
    
    // 检查四个角点
    if (x >= cropArea.x - tolerance && x <= cropArea.x + tolerance &&
        y >= cropArea.y - tolerance && y <= cropArea.y + tolerance) {
      return 'resize-nw' // 左上角
    }
    if (x >= cropArea.x + cropArea.width - tolerance && x <= cropArea.x + cropArea.width + tolerance &&
        y >= cropArea.y - tolerance && y <= cropArea.y + tolerance) {
      return 'resize-ne' // 右上角
    }
    if (x >= cropArea.x - tolerance && x <= cropArea.x + tolerance &&
        y >= cropArea.y + cropArea.height - tolerance && y <= cropArea.y + cropArea.height + tolerance) {
      return 'resize-sw' // 左下角
    }
    if (x >= cropArea.x + cropArea.width - tolerance && x <= cropArea.x + cropArea.width + tolerance &&
        y >= cropArea.y + cropArea.height - tolerance && y <= cropArea.y + cropArea.height + tolerance) {
      return 'resize-se' // 右下角
    }
    
    // 检查边缘
    if (x >= cropArea.x - tolerance && x <= cropArea.x + tolerance &&
        y >= cropArea.y + tolerance && y <= cropArea.y + cropArea.height - tolerance) {
      return 'resize-w' // 左边
    }
    if (x >= cropArea.x + cropArea.width - tolerance && x <= cropArea.x + cropArea.width + tolerance &&
        y >= cropArea.y + tolerance && y <= cropArea.y + cropArea.height - tolerance) {
      return 'resize-e' // 右边
    }
    if (y >= cropArea.y - tolerance && y <= cropArea.y + tolerance &&
        x >= cropArea.x + tolerance && x <= cropArea.x + cropArea.width - tolerance) {
      return 'resize-n' // 上边
    }
    if (y >= cropArea.y + cropArea.height - tolerance && y <= cropArea.y + cropArea.height + tolerance &&
        x >= cropArea.x + tolerance && x <= cropArea.x + cropArea.width - tolerance) {
      return 'resize-s' // 下边
    }
    
    // 检查是否在裁剪区域内（移动）
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'move'
    }
    
    return null
  }, [cropArea])

  // 处理鼠标按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const dragType = detectDragType(x, y)
    if (dragType) {
      setDragType(dragType)
      setDragStart({ 
        x, 
        y, 
        cropArea: { ...cropArea } 
      })
    }
  }, [cropArea, detectDragType])

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragType) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const deltaX = x - dragStart.x
    const deltaY = y - dragStart.y
    const originalCrop = dragStart.cropArea
    
    const newCropArea = { ...cropArea }
    
    switch (dragType) {
      case 'move':
        newCropArea.x = Math.max(0, Math.min(originalCrop.x + deltaX, CANVAS_WIDTH - originalCrop.width))
        newCropArea.y = Math.max(0, Math.min(originalCrop.y + deltaY, CANVAS_HEIGHT - originalCrop.height))
        break
        
      case 'resize-nw': // 左上角
        const nwNewWidth = originalCrop.width - deltaX
        const nwNewHeight = selectedAspectRatio ? nwNewWidth / selectedAspectRatio : originalCrop.height - deltaY
        newCropArea.width = Math.max(20, Math.min(nwNewWidth, originalCrop.x + originalCrop.width))
        newCropArea.height = Math.max(20, Math.min(nwNewHeight, originalCrop.y + originalCrop.height))
        newCropArea.x = originalCrop.x + originalCrop.width - newCropArea.width
        newCropArea.y = originalCrop.y + originalCrop.height - newCropArea.height
        break
        
      case 'resize-ne': // 右上角
        const neNewWidth = originalCrop.width + deltaX
        const neNewHeight = selectedAspectRatio ? neNewWidth / selectedAspectRatio : originalCrop.height - deltaY
        newCropArea.width = Math.max(20, Math.min(neNewWidth, CANVAS_WIDTH - originalCrop.x))
        newCropArea.height = Math.max(20, Math.min(neNewHeight, originalCrop.y + originalCrop.height))
        newCropArea.x = originalCrop.x
        newCropArea.y = originalCrop.y + originalCrop.height - newCropArea.height
        break
        
      case 'resize-sw': // 左下角
        const swNewWidth = originalCrop.width - deltaX
        const swNewHeight = selectedAspectRatio ? swNewWidth / selectedAspectRatio : originalCrop.height + deltaY
        newCropArea.width = Math.max(20, Math.min(swNewWidth, originalCrop.x + originalCrop.width))
        newCropArea.height = Math.max(20, Math.min(swNewHeight, CANVAS_HEIGHT - originalCrop.y))
        newCropArea.x = originalCrop.x + originalCrop.width - newCropArea.width
        newCropArea.y = originalCrop.y
        break
        
      case 'resize-se': // 右下角
        const seNewWidth = originalCrop.width + deltaX
        const seNewHeight = selectedAspectRatio ? seNewWidth / selectedAspectRatio : originalCrop.height + deltaY
        newCropArea.width = Math.max(20, Math.min(seNewWidth, CANVAS_WIDTH - originalCrop.x))
        newCropArea.height = Math.max(20, Math.min(seNewHeight, CANVAS_HEIGHT - originalCrop.y))
        newCropArea.x = originalCrop.x
        newCropArea.y = originalCrop.y
        break
        
      case 'resize-n': // 上边
        const nNewHeight = originalCrop.height - deltaY
        newCropArea.height = Math.max(20, Math.min(nNewHeight, originalCrop.y + originalCrop.height))
        newCropArea.y = originalCrop.y + originalCrop.height - newCropArea.height
        if (selectedAspectRatio) {
          const nNewWidth = newCropArea.height * selectedAspectRatio
          newCropArea.width = Math.max(20, Math.min(nNewWidth, CANVAS_WIDTH - originalCrop.x))
          newCropArea.x = originalCrop.x + (originalCrop.width - newCropArea.width) / 2
        }
        break
        
      case 'resize-s': // 下边
        const sNewHeight = originalCrop.height + deltaY
        newCropArea.height = Math.max(20, Math.min(sNewHeight, CANVAS_HEIGHT - originalCrop.y))
        newCropArea.y = originalCrop.y
        if (selectedAspectRatio) {
          const sNewWidth = newCropArea.height * selectedAspectRatio
          newCropArea.width = Math.max(20, Math.min(sNewWidth, CANVAS_WIDTH - originalCrop.x))
          newCropArea.x = originalCrop.x + (originalCrop.width - newCropArea.width) / 2
        }
        break
        
      case 'resize-w': // 左边
        const wNewWidth = originalCrop.width - deltaX
        newCropArea.width = Math.max(20, Math.min(wNewWidth, originalCrop.x + originalCrop.width))
        newCropArea.x = originalCrop.x + originalCrop.width - newCropArea.width
        if (selectedAspectRatio) {
          const wNewHeight = newCropArea.width / selectedAspectRatio
          newCropArea.height = Math.max(20, Math.min(wNewHeight, CANVAS_HEIGHT - originalCrop.y))
          newCropArea.y = originalCrop.y + (originalCrop.height - newCropArea.height) / 2
        }
        break
        
      case 'resize-e': // 右边
        const eNewWidth = originalCrop.width + deltaX
        newCropArea.width = Math.max(20, Math.min(eNewWidth, CANVAS_WIDTH - originalCrop.x))
        newCropArea.x = originalCrop.x
        if (selectedAspectRatio) {
          const eNewHeight = newCropArea.width / selectedAspectRatio
          newCropArea.height = Math.max(20, Math.min(eNewHeight, CANVAS_HEIGHT - originalCrop.y))
          newCropArea.y = originalCrop.y + (originalCrop.height - newCropArea.height) / 2
        }
        break
    }
    
    // 确保裁剪区域不超出画布边界
    newCropArea.x = Math.max(0, Math.min(newCropArea.x, CANVAS_WIDTH - newCropArea.width))
    newCropArea.y = Math.max(0, Math.min(newCropArea.y, CANVAS_HEIGHT - newCropArea.height))
    
    setCropArea(newCropArea)
  }, [dragType, dragStart, cropArea, selectedAspectRatio])

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    setDragType(null)
  }, [])

  // 获取光标样式
  const getCursor = useCallback((x: number, y: number): string => {
    const dragType = detectDragType(x, y)
    switch (dragType) {
      case 'resize-nw':
      case 'resize-se':
        return 'nw-resize'
      case 'resize-ne':
      case 'resize-sw':
        return 'ne-resize'
      case 'resize-n':
      case 'resize-s':
        return 'ns-resize'
      case 'resize-w':
      case 'resize-e':
        return 'ew-resize'
      case 'move':
        return 'move'
      default:
        return 'default'
    }
  }, [detectDragType])

  // 处理鼠标移动时的光标更新
  const handleMouseMoveForCursor = useCallback((e: React.MouseEvent) => {
    if (dragType) return // 拖拽时不改变光标
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const cursor = getCursor(x, y)
    canvas.style.cursor = cursor
  }, [dragType, getCursor])

  // 处理宽高比变化
  const handleAspectRatioChange = useCallback((value: string) => {
    const ratio = value === 'null' ? null : parseFloat(value)
    setSelectedAspectRatio(ratio)
    
    if (ratio) {
      // 根据宽高比调整裁剪区域
      const { width, height } = cropArea
      let newWidth = width
      let newHeight = height
      
      if (width / height > ratio) {
        newWidth = height * ratio
      } else {
        newHeight = width / ratio
      }
      
      // 确保裁剪区域不超出画布
      newWidth = Math.min(newWidth, CANVAS_WIDTH - cropArea.x)
      newHeight = Math.min(newHeight, CANVAS_HEIGHT - cropArea.y)
      
      setCropArea(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight
      }))
    }
  }, [cropArea])

  // 处理裁剪完成 - 纯客户端下载
  const handleCropComplete = useCallback(async () => {
    const img = imageRef.current
    if (!img || !isLoaded) return

    // 创建新画布进行裁剪
    const cropCanvas = document.createElement('canvas')
    const ctx = cropCanvas.getContext('2d')
    if (!ctx) return

    // 计算实际图片中的裁剪区域
    const scaleX = img.width / (img.width * imageScale)
    const scaleY = img.height / (img.height * imageScale)
    
    const actualCrop = {
      x: (cropArea.x - imageOffset.x) * scaleX,
      y: (cropArea.y - imageOffset.y) * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY
    }

    cropCanvas.width = actualCrop.width
    cropCanvas.height = actualCrop.height

    // 绘制裁剪后的图片
    ctx.drawImage(
      img,
      actualCrop.x,
      actualCrop.y,
      actualCrop.width,
      actualCrop.height,
      0,
      0,
      actualCrop.width,
      actualCrop.height
    )

    // 直接下载裁剪后的图片
    cropCanvas.toBlob((blob) => {
      if (blob) {
        // 创建下载链接
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `cropped_${imageName}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        // 关闭裁剪器
        onCancel()
      }
    }, 'image/jpeg', 0.9)
  }, [cropArea, isLoaded, imageScale, imageOffset, imageName, onCancel])

  // 重置裁剪区域
  const handleReset = useCallback(() => {
    const initialSize = Math.min(200, CANVAS_WIDTH * 0.4, CANVAS_HEIGHT * 0.4)
    setCropArea({
      x: (CANVAS_WIDTH - initialSize) / 2,
      y: (CANVAS_HEIGHT - initialSize) / 2,
      width: initialSize,
      height: initialSize
    })
    setSelectedAspectRatio(null)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('resize.crop.title')}</h2>
              <p className="text-sm text-gray-600">{imageName}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 裁剪预览区域 */}
            <div className="lg:col-span-3">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="border border-gray-300 rounded max-w-full"
                  onMouseDown={handleMouseDown}
                  onMouseMove={(e) => {
                    handleMouseMove(e)
                    handleMouseMoveForCursor(e)
                  }}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                <Move className="w-4 h-4 inline mr-1" />
                {t('resize.crop.dragHint')}
              </div>
            </div>

            {/* 控制面板 */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">{t('resize.crop.aspectRatio')}</Label>
                <Select 
                  value={selectedAspectRatio?.toString() || 'null'} 
                  onValueChange={handleAspectRatioChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ratio) => (
                      <SelectItem 
                        key={ratio.label} 
                        value={ratio.value?.toString() || 'null'}
                      >
                        {ratio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">{t('resize.crop.info')}</Label>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>{t('resize.crop.position')}: {Math.round(cropArea.x)}, {Math.round(cropArea.y)}</div>
                  <div>{t('resize.crop.size')}: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}</div>
                  {selectedAspectRatio && (
                    <div>{t('resize.crop.aspectRatio')}: {selectedAspectRatio.toFixed(2)}</div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button onClick={handleReset} variant="outline" size="sm" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('common.reset')}
                </Button>
                <Button onClick={handleCropComplete} className="w-full" disabled={!isLoaded}>
                  <Check className="w-4 h-4 mr-2" />
                  {t('resize.crop.complete')}
                </Button>
                <Button onClick={onCancel} variant="outline" className="w-full">
                  <X className="w-4 h-4 mr-2" />
                  {t('resize.crop.cancel')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}