'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'
import { Settings, Play, Pause, RotateCcw } from 'lucide-react'
import { CompressionSettings } from '@/types/image'

interface ImageFile {
  id: string
  file: File
  preview: string
  size: number
  dimensions?: { width: number; height: number }
  settings?: CompressionSettings
  progress: number
  status: 'pending' | 'compressing' | 'completed' | 'error'
}

interface BatchProgress {
  completed: number
  total: number
  isRunning: boolean
}

interface BatchCompressionControlsProps {
  images: ImageFile[]
  onImagesUpdate: (images: ImageFile[]) => void
  onStartBatch: () => void
  onPauseBatch: () => void
  onResetBatch: () => void
  batchProgress: BatchProgress
  defaultSettings: CompressionSettings
  onDefaultSettingsChange: (settings: CompressionSettings) => void
  disabled?: boolean
}

export function BatchCompressionControls({
  images,
  onImagesUpdate,
  onStartBatch,
  onPauseBatch,
  onResetBatch,
  batchProgress,
  defaultSettings,
  onDefaultSettingsChange,
  disabled = false
}: BatchCompressionControlsProps) {
  const t = useTranslations()
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [useIndividualSettings, setUseIndividualSettings] = useState(false)

  const pendingCount = images.filter(img => img.status === 'pending').length
  const completedCount = images.filter(img => img.status === 'completed').length
  const errorCount = images.filter(img => img.status === 'error').length

  // 更新默认设置
  const updateDefaultSettings = (partial: Partial<CompressionSettings>) => {
    onDefaultSettingsChange({ ...defaultSettings, ...partial })
  }

  // 更新单个图片设置
  const updateImageSettings = (imageId: string, settings: CompressionSettings) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, settings } : img
    )
    onImagesUpdate(updatedImages)
  }

  // 应用默认设置到所有图片
  const applyDefaultToAll = () => {
    const updatedImages = images.map(img => ({ 
      ...img, 
      settings: { ...defaultSettings } 
    }))
    onImagesUpdate(updatedImages)
  }

  // 获取当前选中图片的设置
  const selectedImage = images.find(img => img.id === selectedImageId)
  const currentSettings = useIndividualSettings && selectedImage?.settings 
    ? selectedImage.settings 
    : defaultSettings

  // 设置更新函数
  const updateCurrentSettings = (partial: Partial<CompressionSettings>) => {
    const newSettings = { ...currentSettings, ...partial }
    
    if (useIndividualSettings && selectedImageId) {
      updateImageSettings(selectedImageId, newSettings)
    } else {
      updateDefaultSettings(newSettings)
    }
  }

  const formatModes = [
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' }
  ]

  return (
    <div className="space-y-6">
      {/* 批处理状态 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('compression.batchTitle')}
            </h3>
            <div className="text-sm text-gray-500">
              {t('compression.imageCount', { count: images.length })}
            </div>
          </div>

          {/* 进度统计 */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
              <div className="text-xs text-gray-500">{t('compression.pending')}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{batchProgress.completed}</div>
              <div className="text-xs text-blue-500">{t('compression.processing')}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-green-500">{t('compression.completed')}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-xs text-red-500">{t('compression.errors')}</div>
            </div>
          </div>

          {/* 批处理控制 */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onStartBatch}
              disabled={disabled || images.length === 0 || pendingCount === 0}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {batchProgress.isRunning ? t('compression.resume') : t('compression.startBatch')}
            </Button>
            {batchProgress.isRunning && (
              <Button
                variant="outline"
                onClick={onPauseBatch}
                disabled={disabled}
              >
                <Pause className="h-4 w-4 mr-2" />
                {t('compression.pause')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onResetBatch}
              disabled={disabled || (completedCount === 0 && errorCount === 0)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('compression.reset')}
            </Button>
          </div>
        </div>
      </Card>

      {/* 压缩设置 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('compression.settings')}</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="individual-settings"
                checked={useIndividualSettings}
                onCheckedChange={setUseIndividualSettings}
                disabled={disabled || images.length === 0}
              />
              <Label htmlFor="individual-settings" className="text-sm">
                {t('compression.individualSettings')}
              </Label>
            </div>
          </div>

          {useIndividualSettings && (
            <div className="space-y-2">
              <Label className="text-sm">{t('compression.selectImage')}</Label>
              <select 
                value={selectedImageId || ''} 
                onChange={(e) => setSelectedImageId(e.target.value || null)}
                className="w-full p-2 border rounded-md text-sm"
                disabled={disabled}
              >
                <option value="">{t('compression.defaultSettings')}</option>
                {images.map(img => (
                  <option key={img.id} value={img.id}>
                    {img.file.name} {img.settings ? `(${t('compression.customized')})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Tabs value={currentSettings.mode} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="quality" 
                onClick={() => updateCurrentSettings({ mode: 'quality' })}
                disabled={disabled}
              >
                {t('compression.qualityMode')}
              </TabsTrigger>
              <TabsTrigger 
                value="size" 
                onClick={() => updateCurrentSettings({ mode: 'size' })}
                disabled={disabled}
              >
                {t('compression.sizeMode')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quality" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-1">{t('compression.qualityModeTitle')}</h4>
                <p className="text-xs text-blue-700">
                  {t('compression.qualityModeDescription')}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">
                  {t('compression.quality')}: {currentSettings.quality ?? 80}%
                </Label>
                <div className="text-xs text-gray-600 mb-2">
                  {(currentSettings.quality ?? 80) >= 90 && t('compression.qualityVeryHigh')}
                  {(currentSettings.quality ?? 80) >= 80 && (currentSettings.quality ?? 80) < 90 && t('compression.qualityHigh')}
                  {(currentSettings.quality ?? 80) >= 60 && (currentSettings.quality ?? 80) < 80 && t('compression.qualityMedium')}
                  {(currentSettings.quality ?? 80) >= 40 && (currentSettings.quality ?? 80) < 60 && t('compression.qualityLow')}
                  {(currentSettings.quality ?? 80) < 40 && t('compression.qualityVeryLow')}
                </div>
                <Slider
                  value={[currentSettings.quality || 80]}
                  onValueChange={([value]) => updateCurrentSettings({ quality: value })}
                  max={95}
                  min={20}
                  step={5}
                  className="mt-2"
                  disabled={disabled}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{t('compression.smallFileQuality')}</span>
                  <span>{t('compression.largeFileQuality')}</span>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-xs text-amber-800 font-medium">{t('compression.smartCompressionTip')}</p>
                    <p className="text-xs text-amber-700 mt-1">
                      {t('compression.smartCompressionDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="size" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-green-800 mb-1">{t('compression.sizeModeTitle')}</h4>
                <p className="text-xs text-green-700">
                  {t('compression.sizeModeDescription')}
                </p>
              </div>
              
              <div>
                <Label htmlFor="target-size" className="text-sm font-medium">
                  {t('compression.targetSize')} (KB)
                </Label>
                <Input
                  id="target-size"
                  type="number"
                  value={currentSettings.targetSizeKb || ''}
                  onChange={(e) => updateCurrentSettings({ 
                    targetSizeKb: parseInt(e.target.value) || undefined 
                  })}
                  placeholder={t('compression.targetSizePlaceholder')}
                  min={10}
                  max={10240}
                  className="mt-1"
                  disabled={disabled}
                />
                <div className="text-xs text-gray-600 mt-1">
                  {t('compression.targetSizeHint')}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-blue-800 font-medium">{t('compression.compressionStrategy')}</p>
                    <p className="text-xs text-blue-700 mt-1">
                      {t('compression.compressionStrategyDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div>
            <Label className="text-sm font-medium">{t('compression.format')}</Label>
            <div className="flex gap-2 mt-2">
              {formatModes.map((format) => (
                <Button
                  key={format.value}
                  variant="outline"
                  size="sm"
                  onClick={() => updateCurrentSettings({ format: format.value as CompressionSettings['format'] })}
                  disabled={disabled}
                  className={currentSettings.format === format.value ? 'border-blue-500 text-blue-600' : ''}
                >
                  {format.label}
                </Button>
              ))}
            </div>
          </div>

          {!useIndividualSettings && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={applyDefaultToAll}
                disabled={disabled || images.length === 0}
                className="w-full"
              >
                {t('compression.applyToAll')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}