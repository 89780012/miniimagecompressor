'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Play, RotateCcw, Settings } from 'lucide-react'
import { ImageFile, ResizeSettings } from '@/types/image'

interface ResizeControlsProps {
  images: ImageFile[]
  onImagesUpdate: (images: ImageFile[]) => void
  onStartResize: () => void
  defaultSettings: ResizeSettings
  onDefaultSettingsChange: (settings: ResizeSettings) => void
  disabled?: boolean
}

export function ResizeControls({
  images,
  onImagesUpdate,
  onStartResize,
  defaultSettings,
  onDefaultSettingsChange,
  disabled = false
}: ResizeControlsProps) {
  const [isApplyingToAll, setIsApplyingToAll] = useState(false)
  
  const pendingImages = images.filter(img => img.status === 'pending')
  const processingImages = images.filter(img => img.status === 'compressing')
  const completedImages = images.filter(img => img.status === 'completed')
  const hasImages = images.length > 0

  // 更新默认设置
  const handleDefaultSettingsChange = useCallback((key: keyof ResizeSettings, value: string | number | boolean) => {
    const newSettings = { ...defaultSettings, [key]: value }
    onDefaultSettingsChange(newSettings)
  }, [defaultSettings, onDefaultSettingsChange])

  // 获取推荐的预设尺寸选项
  const presetSizes = useMemo(() => [
    { label: '原始尺寸', width: 0, height: 0 }, // 特殊值，表示保持原始尺寸
    { label: 'HD (1280×720)', width: 1280, height: 720 },
    { label: 'Full HD (1920×1080)', width: 1920, height: 1080 },
    { label: '4K (3840×2160)', width: 3840, height: 2160 },
    { label: 'Instagram 正方形 (1080×1080)', width: 1080, height: 1080 },
    { label: 'Instagram 故事 (1080×1920)', width: 1080, height: 1920 },
    { label: 'Facebook 封面 (820×312)', width: 820, height: 312 },
    { label: '微信头像 (640×640)', width: 640, height: 640 },
    { label: '网页横幅 (1200×400)', width: 1200, height: 400 },
    { label: '自定义', width: -1, height: -1 }
  ], [])

  // 应用默认设置到所有图片
  const handleApplyToAll = useCallback(() => {
    setIsApplyingToAll(true)
    const updatedImages = images.map(img => ({
      ...img,
      resizeSettings: { ...defaultSettings }
    }))
    onImagesUpdate(updatedImages)
    setTimeout(() => setIsApplyingToAll(false), 500)
  }, [images, defaultSettings, onImagesUpdate])

  // 重置所有图片状态
  const handleResetAll = useCallback(() => {
    const resetImages = images.map(img => ({
      ...img,
      status: 'pending' as const,
      progress: 0,
      result: undefined,
      error: undefined
    }))
    onImagesUpdate(resetImages)
  }, [images, onImagesUpdate])

  // 处理预设尺寸选择
  const handlePresetSelect = useCallback((preset: string) => {
    const selected = presetSizes.find(p => p.label === preset)
    if (selected) {
      if (selected.width === 0 && selected.height === 0) {
        // 原始尺寸 - 这里需要根据第一张图片的尺寸来设置
        const firstImage = images.find(img => img.dimensions)
        if (firstImage?.dimensions) {
          handleDefaultSettingsChange('width', firstImage.dimensions.width)
          handleDefaultSettingsChange('height', firstImage.dimensions.height)
        }
      } else if (selected.width > 0 && selected.height > 0) {
        handleDefaultSettingsChange('width', selected.width)
        handleDefaultSettingsChange('height', selected.height)
      }
      // 自定义选项不更改数值
    }
  }, [presetSizes, images, handleDefaultSettingsChange])

  return (
    <Card className="p-6 space-y-6">
      {/* 预设尺寸选择 */}
      <div className="space-y-2">
        <Label className="text-base font-medium">预设尺寸</Label>
        <Select onValueChange={handlePresetSelect} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="选择预设尺寸或自定义" />
          </SelectTrigger>
          <SelectContent>
            {presetSizes.map((preset) => (
              <SelectItem key={preset.label} value={preset.label}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 尺寸设置 */}
      <div className="space-y-4">
        <Label className="text-base font-medium">目标尺寸</Label>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width" className="text-sm">宽度 (像素)</Label>
            <Input
              id="width"
              type="number"
              value={defaultSettings.width}
              onChange={(e) => handleDefaultSettingsChange('width', parseInt(e.target.value) || 0)}
              min="1"
              max="10000"
              disabled={disabled}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm">高度 (像素)</Label>
            <Input
              id="height"
              type="number"
              value={defaultSettings.height}
              onChange={(e) => handleDefaultSettingsChange('height', parseInt(e.target.value) || 0)}
              min="1"
              max="10000"
              disabled={disabled}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 保持宽高比选项 */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="maintain-ratio"
          checked={defaultSettings.maintainAspectRatio}
          onCheckedChange={(checked) => 
            handleDefaultSettingsChange('maintainAspectRatio', checked === true)
          }
          disabled={disabled}
        />
        <Label htmlFor="maintain-ratio" className="text-sm">
          保持原始宽高比
        </Label>
      </div>

      {/* 调整模式 */}
      <div className="space-y-2">
        <Label className="text-base font-medium">调整模式</Label>
        <Select
          value={defaultSettings.resizeMode}
          onValueChange={(value: 'fit' | 'fill' | 'cover') => 
            handleDefaultSettingsChange('resizeMode', value)
          }
          disabled={disabled || !defaultSettings.maintainAspectRatio}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fit">
              <div>
                <div className="font-medium">适应 (Fit)</div>
                <div className="text-xs text-gray-500">图片完全显示在指定尺寸内</div>
              </div>
            </SelectItem>
            <SelectItem value="fill">
              <div>
                <div className="font-medium">填充 (Fill)</div>
                <div className="text-xs text-gray-500">填满指定尺寸，可能会裁剪</div>
              </div>
            </SelectItem>
            <SelectItem value="cover">
              <div>
                <div className="font-medium">覆盖 (Cover)</div>
                <div className="text-xs text-gray-500">图片覆盖整个区域</div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {!defaultSettings.maintainAspectRatio && (
          <p className="text-xs text-gray-500">
            未保持宽高比时，图片将被强制调整为指定尺寸
          </p>
        )}
      </div>

      {/* 统计信息 */}
      {hasImages && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="text-sm font-medium text-gray-900">状态统计</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">等待中</div>
              <div className="text-lg font-medium text-blue-600">{pendingImages.length}</div>
            </div>
            <div>
              <div className="text-gray-500">处理中</div>
              <div className="text-lg font-medium text-orange-600">{processingImages.length}</div>
            </div>
            <div>
              <div className="text-gray-500">已完成</div>
              <div className="text-lg font-medium text-green-600">{completedImages.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="space-y-3">
        {/* 应用设置到所有图片 */}
        {hasImages && (
          <Button
            onClick={handleApplyToAll}
            variant="outline"
            className="w-full"
            disabled={disabled || isApplyingToAll}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isApplyingToAll ? '正在应用...' : '应用设置到所有图片'}
          </Button>
        )}

        {/* 开始调整尺寸 */}
        <Button
          onClick={onStartResize}
          disabled={disabled || pendingImages.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Play className="w-4 h-4 mr-2" />
          开始调整尺寸 ({pendingImages.length})
        </Button>

        {/* 重置 */}
        {(processingImages.length > 0 || completedImages.length > 0) && (
          <Button
            onClick={handleResetAll}
            variant="outline"
            className="w-full"
            disabled={disabled}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重置所有
          </Button>
        )}
      </div>

      {/* 提示信息 */}
      {!hasImages && (
        <div className="text-center text-gray-500 text-sm">
          请先上传图片再进行尺寸调整设置
        </div>
      )}
    </Card>
  )
}