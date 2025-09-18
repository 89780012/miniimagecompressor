"use client"

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader
} from '@/components/ui/sidebar'

interface GridCell {
  id: string
  row: number
  col: number
  rowSpan: number
  colSpan: number
  imageId?: string
}

interface GridLayout {
  rows: number
  cols: number
  cells: GridCell[]
}

interface OutputPreset {
  id: string
  width: number
  height: number
  labelKey: string
}

interface GridTemplateConfig {
  id: string
  labelKey: string
  descriptionKey: string
  createLayout: () => GridLayout
}

interface ConfigSidebarProps {
  selectedTemplate: string
  templates: GridTemplateConfig[]
  selectedPresetId: string
  customSize: { width: number; height: number }
  gap: number
  backgroundColor: string
  activeCell: GridCell | null
  grid: GridLayout
  outputPresets: OutputPreset[]
  onTemplateChange: (templateId: string) => void
  onResetTemplate: () => void
  onPresetChange: (presetId: string) => void
  onCustomSizeChange: (size: { width: number; height: number }) => void
  onGapChange: (gap: number) => void
  onBackgroundColorChange: (color: string) => void
  onCellSpanChange: (cellId: string, type: 'row' | 'col', value: number) => void
  onResetCell: () => void
}

export function ConfigSidebar({
  selectedTemplate,
  templates,
  selectedPresetId,
  customSize,
  gap,
  backgroundColor,
  activeCell,
  grid,
  outputPresets,
  onTemplateChange,
  onResetTemplate,
  onPresetChange,
  onCustomSizeChange,
  onGapChange,
  onBackgroundColorChange,
  onCellSpanChange,
  onResetCell
}: ConfigSidebarProps) {
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState('templates')

  const handlePresetChange = useCallback((value: string) => {
    onPresetChange(value)
    if (value !== 'custom') {
      const preset = outputPresets.find((item) => item.id === value)
      if (preset) {
        onCustomSizeChange({ width: preset.width, height: preset.height })
      }
    }
  }, [onPresetChange, onCustomSizeChange, outputPresets])

  const tabs = [
    { id: 'templates', label: t('gridPage.templates.heading') },
    { id: 'layout', label: t('gridPage.layout.sizeHeading') },
    { id: 'cells', label: t('gridPage.cells.heading') }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return (
          <div className="space-y-4">
            <div>
              <Select value={selectedTemplate} onValueChange={onTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {t(template.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onResetTemplate}
            >
              {t('gridPage.grid.resetTemplate')}
            </Button>

            {(() => {
              const appliedTemplate = templates.find((template) => template.id === selectedTemplate)
              return appliedTemplate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p className="font-medium text-blue-800 mb-1">{t(appliedTemplate.labelKey)}</p>
                  <p>{t(appliedTemplate.descriptionKey)}</p>
                </div>
              )
            })()}
          </div>
        )
      case 'layout':
        return (
          <div className="space-y-4">
            <div>
              <Select value={selectedPresetId} onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outputPresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {t(preset.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPresetId === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="custom-width" className="text-xs font-medium text-gray-600">
                    {t('gridPage.layout.customWidth')}
                  </Label>
                  <Input
                    id="custom-width"
                    type="number"
                    min={300}
                    max={4096}
                    value={customSize.width}
                    onChange={(event) =>
                      onCustomSizeChange({
                        ...customSize,
                        width: Number(event.target.value) || customSize.width
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="custom-height" className="text-xs font-medium text-gray-600">
                    {t('gridPage.layout.customHeight')}
                  </Label>
                  <Input
                    id="custom-height"
                    type="number"
                    min={300}
                    max={4096}
                    value={customSize.height}
                    onChange={(event) =>
                      onCustomSizeChange({
                        ...customSize,
                        height: Number(event.target.value) || customSize.height
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t('gridPage.layout.gapLabel', { value: gap })}
              </Label>
              <Slider
                value={[gap]}
                onValueChange={([value]) => onGapChange(value)}
                min={0}
                max={48}
                step={2}
                className="mt-3"
              />
            </div>

            <div>
              <Label
                htmlFor="background-color"
                className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {t('gridPage.layout.backgroundLabel')}
              </Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  id="background-color"
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => onBackgroundColorChange(event.target.value)}
                  className="h-10 w-16 rounded border border-gray-200"
                />
                <Input
                  value={backgroundColor}
                  onChange={(event) => onBackgroundColorChange(event.target.value)}
                />
              </div>
            </div>
          </div>
        )
      case 'cells':
        return (
          <div className="space-y-4">
            {activeCell ? (
              <>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div><span>{t('gridPage.cells.position', { row: activeCell.row + 1, col: activeCell.col + 1 })}</span></div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div><span>{t('gridPage.cells.spanSummary', { rows: activeCell.rowSpan, cols: activeCell.colSpan })}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      {t('gridPage.cells.rowSpanLabel')}
                    </Label>
                    <Select
                      value={activeCell.rowSpan.toString()}
                      onValueChange={(value) => onCellSpanChange(activeCell.id, 'row', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: grid.rows - activeCell.row }, (_, index) => index + 1).map((value) => (
                          <SelectItem key={value} value={value.toString()}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-600">
                      {t('gridPage.cells.colSpanLabel')}
                    </Label>
                    <Select
                      value={activeCell.colSpan.toString()}
                      onValueChange={(value) => onCellSpanChange(activeCell.id, 'col', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: grid.cols - activeCell.col }, (_, index) => index + 1).map((value) => (
                          <SelectItem key={value} value={value.toString()}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 space-y-1">
                  <p>{t('gridPage.cells.mergeHint')}</p>
                  <p>{t('gridPage.cells.splitHint')}</p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={onResetCell}
                >
                  {t('gridPage.cells.resetCell')}
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                {t('gridPage.cells.noSelection')}
              </p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Sidebar side="right" className="w-80">
      <SidebarHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {t('gridPage.config.title')}
        </h2>
        <p className="text-sm text-gray-500">
          {t('gridPage.config.description')}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex h-full">
          {/* 内容区域 - 左侧主要区域 */}
          <div className="flex-1 p-2 overflow-y-auto">
            {renderTabContent()}
          </div>

          {/* 垂直标签区域 - 右侧固定区域 */}
          <div className="flex flex-col border-l border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`
                  min-w-[28px] px-2 py-6 text-xs border-b border-gray-200 last:border-b-0
                  hover:bg-gray-50 transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-l-2 border-l-blue-500'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed'
                }}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}