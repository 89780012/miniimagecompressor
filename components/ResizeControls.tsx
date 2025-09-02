'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Play, RotateCcw, Crop, Link2, Unlink2, Settings } from 'lucide-react'
import { ImageFile, ResizeSettings } from '@/types/image'
import { ImageCropper } from '@/components/ImageCropper'

// 常用预设尺寸
const getPresetSizes = (t: (key: string) => string) => [
  { label: t('resize.controls.customSize'), width: 0, height: 0, category: 'custom' },
  { label: 'Instagram ' + t('resize.presets.square') + ' (1080×1080)', width: 1080, height: 1080, category: 'social' },
  { label: 'Instagram ' + t('resize.presets.story') + ' (1080×1920)', width: 1080, height: 1920, category: 'social' },
  { label: 'Facebook ' + t('resize.presets.cover') + ' (1200×630)', width: 1200, height: 630, category: 'social' },
  { label: t('resize.presets.wechatMoments') + ' (1080×1080)', width: 1080, height: 1080, category: 'social' },
  { label: 'Web ' + t('resize.presets.thumbnail') + ' (300×300)', width: 300, height: 300, category: 'web' },
  { label: 'Web ' + t('resize.presets.banner') + ' (1200×400)', width: 1200, height: 400, category: 'web' },
  { label: 'HD (1280×720)', width: 1280, height: 720, category: 'screen' },
  { label: 'Full HD (1920×1080)', width: 1920, height: 1080, category: 'screen' },
  { label: '4K (3840×2160)', width: 3840, height: 2160, category: 'screen' },
]

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
  const t = useTranslations()
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0) // 默认自定义
  const [linkedDimensions, setLinkedDimensions] = useState(defaultSettings.maintainAspectRatio)
  const [activeTab, setActiveTab] = useState('resize') // 跟踪当前选项卡
  
  // 裁剪编辑器状态
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean
    imageId: string | null
    imageUrl: string | null
    imageName: string | null
  }>({
    isOpen: false,
    imageId: null,
    imageUrl: null,
    imageName: null
  })
  
  const PRESET_SIZES = getPresetSizes(t)
  const pendingImages = images.filter(img => img.status === 'pending')
  const processingImages = images.filter(img => img.status === 'compressing')
  const isProcessing = processingImages.length > 0

  // 处理预设尺寸选择
  const handlePresetChange = useCallback((presetIndex: string) => {
    const index = parseInt(presetIndex)
    setSelectedPresetIndex(index)
    const preset = PRESET_SIZES[index]
    
    if (preset.width > 0 && preset.height > 0) {
      // 使用预设尺寸
      onDefaultSettingsChange({
        ...defaultSettings,
        width: preset.width,
        height: preset.height,
        maintainAspectRatio: true
      })
      setLinkedDimensions(true)
    }
    // 如果是自定义(width=0, height=0)，保持当前设置
  }, [defaultSettings, onDefaultSettingsChange, PRESET_SIZES])

  // 处理宽度变化 (智能联动)
  const handleWidthChange = useCallback((value: string) => {
    const width = parseInt(value) || 0
    setSelectedPresetIndex(0) // 切换到自定义
    
    if (linkedDimensions && defaultSettings.height > 0) {
      // 根据当前宽高比计算新高度
      const aspectRatio = defaultSettings.width / defaultSettings.height
      const newHeight = Math.round(width / aspectRatio)
      onDefaultSettingsChange({
        ...defaultSettings,
        width: width,
        height: newHeight
      })
    } else {
      onDefaultSettingsChange({
        ...defaultSettings,
        width: width
      })
    }
  }, [defaultSettings, linkedDimensions, onDefaultSettingsChange])

  // 处理高度变化 (智能联动)
  const handleHeightChange = useCallback((value: string) => {
    const height = parseInt(value) || 0
    setSelectedPresetIndex(0) // 切换到自定义
    
    if (linkedDimensions && defaultSettings.width > 0) {
      // 根据当前宽高比计算新宽度
      const aspectRatio = defaultSettings.width / defaultSettings.height
      const newWidth = Math.round(height * aspectRatio)
      onDefaultSettingsChange({
        ...defaultSettings,
        width: newWidth,
        height: height
      })
    } else {
      onDefaultSettingsChange({
        ...defaultSettings,
        height: height
      })
    }
  }, [defaultSettings, linkedDimensions, onDefaultSettingsChange])

  // 切换宽高比锁定
  const toggleDimensionsLink = useCallback(() => {
    const newLinked = !linkedDimensions
    setLinkedDimensions(newLinked)
    onDefaultSettingsChange({
      ...defaultSettings,
      maintainAspectRatio: newLinked
    })
  }, [linkedDimensions, defaultSettings, onDefaultSettingsChange])

  // 打开裁剪编辑器
  const openCropper = useCallback((imageId: string, imageUrl: string, imageName: string) => {
    setCropperState({
      isOpen: true,
      imageId,
      imageUrl,
      imageName
    })
  }, [])

  // 关闭裁剪编辑器
  const closeCropper = useCallback(() => {
    setCropperState({
      isOpen: false,
      imageId: null,
      imageUrl: null,
      imageName: null
    })
  }, [])

  // 处理调整模式变化
  const handleResizeModeChange = useCallback((mode: 'fit' | 'fill' | 'cover') => {
    onDefaultSettingsChange({
      ...defaultSettings,
      resizeMode: mode
    })
  }, [defaultSettings, onDefaultSettingsChange])

  return (
    <div className="space-y-6">
      {/* 进度状态 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{t('resize.controls.progress')}</h3>
          <span className="text-sm text-gray-500">{t('resize.selectedImages', { count: images.length })}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl font-bold text-gray-600">{pendingImages.length}</div>
            <div className="text-gray-500">{t('resize.controls.pending')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{processingImages.length}</div>
            <div className="text-blue-500">{t('resize.controls.processing')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {images.filter(img => img.status === 'completed').length}
            </div>
            <div className="text-green-500">{t('resize.controls.completed')}</div>
          </div>
        </div>
      </Card>

      {/* 主要控制面板 */}
      <Card className="p-6">
        <Tabs defaultValue="resize" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resize" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('resize.title')}
            </TabsTrigger>
            <TabsTrigger value="crop" className="flex items-center gap-2">
              <Crop className="w-4 h-4" />
              {t('resize.crop.title')}
            </TabsTrigger>
          </TabsList>

          {/* 调整尺寸面板 */}
          <TabsContent value="resize" className="space-y-6">
            {/* 预设尺寸 */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{t('resize.presets.selectPreset')}</Label>
              <Select value={selectedPresetIndex.toString()} onValueChange={handlePresetChange} disabled={disabled}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_SIZES.map((preset, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* 自定义尺寸 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{t('resize.controls.customSize')}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDimensionsLink}
                  className="h-8 px-2"
                  title={linkedDimensions ? t('resize.controls.unlinkDimensions') : t('resize.controls.linkDimensions')}
                >
                  {linkedDimensions ? <Link2 className="w-4 h-4" /> : <Unlink2 className="w-4 h-4" />}
                  <span className="ml-1 text-xs">
                    {linkedDimensions ? t('resize.controls.linked') : t('resize.controls.unlinked')}
                  </span>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">{t('resize.controls.width')}</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    max="10000"
                    value={defaultSettings.width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    disabled={disabled}
                    placeholder={t('resize.controls.width')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">{t('resize.controls.height')}</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    max="10000"
                    value={defaultSettings.height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    disabled={disabled}
                    placeholder={t('resize.controls.height')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 调整模式 */}
            <div className="space-y-3">
              <Label className="text-base font-medium">{t('resize.controls.resizeMode')}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={defaultSettings.resizeMode === 'fit' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleResizeModeChange('fit')}
                  disabled={disabled}
                  className="text-xs"
                >
                  {t('resize.controls.fit')}
                </Button>
                <Button
                  variant={defaultSettings.resizeMode === 'fill' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleResizeModeChange('fill')}
                  disabled={disabled}
                  className="text-xs"
                >
                  {t('resize.controls.fill')}
                </Button>
                <Button
                  variant={defaultSettings.resizeMode === 'cover' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleResizeModeChange('cover')}
                  disabled={disabled}
                  className="text-xs"
                >
                  {t('resize.controls.cover')}
                </Button>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>{t('resize.modes.fit')}</strong>: {t('resize.modes.fitDescription')}</p>
                <p><strong>{t('resize.modes.fill')}</strong>: {t('resize.modes.fillDescription')}</p>
                <p><strong>{t('resize.modes.cover')}</strong>: {t('resize.modes.coverDescription')}</p>
              </div>
            </div>

            {/* 当前设置预览 */}
            {defaultSettings.width > 0 && defaultSettings.height > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-900">{t('resize.controls.currentSettings')}</div>
                <div className="text-sm text-blue-700 mt-1">
                  {t('resize.controls.dimensionsSetting', { width: defaultSettings.width, height: defaultSettings.height })}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {t('resize.controls.aspectRatioStatus')}: {linkedDimensions ? t('resize.controls.linked') : t('resize.controls.unlinked')} | 
                  {t('resize.controls.resizeMode')}: {
                    defaultSettings.resizeMode === 'fit' ? t('resize.controls.fit') :
                    defaultSettings.resizeMode === 'fill' ? t('resize.controls.fill') : t('resize.controls.cover')
                  }
                </div>
              </div>
            )}
          </TabsContent>

          {/* 裁剪编辑面板 */}
          <TabsContent value="crop" className="space-y-6">
            {images.length === 0 ? (
              <div className="text-center py-8">
                <Crop className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('resize.crop.title')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('resize.crop.subtitle')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('resize.crop.features')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-800 mb-2">{t('resize.crop.instructions.title')}</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• {t('resize.crop.instructions.clickToOpen')}</li>
                    <li>• {t('resize.crop.instructions.aspectRatios')}</li>
                    <li>• {t('resize.crop.instructions.dragToAdjust')}</li>
                    <li>• {t('resize.crop.instructions.replaceOriginal')}</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {images.slice(0, 4).map((image) => (
                    <div key={image.id} className="relative group">
                      <div 
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-300 transition-colors"
                        onClick={() => {
                          openCropper(image.id, image.preview, image.file.name)
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={image.preview} 
                          alt={image.file.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Crop className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 truncate">
                        {image.file.name}
                      </div>
                    </div>
                  ))}
                </div>
                
                {images.length > 4 && (
                  <div className="text-center text-sm text-gray-500">
                    {t('resize.crop.moreImages', { count: images.length - 4 })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        {/* 操作按钮 - 仅在尺寸调整选项卡显示 */}
        {activeTab === 'resize' && (
          <div className="flex gap-3">
            <Button 
              onClick={onStartResize} 
              disabled={disabled || pendingImages.length === 0 || isProcessing}
              className="flex-1"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {isProcessing ? t('resize.controls.processing') : t('resize.controls.startProcessing', { count: pendingImages.length })}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                // 重置逻辑
                const resetImages = images.map(img => ({
                  ...img,
                  status: 'pending' as const,
                  progress: 0,
                  result: undefined,
                  error: undefined
                }))
                onImagesUpdate(resetImages)
              }}
              disabled={disabled || images.length === 0}
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('resize.controls.reset')}
            </Button>
          </div>
        )}
      </Card>
      
      {/* 裁剪编辑器 */}
      {cropperState.isOpen && cropperState.imageUrl && cropperState.imageName && (
        <ImageCropper
          imageUrl={cropperState.imageUrl}
          imageName={cropperState.imageName}
          onCancel={closeCropper}
        />
      )}
    </div>
  )
}