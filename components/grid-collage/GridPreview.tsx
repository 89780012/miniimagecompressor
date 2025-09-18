"use client"

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
  draggedImageId
}: GridPreviewProps) {
  const t = useTranslations()

  const imageMap = useMemo(() => {
    const map = new Map<string, UploadedImage>()
    images.forEach((image) => map.set(image.id, image))
    return map
  }, [images])

  const assignedCount = grid.cells.filter((cell) => cell.imageId).length

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

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {t('gridPage.stats.images', { count: images.length })}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t('gridPage.stats.imagesHint')}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {t('gridPage.stats.assigned', { count: assignedCount, total: grid.cells.length })}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t('gridPage.stats.assignedHint')}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {t('gridPage.stats.grid', { rows: grid.rows, cols: grid.cols })}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t('gridPage.stats.gridHint')}
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 min-h-0 overflow-auto p-6">
        <Card className="h-full p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('gridPage.grid.heading')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('gridPage.grid.subheading')}
              </p>
            </div>
          </div>

          {layoutError && (
            <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              {layoutError}
            </div>
          )}

          <div className="h-full max-h-[600px] flex items-center justify-center">
            <div
              className="relative bg-[length:20px_20px] rounded-xl border border-gray-200 p-4 max-w-full max-h-full"
              style={{ backgroundColor }}
            >
              <div
                className="grid w-full aspect-square min-w-[400px] min-h-[400px] max-w-[600px] max-h-[600px]"
                style={{
                  gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
                  gap: `${gap}px`
                }}
              >
                {grid.cells.map((cell, index) => {
                  const image = cell.imageId ? imageMap.get(cell.imageId) : undefined
                  const isSelected = selectedCellId === cell.id
                  const isDropTarget = hoveredCellId === cell.id && draggedImageId

                  return (
                    <div
                      key={cell.id}
                      className={cn(
                        'relative rounded-lg transition-all border-2 overflow-hidden group bg-white flex items-center justify-center text-sm text-gray-400 cursor-pointer',
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

                      <div className="absolute bottom-2 left-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-gray-600 shadow">
                          {t('gridPage.grid.cellLabel', { index: index + 1 })}
                        </span>
                        {image && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] text-gray-700 shadow">
                            {image.name}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}