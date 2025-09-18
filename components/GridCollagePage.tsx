"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { MaterialsSidebar } from '@/components/grid-collage/MaterialsSidebar'
import { GridPreview } from '@/components/grid-collage/GridPreview'
import { ConfigSidebar } from '@/components/grid-collage/ConfigSidebar'
import { generateGridComposite, createImageMap } from '@/lib/grid-composite'

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
  // {
  //   id: 'story1080x1920',
  //   width: 1080,
  //   height: 1920,
  //   labelKey: 'gridPage.outputPresets.story'
  // },
  // {
  //   id: 'landscape1920x1080',
  //   width: 1920,
  //   height: 1080,
  //   labelKey: 'gridPage.outputPresets.landscape'
  // },
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
  const [gap, setGap] = useState<number>(8)
  const [backgroundColor, setBackgroundColor] = useState<string>('#d5d5d5')
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null)

  // 预览模式相关状态
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

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
      const quality = format === 'jpeg' ? QUALITY_DEFAULT : undefined
      const dataUrl = canvas.toDataURL(mime, quality)
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `collage-${Date.now()}.${format === 'png' ? 'png' : 'jpg'}`
      link.click()
      link.remove()
    },
    []
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

  const assignedImageIds = useMemo(() => {
    return new Set(
      grid.cells
        .map((cell) => cell.imageId)
        .filter((value): value is string => Boolean(value))
    )
  }, [grid.cells])

  const handleImageClick = useCallback(
    (imageId: string) => {
      if (selectedCellId) {
        handleAssignImageToCell(selectedCellId, imageId)
      }
    },
    [selectedCellId, handleAssignImageToCell]
  )

  const handleResetCell = useCallback(() => {
    if (activeCell) {
      setGrid((prev) => ({
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
      }))
    }
  }, [activeCell])

  // 生成预览图片
  const handleGeneratePreview = useCallback(async () => {
    if (grid.cells.length === 0) {
      return
    }

    setIsGeneratingPreview(true)
    try {
      const imageMap = createImageMap(images)
      const url = await generateGridComposite({
        grid,
        images: imageMap,
        backgroundColor,
        gap,
        outputWidth: outputSize.width,
        outputHeight: outputSize.height
      })
      setPreviewImageUrl(url)
    } catch (error) {
      console.error('Preview generation failed:', error)
    } finally {
      setIsGeneratingPreview(false)
    }
  }, [grid, images, backgroundColor, gap, outputSize])

  // 切换预览模式
  const handleTogglePreview = useCallback((isPreview: boolean) => {
    setPreviewMode(isPreview)
    // 如果从预览模式切换到编辑模式，清除预览图片以节省内存
    if (!isPreview && previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl)
      setPreviewImageUrl(null)
    }
  }, [previewImageUrl])

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <MaterialsSidebar
          images={images}
          onFilesSelected={handleFilesSelected}
          onClearImages={handleClearImages}
          onAutoFill={() => setGrid((prev) => autoFillGrid(prev, images))}
          onImageDragStart={handleDragStart}
          onImageDragEnd={handleDragEnd}
          onImageClick={handleImageClick}
          draggedImageId={draggedImageId}
          selectedCellId={selectedCellId}
          assignedImageIds={assignedImageIds}
        />

        <SidebarInset className="flex-1 min-w-0" style={{ marginLeft: '20rem', marginRight: '20rem' }}>
          <GridPreview
            grid={grid}
            images={images}
            selectedCellId={selectedCellId}
            hoveredCellId={hoveredCellId}
            backgroundColor={backgroundColor}
            gap={gap}
            layoutError={layoutMessage}
            onCellSelect={setSelectedCellId}
            onDragOverCell={handleDragOverCell}
            onDragLeaveCell={handleDragLeaveCell}
            onDropOnCell={handleDropOnCell}
            onRemoveImage={handleRemoveImage}
            draggedImageId={draggedImageId}
            previewMode={previewMode}
            isGeneratingPreview={isGeneratingPreview}
            previewImageUrl={previewImageUrl}
            onTogglePreview={handleTogglePreview}
            onGeneratePreview={handleGeneratePreview}
            isExporting={isExporting}
            onExport={handleExport}
          />
        </SidebarInset>

        <ConfigSidebar
          selectedTemplate={selectedTemplate}
          templates={GRID_TEMPLATES}
          selectedPresetId={selectedPresetId}
          customSize={customSize}
          gap={gap}
          backgroundColor={backgroundColor}
          activeCell={activeCell}
          grid={grid}
          outputPresets={OUTPUT_PRESETS}
          onTemplateChange={handleTemplateChange}
          onResetTemplate={() => handleTemplateChange(selectedTemplate)}
          onPresetChange={handlePresetChange}
          onCustomSizeChange={setCustomSize}
          onGapChange={setGap}
          onBackgroundColorChange={setBackgroundColor}
          onCellSpanChange={handleCellSpanChange}
          onResetCell={handleResetCell}
        />
      </div>
    </SidebarProvider>
  )
}