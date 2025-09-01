'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export interface CompressionSettings {
  mode: 'size' | 'quality'
  targetSizeKb?: number
  quality?: number
  format: 'jpeg' | 'png' | 'webp'
}

interface CompressionControlsProps {
  settings: CompressionSettings
  onSettingsChange: (settings: CompressionSettings) => void
  onCompress: () => void
  isCompressing?: boolean
  disabled?: boolean
}

export function CompressionControls({
  settings,
  onSettingsChange,
  onCompress,
  isCompressing = false,
  disabled = false
}: CompressionControlsProps) {
  const t = useTranslations()
  const [localSettings, setLocalSettings] = useState<CompressionSettings>(settings)

  const updateSettings = (updates: Partial<CompressionSettings>) => {
    const newSettings = { ...localSettings, ...updates }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const formatSizeOptions = [
    { value: 'jpeg', label: 'JPEG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' }
  ]

  const quickSizeOptions = [
    { size: 50, label: '50 KB' },
    { size: 100, label: '100 KB' },
    { size: 200, label: '200 KB' },
    { size: 500, label: '500 KB' },
    { size: 1000, label: '1 MB' },
  ]

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">压缩设置</h3>
          
          <Tabs
            value={localSettings.mode}
            onValueChange={(value) => updateSettings({ mode: value as 'size' | 'quality' })}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="size">按文件大小</TabsTrigger>
              <TabsTrigger value="quality">按质量</TabsTrigger>
            </TabsList>
            
            <TabsContent value="size" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="targetSize">目标大小 (KB)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Input
                    id="targetSize"
                    type="number"
                    value={localSettings.targetSizeKb || ''}
                    onChange={(e) => updateSettings({ targetSizeKb: parseInt(e.target.value) || undefined })}
                    placeholder={t('compression.targetSizePlaceholder')}
                    className="flex-1"
                    disabled={disabled}
                  />
                  <span className="text-sm text-gray-500">KB</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">快速选择:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickSizeOptions.map((option) => (
                    <Button
                      key={option.size}
                      variant="outline"
                      size="sm"
                      onClick={() => updateSettings({ targetSizeKb: option.size })}
                      disabled={disabled}
                      className={localSettings.targetSizeKb === option.size ? 'border-blue-500 text-blue-600' : ''}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quality" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="quality">压缩质量: {localSettings.quality || 80}%</Label>
                <div className="mt-2">
                  <Slider
                    value={[localSettings.quality || 80]}
                    onValueChange={(value) => updateSettings({ quality: value[0] })}
                    max={100}
                    min={1}
                    step={1}
                    disabled={disabled}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>最小 (1%)</span>
                    <span>最大 (100%)</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <p><strong>质量指南:</strong></p>
                <p>• 85-95%: 高质量，文件较大</p>
                <p>• 75-85%: 平衡质量和大小</p>
                <p>• 60-75%: 中等质量，文件较小</p>
                <p>• 30-60%: 低质量，最小文件</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <Separator />
        
        <div>
          <Label htmlFor="format">输出格式</Label>
          <div className="flex space-x-2 mt-2">
            {formatSizeOptions.map((format) => (
              <Button
                key={format.value}
                variant="outline"
                size="sm"
                onClick={() => updateSettings({ format: format.value as CompressionSettings['format'] })}
                disabled={disabled}
                className={localSettings.format === format.value ? 'border-blue-500 text-blue-600' : ''}
              >
                {format.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            JPEG: 最小文件大小 | PNG: 支持透明度 | WebP: 现代浏览器的最佳选择
          </p>
        </div>
        
        <Separator />
        
        <Button
          onClick={onCompress}
          disabled={disabled || isCompressing || (!localSettings.targetSizeKb && !localSettings.quality)}
          className="w-full"
          size="lg"
        >
          {isCompressing ? t('compression.compressing') : t('compressionControls.compress')}
        </Button>
      </div>
    </Card>
  )
}