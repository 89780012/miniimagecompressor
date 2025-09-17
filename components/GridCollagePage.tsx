"use client"
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
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

interface GridTemplateConfig {
  id: string
  labelKey: string
  descriptionKey: string
  createLayout: () => GridLayout
}

interface OutputPreset {
  id: string
  width: number
  height: number
  labelKey: string
}

interface CellResizeResult {
  layout: GridLayout
  error?: string
}

const DEFAULT_ROWS = 3
const DEFAULT_COLS = 3

const OUTPUT_PRESETS: OutputPreset[] = [
  {
    id: 'square1080',
    width: 1080,
    height: 1080,
    labelKey: 'gridPage.outputPresets.square1080'
  },
  {
    id: 'square2048',
    width: 2048,
    height: 2048,
    labelKey: 'gridPage.outputPresets.square2048'
  },
  {
    id: 'story1080x1920',
    width: 1080,
    height: 1920,
    labelKey: 'gridPage.outputPresets.story'
  },
  {
    id: 'landscape1920x1080',
    width: 1920,
    height: 1080,
    labelKey: 'gridPage.outputPresets.landscape'
  },
  {
    id: 'custom',
    width: 1080,
    height: 1080,
    labelKey: 'gridPage.outputPresets.custom'
  }
]

const GRID_TEMPLATES: GridTemplateConfig[] = [
  {
    id: 'classic',
    labelKey: 'gridPage.templates.classic.label',
    descriptionKey: 'gridPage.templates.classic.description',
    createLayout: () => createDefaultGridLayout(DEFAULT_ROWS, DEFAULT_COLS)
  },
  {
    id: 'focus',
    labelKey: 'gridPage.templates.focus.label',
    descriptionKey: 'gridPage.templates.focus.description',
    createLayout: () =>
      buildGridLayout(DEFAULT_ROWS, DEFAULT_COLS, [
        { row: 0, col: 0, rowSpan: 2, colSpan: 2 },
        { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
        { row: 1, col: 2, rowSpan: 1, colSpan: 1 },
        { row: 2, col: 0, rowSpan: 1, colSpan: 1 },
        { row: 2, col: 1, rowSpan: 1, colSpan: 1 },
        { row: 2, col: 2, rowSpan: 1, colSpan: 1 }
      ])
  },
  {
    id: 'stripTop',
    labelKey: 'gridPage.templates.stripTop.label',
    descriptionKey: 'gridPage.templates.stripTop.description',
    createLayout: () =>
      buildGridLayout(DEFAULT_ROWS, DEFAULT_COLS, [
        { row: 0, col: 0, rowSpan: 1, colSpan: 3 },
        { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
        { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
        { row: 1, col: 2, rowSpan: 1, colSpan: 1 },
        { row: 2, col: 0, rowSpan: 1, colSpan: 1 },
        { row: 2, col: 1, rowSpan: 1, colSpan: 1 },
        { row: 2, col: 2, rowSpan: 1, colSpan: 1 }
      ])
  },
  {
    id: 'columnLeft',
    labelKey: 'gridPage.templates.columnLeft.label',
    descriptionKey: 'gridPage.templates.columnLeft.description',
    createLayout: () =>
      buildGridLayout(DEFAULT_ROWS, DEFAULT_COLS, [
        { row: 0, col: 0, rowSpan: 3, colSpan: 1 },
        { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
        { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
        { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
        { row: 1, col: 2, rowSpan: 1, colSpan: 1 },
        { row: 2, col: 1, rowSpan: 1, colSpan: 1 },
        { row: 2, col: 2, rowSpan: 1, colSpan: 1 }
      ])
  }
]

const QUALITY_DEFAULT = 0.92

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function createDefaultGridLayout(rows: number, cols: number): GridLayout {
  const cells: GridCell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        id: createId('cell'),
        row,
        col,
        rowSpan: 1,
        colSpan: 1
      })
    }
  }
  return {
    rows,
    cols,
    cells
  }
}

function buildGridLayout(
  rows: number,
  cols: number,
  cellDefs: Array<{ row: number; col: number; rowSpan: number; colSpan: number }>
): GridLayout {
  const cells = cellDefs.map((cell) => ({
    id: createId('cell'),
    row: cell.row,
    col: cell.col,
    rowSpan: Math.max(1, Math.min(rows - cell.row, cell.rowSpan)),
    colSpan: Math.max(1, Math.min(cols - cell.col, cell.colSpan))
  }))

  return normalizeGridLayout({ rows, cols, cells })
}

function normalizeGridLayout(layout: GridLayout): GridLayout {
  const coverage: (string | null)[][] = Array.from({ length: layout.rows }, () =>
    Array.from({ length: layout.cols }, () => null)
  )

  const cells: GridCell[] = []

  for (const cell of layout.cells) {
    const maxRowSpan = Math.max(1, Math.min(layout.rows - cell.row, cell.rowSpan))
    const maxColSpan = Math.max(1, Math.min(layout.cols - cell.col, cell.colSpan))

    const normalizedCell: GridCell = {
      ...cell,
      rowSpan: maxRowSpan,
      colSpan: maxColSpan
    }

    let hasOverlap = false

    for (let row = normalizedCell.row; row < normalizedCell.row + normalizedCell.rowSpan; row++) {
      for (let col = normalizedCell.col; col < normalizedCell.col + normalizedCell.colSpan; col++) {
        if (coverage[row]?.[col]) {
          hasOverlap = true
          break
        }
      }
      if (hasOverlap) break
    }

    if (hasOverlap) {
      continue
    }

    for (let row = normalizedCell.row; row < normalizedCell.row + normalizedCell.rowSpan; row++) {
      for (let col = normalizedCell.col; col < normalizedCell.col + normalizedCell.colSpan; col++) {
        if (coverage[row]) {
          coverage[row][col] = normalizedCell.id
        }
      }
    }

    cells.push(normalizedCell)
  }

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      if (!coverage[row][col]) {
        cells.push({
          id: createId('cell'),
          row,
          col,
          rowSpan: 1,
          colSpan: 1
        })
      }
    }
  }

  const deduplicated = dedupeCells(cells)

  return {
    rows: layout.rows,
    cols: layout.cols,
    cells: sortCellsByPosition(deduplicated)
  }
}

function dedupeCells(cells: GridCell[]): GridCell[] {
  const map = new Map<string, GridCell>()

  for (const cell of cells) {
    const key = `${cell.row}-${cell.col}`
    map.set(key, cell)
  }

  return Array.from(map.values())
}

function sortCellsByPosition(cells: GridCell[]): GridCell[] {
  return [...cells].sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col
    }
    return a.row - b.row
  })
}

function cloneLayout(layout: GridLayout): GridLayout {
  return {
    rows: layout.rows,
    cols: layout.cols,
    cells: layout.cells.map((cell) => ({ ...cell }))
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = url
  })
}

function calculateCellRectangle(
  cell: GridCell,
  unitWidth: number,
  unitHeight: number,
  gap: number
) {
  const width = unitWidth * cell.colSpan + gap * (cell.colSpan - 1)
  const height = unitHeight * cell.rowSpan + gap * (cell.rowSpan - 1)
  const x = cell.col * (unitWidth + gap)
  const y = cell.row * (unitHeight + gap)

  return { x, y, width, height }
}
function tryUpdateCellSpan(
  layout: GridLayout,
  cellId: string,
  newRowSpan: number,
  newColSpan: number
): CellResizeResult {
  const working = cloneLayout(layout)
  const cellIndex = working.cells.findIndex((c) => c.id === cellId)

  if (cellIndex === -1) {
    return { layout, error: 'Cell not found' }
  }

  const target = working.cells[cellIndex]
  const maxRowSpan = Math.max(1, Math.min(working.rows - target.row, newRowSpan))
  const maxColSpan = Math.max(1, Math.min(working.cols - target.col, newColSpan))

  const proposedRect = {
    top: target.row,
    left: target.col,
    bottom: target.row + maxRowSpan - 1,
    right: target.col + maxColSpan - 1
  }

  const remainingCells: GridCell[] = []

  for (const cell of working.cells) {
    if (cell.id === target.id) {
      continue
    }

    const existingRect = {
      top: cell.row,
      left: cell.col,
      bottom: cell.row + cell.rowSpan - 1,
      right: cell.col + cell.colSpan - 1
    }

    const intersects = !(
      existingRect.right < proposedRect.left ||
      existingRect.left > proposedRect.right ||
      existingRect.bottom < proposedRect.top ||
      existingRect.top > proposedRect.bottom
    )

    if (!intersects) {
      remainingCells.push(cell)
      continue
    }

    const fullyContained =
      existingRect.left >= proposedRect.left &&
      existingRect.right <= proposedRect.right &&
      existingRect.top >= proposedRect.top &&
      existingRect.bottom <= proposedRect.bottom

    if (!fullyContained) {
      return { layout, error: 'overlap' }
    }
  }

  const updatedCell: GridCell = {
    ...target,
    rowSpan: maxRowSpan,
    colSpan: maxColSpan
  }

  const normalized = normalizeGridLayout({
    rows: working.rows,
    cols: working.cols,
    cells: [updatedCell, ...remainingCells]
  })

  return { layout: normalized }
}

function assignImageToCell(layout: GridLayout, cellId: string, imageId?: string): GridLayout {
  const next = cloneLayout(layout)
  next.cells = next.cells.map((cell) =>
    cell.id === cellId
      ? {
          ...cell,
          imageId
        }
      : cell
  )
  return next
}

function shuffleArray<T>(input: T[]): T[] {
  const array = [...input]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function autoFillGrid(layout: GridLayout, images: UploadedImage[]): GridLayout {
  const next = cloneLayout(layout)
  const imageIds = new Set(images.map((image) => image.id))

  const sanitizedCells = next.cells.map((cell) =>
    cell.imageId && imageIds.has(cell.imageId)
      ? cell
      : {
          ...cell,
          imageId: undefined
        }
  )

  const alreadyUsed = new Set(
    sanitizedCells
      .map((cell) => cell.imageId)
      .filter((value): value is string => Boolean(value))
  )

  const availableIds = shuffleArray(
    images
      .map((image) => image.id)
      .filter((id) => !alreadyUsed.has(id))
  )

  const filledCells = sanitizedCells.map((cell) => {
    if (cell.imageId) {
      return cell
    }

    const imageId = availableIds.shift()

    if (!imageId) {
      return cell
    }

    return {
      ...cell,
      imageId
    }
  })

  return {
    ...next,
    cells: filledCells
  }
}

function formatFileSize(size: number, t: ReturnType<typeof useTranslations>) {
  if (size >= 1024 * 1024) {
    return t('gridPage.common.sizeMb', { value: (size / (1024 * 1024)).toFixed(1) })
  }
  if (size >= 1024) {
    return t('gridPage.common.sizeKb', { value: (size / 1024).toFixed(1) })
  }
  return t('gridPage.common.sizeBytes', { value: size })
}
export function GridCollagePage() {
  const t = useTranslations()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [grid, setGrid] = useState<GridLayout>(() => GRID_TEMPLATES[0].createLayout())
  const [selectedTemplate, setSelectedTemplate] = useState<string>(GRID_TEMPLATES[0].id)
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  const [layoutError, setLayoutError] = useState<string | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState<string>(OUTPUT_PRESETS[0].id)
  const [customSize, setCustomSize] = useState<{ width: number; height: number }>({
    width: OUTPUT_PRESETS[0].width,
    height: OUTPUT_PRESETS[0].height
  })
  const [gap, setGap] = useState<number>(16)
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff')
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [exportQuality, setExportQuality] = useState<number>(Math.round(QUALITY_DEFAULT * 100))
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null)

  const imageUrlMap = useRef<Map<string, string>>(new Map())


  useEffect(() => {
    if (selectedCellId) {
      const exists = grid.cells.find((cell) => cell.id === selectedCellId)
      if (!exists) {
        setSelectedCellId(grid.cells[0]?.id ?? null)
      }
    } else {
      setSelectedCellId(grid.cells[0]?.id ?? null)
    }
  }, [grid, selectedCellId])

  useEffect(() => {
    setGrid((prev) => autoFillGrid(prev, images))
  }, [images])

  useEffect(() => {
    const store = imageUrlMap.current
    return () => {
      store.forEach((url) => URL.revokeObjectURL(url))
      store.clear()
    }
  }, [])

  const activeCell = useMemo(
    () => (selectedCellId ? grid.cells.find((cell) => cell.id === selectedCellId) ?? null : null),
    [grid, selectedCellId]
  )

  const imageMap = useMemo(() => {
    const map = new Map<string, UploadedImage>()
    images.forEach((image) => map.set(image.id, image))
    return map
  }, [images])

  const activePreset = useMemo(
    () => OUTPUT_PRESETS.find((preset) => preset.id === selectedPresetId),
    [selectedPresetId]
  )

  const outputSize = useMemo(() => {
    if (selectedPresetId === 'custom') {
      return customSize
    }
    return {
      width: activePreset?.width ?? OUTPUT_PRESETS[0].width,
      height: activePreset?.height ?? OUTPUT_PRESETS[0].height
    }
  }, [selectedPresetId, customSize, activePreset])

  const appliedTemplate = useMemo(
    () => GRID_TEMPLATES.find((template) => template.id === selectedTemplate),
    [selectedTemplate]
  )

  const templateName = appliedTemplate ? t(appliedTemplate.labelKey) : ''

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return
      }

      const newImages: UploadedImage[] = Array.from(files).map((file) => ({
        id: createId('image'),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }))

      newImages.forEach((image) => imageUrlMap.current.set(image.id, image.url))
      setImages((prev) => [...prev, ...newImages])
    },
    []
  )

  const handleTemplateChange = (templateId: string) => {
    const template = GRID_TEMPLATES.find((item) => item.id === templateId)
    if (!template) return

    const freshLayout = template.createLayout()
    const reassigned = autoFillGrid(freshLayout, images)
    setGrid(reassigned)
    setSelectedTemplate(templateId)
    setSelectedCellId(reassigned.cells[0]?.id ?? null)
    setLayoutError(null)
  }

  const handleCellSpanChange = useCallback(
    (cellId: string, type: 'row' | 'col', value: number) => {
      setGrid((prev) => {
        const target = prev.cells.find((cell) => cell.id === cellId)
        if (!target) return prev

        const nextRowSpan = type === 'row' ? value : target.rowSpan
        const nextColSpan = type === 'col' ? value : target.colSpan

        const result = tryUpdateCellSpan(prev, cellId, nextRowSpan, nextColSpan)

        if (result.error) {
          setLayoutError(result.error)
          return prev
        }

        setLayoutError(null)
        return result.layout
      })
    },
    []
  )

  const handleAssignImageToCell = useCallback(
    (cellId: string, imageId?: string) => {
      setGrid((prev) => assignImageToCell(prev, cellId, imageId))
    },
    []
  )

  const handleRemoveImage = useCallback(
    (cellId: string) => {
      handleAssignImageToCell(cellId, undefined)
    },
    [handleAssignImageToCell]
  )
  const handleClearImages = useCallback(() => {
    imageUrlMap.current.forEach((url) => URL.revokeObjectURL(url))
    imageUrlMap.current.clear()
    setImages([])
    setGrid((prev) => ({
      ...prev,
      cells: prev.cells.map((cell) => ({
        ...cell,
        imageId: undefined
      }))
    }))
  }, [])

  const handlePresetChange = useCallback((value: string) => {
    setSelectedPresetId(value)
    if (value !== 'custom') {
      const preset = OUTPUT_PRESETS.find((item) => item.id === value)
      if (preset) {
        setCustomSize({ width: preset.width, height: preset.height })
      }
    }
  }, [])

  const downloadCanvas = useCallback(
    (canvas: HTMLCanvasElement, format: 'png' | 'jpeg') => {
      const mime = format === 'png' ? 'image/png' : 'image/jpeg'
      const quality = format === 'jpeg' ? Math.min(Math.max(exportQuality / 100, 0.1), 1) : undefined
      const dataUrl = canvas.toDataURL(mime, quality)
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `collage-${Date.now()}.${format === 'png' ? 'png' : 'jpg'}`
      link.click()
      link.remove()
    },
    [exportQuality]
  )

  const handleExport = useCallback(
    async (format: 'png' | 'jpeg') => {
      if (grid.cells.length === 0) {
        return
      }

      setIsExporting(true)
      try {
        const { width, height } = outputSize
        const gapPx = Math.max(0, Math.round(gap))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('Canvas not supported')
        }

        context.fillStyle = backgroundColor
        context.fillRect(0, 0, width, height)

        const totalGapX = (grid.cols - 1) * gapPx
        const totalGapY = (grid.rows - 1) * gapPx
        const unitWidth = (width - totalGapX) / grid.cols
        const unitHeight = (height - totalGapY) / grid.rows

        const cellsWithImages = grid.cells.map((cell) => ({
          cell,
          image: cell.imageId ? imageMap.get(cell.imageId) : undefined
        }))

        const uniqueImageIds = Array.from(
          new Set(
            cellsWithImages
              .map((item) => item.image?.id)
              .filter((value): value is string => Boolean(value))
          )
        )

        const loadedImages = await Promise.all(
          uniqueImageIds.map(async (imageId) => {
            const image = imageMap.get(imageId)
            if (!image) return null
            try {
              const bitmap = await loadImage(image.url)
              return { imageId, bitmap }
            } catch (error) {
              console.error('Failed to load image', error)
              return null
            }
          })
        )

        const bitmapMap = new Map<string, HTMLImageElement>()
        loadedImages.forEach((item) => {
          if (!item) return
          bitmapMap.set(item.imageId, item.bitmap)
        })

        cellsWithImages.forEach(({ cell, image }) => {
          const { x, y, width: cellWidth, height: cellHeight } = calculateCellRectangle(
            cell,
            unitWidth,
            unitHeight,
            gapPx
          )

          if (image && bitmapMap.has(image.id)) {
            const bitmap = bitmapMap.get(image.id)!
            const ratio = Math.max(cellWidth / bitmap.width, cellHeight / bitmap.height)
            const drawWidth = bitmap.width * ratio
            const drawHeight = bitmap.height * ratio
            const offsetX = x + (cellWidth - drawWidth) / 2
            const offsetY = y + (cellHeight - drawHeight) / 2

            context.drawImage(bitmap, offsetX, offsetY, drawWidth, drawHeight)
          } else {
            context.fillStyle = '#f3f4f6'
            context.fillRect(x, y, cellWidth, cellHeight)
          }
        })

        downloadCanvas(canvas, format)
      } catch (error) {
        console.error('Failed to export collage', error)
      } finally {
        setIsExporting(false)
      }
    },
    [backgroundColor, downloadCanvas, gap, grid, imageMap, outputSize]
  )

  const handleDragStart = useCallback((imageId: string) => {
    setDraggedImageId(imageId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedImageId(null)
  }, [])

  const handleDragOverCell = useCallback((cellId: string) => {
    setHoveredCellId(cellId)
  }, [])

  const handleDragLeaveCell = useCallback(() => {
    setHoveredCellId(null)
  }, [])

  const handleDropOnCell = useCallback(
    (cellId: string) => {
      if (draggedImageId) {
        handleAssignImageToCell(cellId, draggedImageId)
      }
      setDraggedImageId(null)
      setHoveredCellId(null)
    },
    [draggedImageId, handleAssignImageToCell]
  )

  const layoutMessage = useMemo(() => {
    if (!layoutError) return null
    if (layoutError === 'overlap') {
      return t('gridPage.messages.overlapError')
    }
    return layoutError
  }, [layoutError, t])

  const unassignedImages = useMemo(() => {
    const assignedIds = new Set(
      grid.cells
        .map((cell) => cell.imageId)
        .filter((value): value is string => Boolean(value))
    )
    return images.filter((image) => !assignedIds.has(image.id))
  }, [grid.cells, images])

  const assignedCount = grid.cells.filter((cell) => cell.imageId).length
  return (
    <div className="space-y-10">
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('gridPage.hero.title')}
              </h1>
              <p className="text-gray-600">
                {t('gridPage.hero.description')}
              </p>
            </div>

            {appliedTemplate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                <p className="font-medium text-blue-800 mb-1">{t(appliedTemplate.labelKey)}</p>
                <p>{t(appliedTemplate.descriptionKey)}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
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
                  {t('gridPage.stats.template', { name: templateName })}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {t('gridPage.stats.templateHint')}
                </p>
              </Card>
            </div>
          </div>

          <div className="md:w-1/3 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {t('gridPage.upload.heading')}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('gridPage.upload.hint')}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleFilesSelected(event.target.files)}
                  />
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-4 4m4-4l4 4m2 8H6a2 2 0 01-2-2V8a2 2 0 012-2h3l2-2h2l2 2h3a2 2 0 012 2v10a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium text-gray-700">{t('gridPage.upload.selectButton')}</span>
                  <span className="text-xs text-gray-500">{t('gridPage.upload.supported')}</span>
                </label>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setGrid((prev) => autoFillGrid(prev, images))}
                    disabled={images.length === 0}
                  >
                    {t('gridPage.upload.autoFill')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={handleClearImages}
                    disabled={images.length === 0}
                  >
                    {t('gridPage.upload.clear')}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t('gridPage.layout.sizeHeading')}
                </Label>
                <Select value={selectedPresetId} onValueChange={handlePresetChange}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTPUT_PRESETS.map((preset) => (
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
                        setCustomSize((prev) => ({
                          ...prev,
                          width: Number(event.target.value) || prev.width
                        }))
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
                        setCustomSize((prev) => ({
                          ...prev,
                          height: Number(event.target.value) || prev.height
                        }))
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
                  onValueChange={([value]) => setGap(value)}
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
                    onChange={(event) => setBackgroundColor(event.target.value)}
                    className="h-10 w-16 rounded border border-gray-200"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(event) => setBackgroundColor(event.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <Card className="p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('gridPage.grid.heading')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('gridPage.grid.subheading')}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => handleTemplateChange(selectedTemplate)}>
              {t('gridPage.grid.resetTemplate')}
            </Button>
          </div>

          {layoutMessage && (
            <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              {layoutMessage}
            </div>
          )}

          <div
            className="relative bg-[length:20px_20px] rounded-xl border border-gray-200 p-4"
            style={{ backgroundColor }}
          >
            <div
              className="grid w-full aspect-square"
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
                      'relative rounded-lg transition-all border-2 overflow-hidden group bg-white flex items-center justify-center text-sm text-gray-400',
                      isSelected ? 'border-blue-500 shadow-inner shadow-blue-200/40' : 'border-transparent',
                      isDropTarget ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent' : ''
                    )}
                    style={{
                      gridColumn: `span ${cell.colSpan} / span ${cell.colSpan}`,
                      gridRow: `span ${cell.rowSpan} / span ${cell.rowSpan}`
                    }}
                    onClick={() => setSelectedCellId(cell.id)}
                    onDragOver={(event) => {
                      event.preventDefault()
                      handleDragOverCell(cell.id)
                    }}
                    onDragLeave={handleDragLeaveCell}
                    onDrop={(event) => {
                      event.preventDefault()
                      handleDropOnCell(cell.id)
                    }}
                  >
                    {image ? (
                      <>
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
                            handleRemoveImage(cell.id)
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
        </Card>

        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {t('gridPage.templates.heading')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('gridPage.templates.subheading')}
              </p>
            </div>

            <div className="space-y-3">
              {GRID_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateChange(template.id)}
                  className={cn(
                    'w-full border rounded-lg p-3 text-left transition hover:border-blue-400 hover:bg-blue-50',
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50/70'
                      : 'border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {t(template.labelKey)}
                    </span>
                    {selectedTemplate === template.id && (
                      <span className="text-xs font-semibold text-blue-600">
                        {t('gridPage.templates.active')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t(template.descriptionKey)}
                  </p>
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const defaultLayout = createDefaultGridLayout(DEFAULT_ROWS, DEFAULT_COLS)
                setGrid(autoFillGrid(defaultLayout, images))
                setSelectedTemplate('classic')
              }}
            >
              {t('gridPage.templates.reset')}
            </Button>
          </Card>

          <Card className="p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {t('gridPage.cells.heading')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('gridPage.cells.subheading')}
              </p>
            </div>

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
                      onValueChange={(value) => handleCellSpanChange(activeCell.id, 'row', Number(value))}
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
                      onValueChange={(value) => handleCellSpanChange(activeCell.id, 'col', Number(value))}
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
                  onClick={() => setGrid((prev) => ({
                    ...prev,
                    cells: prev.cells.map((cell) =>
                      cell.id === activeCell.id
                        ? {
                            ...cell,
                            rowSpan: 1,
                            colSpan: 1
                          }
                        : cell
                    )
                  }))}
                >
                  {t('gridPage.cells.resetCell')}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {t('gridPage.cells.noSelection')}
              </p>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {t('gridPage.images.heading')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('gridPage.images.subheading')}
              </p>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {images.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  {t('gridPage.images.empty')}
                </div>
              ) : (
                images.map((image) => {
                  const isAssigned = grid.cells.some((cell) => cell.imageId === image.id)

                  return (
                    <div
                      key={image.id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition bg-white',
                        isAssigned ? 'border-blue-200 bg-blue-50/60' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/60'
                      )}
                      draggable
                      onDragStart={() => handleDragStart(image.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (selectedCellId) {
                          handleAssignImageToCell(selectedCellId, image.id)
                        }
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="h-14 w-14 rounded object-cover border border-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-gray-800">{image.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(image.size, t)}</p>
                      </div>
                      {isAssigned ? (
                        <span className="text-xs font-semibold text-blue-600">
                          {t('gridPage.images.assignedBadge')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {t('gridPage.images.dragBadge')}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {unassignedImages.length > 0 && (
              <div className="text-xs text-gray-500">
                {t('gridPage.images.unassigned', { count: unassignedImages.length })}
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {t('gridPage.export.heading')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('gridPage.export.subheading')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => handleExport('png')}
                disabled={isExporting}
              >
                {t('gridPage.export.exportPng')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleExport('jpeg')}
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
                onValueChange={([value]) => setExportQuality(value)}
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
          </Card>
        </div>
      </section>
    </div>
  )
}
