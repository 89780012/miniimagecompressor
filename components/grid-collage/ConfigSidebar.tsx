"use client"

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator
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
  exportQuality: number
  activeCell: GridCell | null
  grid: GridLayout
  isExporting: boolean
  outputPresets: OutputPreset[]
  onTemplateChange: (templateId: string) => void
  onResetTemplate: () => void
  onPresetChange: (presetId: string) => void
  onCustomSizeChange: (size: { width: number; height: number }) => void
  onGapChange: (gap: number) => void
  onBackgroundColorChange: (color: string) => void
  onExportQualityChange: (quality: number) => void
  onCellSpanChange: (cellId: string, type: 'row' | 'col', value: number) => void
  onExport: (format: 'png' | 'jpeg') => void
  onResetCell: () => void
}

export function ConfigSidebar({
  selectedTemplate,
  templates,
  selectedPresetId,
  customSize,
  gap,
  backgroundColor,
  exportQuality,
  activeCell,
  grid,
  isExporting,
  outputPresets,
  onTemplateChange,
  onResetTemplate,
  onPresetChange,
  onCustomSizeChange,
  onGapChange,
  onBackgroundColorChange,
  onExportQualityChange,
  onCellSpanChange,
  onExport,
  onResetCell
}: ConfigSidebarProps) {
  const t = useTranslations()

  const handlePresetChange = useCallback((value: string) => {
    onPresetChange(value)
    if (value !== 'custom') {
      const preset = outputPresets.find((item) => item.id === value)
      if (preset) {
        onCustomSizeChange({ width: preset.width, height: preset.height })
      }
    }
  }, [onPresetChange, onCustomSizeChange, outputPresets])

  return (
    <Sidebar side="right" className="w-80">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('gridPage.config.title')}
        </h2>
        <p className="text-sm text-gray-500">
          {t('gridPage.config.description')}
        </p>
      </SidebarHeader>

      <SidebarContent>
        {/* 模板设置 */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {t('gridPage.templates.heading')}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
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
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* 输出设置 */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {t('gridPage.layout.sizeHeading')}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
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
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* 单元格控制 */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {t('gridPage.cells.heading')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {activeCell ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{t('gridPage.cells.position', { row: activeCell.row + 1, col: activeCell.col + 1 })}</span>
                  <span>{t('gridPage.cells.spanSummary', { rows: activeCell.rowSpan, cols: activeCell.colSpan })}</span>
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
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {t('gridPage.cells.noSelection')}
              </p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* 导出设置 */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {t('gridPage.export.heading')}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => onExport('png')}
                disabled={isExporting}
              >
                {t('gridPage.export.exportPng')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onExport('jpeg')}
                disabled={isExporting}
              >
                {t('gridPage.export.exportJpeg')}
              </Button>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-600">
                {t('gridPage.export.qualityLabel', { value: exportQuality })}
              </Label>
              <Slider
                value={[exportQuality]}
                onValueChange={([value]) => onExportQualityChange(value)}
                min={60}
                max={100}
                step={2}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('gridPage.export.qualityHint')}
              </p>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
              {t('gridPage.export.tip')}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}