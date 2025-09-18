"use client"

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Eye, Edit3, Loader2, Download } from 'lucide-react'

interface UploadedImage {
  id: string
  file: File
  url: string
  name: string
  size: number
}

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


interface GridPreviewProps {
  grid: GridLayout
  images: UploadedImage[]
  selectedCellId: string | null
  hoveredCellId: string | null
  backgroundColor: string
  gap: number
  layoutError: string | null
  onCellSelect: (cellId: string) => void
  onDragOverCell: (cellId: string) => void
  onDragLeaveCell: () => void
  onDropOnCell: (cellId: string) => void
  onRemoveImage: (cellId: string) => void
  draggedImageId: string | null
  previewMode?: boolean
  isGeneratingPreview?: boolean
  previewImageUrl?: string | null
  onTogglePreview?: (isPreview: boolean) => void
  onGeneratePreview?: () => void
  // 导出功能相关props
  isExporting?: boolean
  onExport?: (format: 'png' | 'jpeg') => void
}

export function GridPreview({
  grid,
  images,
  selectedCellId,
  hoveredCellId,
  backgroundColor,
  gap,
  layoutError,
  onCellSelect,
  onDragOverCell,
  onDragLeaveCell,
  onDropOnCell,
  onRemoveImage,
  draggedImageId,
  previewMode = false,
  isGeneratingPreview = false,
  previewImageUrl = null,
  onTogglePreview,
  onGeneratePreview,
  isExporting = false,
  onExport
}: GridPreviewProps) {
  const t = useTranslations()

  const imageMap = useMemo(() => {
    const map = new Map<string, UploadedImage>()
    images.forEach((image) => map.set(image.id, image))
    return map
  }, [images])

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* 头部信息 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('gridPage.hero.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('gridPage.hero.description')}
          </p>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 min-h-0 overflow-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {previewMode ? t('gridPage.preview.heading') : t('gridPage.grid.heading')}
              </h2>
              <p className="text-sm text-gray-500">
                {previewMode ? t('gridPage.preview.subheading') : t('gridPage.grid.subheading')}
              </p>
            </div>

            {/* 预览模式切换按钮 */}
            {onTogglePreview ? (
              <div className="flex items-center gap-2">
                <Button
                  variant={previewMode ? "outline" : "default"}
                  size="sm"
                  onClick={() => onTogglePreview(false)}
                  disabled={isGeneratingPreview}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {t('gridPage.preview.editMode')}
                </Button>
                <Button
                  variant={previewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!previewMode) {
                      onGeneratePreview?.()
                    }
                    onTogglePreview(true)
                  }}
                  disabled={isGeneratingPreview}
                  className="flex items-center gap-2"
                >
                  {isGeneratingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {isGeneratingPreview ? t('gridPage.preview.generating') : t('gridPage.preview.previewMode')}
                </Button>

                {/* 导出按钮组 - 在编辑和预览模式下都显示 */}
                {onExport && (
                  <>
                    <div className="h-6 border-l border-gray-300 mx-2" />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onExport('png')}
                      disabled={isExporting || (!previewMode && grid.cells.some(cell => !cell.imageId))}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {t('gridPage.export.exportPng')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onExport('jpeg')}
                      disabled={isExporting || (!previewMode && grid.cells.some(cell => !cell.imageId))}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {t('gridPage.export.exportJpeg')}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-sm text-red-500">
                DEBUG: onTogglePreview 未传递
              </div>
            )}
          </div>

          {layoutError && (
            <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              {layoutError}
            </div>
          )}

          <div className="flex items-center justify-center">
            {previewMode ? (
              // 预览模式：显示合成的图片
              <div className="relative border border-gray-200 max-w-full max-h-full" style={{ backgroundColor }}>
                {previewImageUrl ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewImageUrl}
                      alt={t('gridPage.preview.generatedImage')}
                      className="w-full h-auto max-w-[600px] max-h-[600px] object-contain"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {t('gridPage.preview.finalResult')}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-[600px] h-[600px] bg-gray-50 border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">{t('gridPage.preview.noPreviewGenerated')}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 编辑模式：显示网格编辑界面
              <div
                className="relative border border-gray-200 max-w-full max-h-full"
                style={{ backgroundColor }}
              >
                <div
                  className="grid w-full aspect-square min-w-[600px] min-h-[600px] max-w-[600px] max-h-[600px]"
                  style={{
                    gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
                    gap: `${gap}px`
                  }}
                >
                  {grid.cells.map((cell) => {
                    const image = cell.imageId ? imageMap.get(cell.imageId) : undefined
                    const isSelected = selectedCellId === cell.id
                    const isDropTarget = hoveredCellId === cell.id && draggedImageId

                    return (
                      <div
                        key={cell.id}
                        className={cn(
                          'relative transition-all border-2 overflow-hidden group bg-white flex items-center justify-center text-sm text-gray-400 cursor-pointer',
                          isSelected ? 'border-blue-500 shadow-inner shadow-blue-200/40' : 'border-transparent',
                          isDropTarget ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent' : ''
                        )}
                        style={{
                          gridColumn: `span ${cell.colSpan} / span ${cell.colSpan}`,
                          gridRow: `span ${cell.rowSpan} / span ${cell.rowSpan}`
                        }}
                        onClick={() => onCellSelect(cell.id)}
                        onDragOver={(event) => {
                          event.preventDefault()
                          onDragOverCell(cell.id)
                        }}
                        onDragLeave={onDragLeaveCell}
                        onDrop={(event) => {
                          event.preventDefault()
                          onDropOnCell(cell.id)
                        }}
                      >
                        {image ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.url}
                              alt={image.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow"
                              onClick={(event) => {
                                event.stopPropagation()
                                onRemoveImage(cell.id)
                              }}
                            >
                              {t('gridPage.grid.removeImage')}
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center px-4">
                            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3H8a2 2 0 00-2 2v0a2 2 0 002 2h8a2 2 0 002-2v0a2 2 0 00-2-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v4m-2-2h4" />
                            </svg>
                            <span className="text-xs text-gray-400 font-medium">
                              {t('gridPage.grid.placeholder')}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}