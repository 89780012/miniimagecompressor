// Canvas 图片合成工具函数
// 用于将网格布局中的图片合成为单张预览图

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

interface UploadedImage {
  id: string
  file: File
  url: string
  name: string
  size: number
}

interface GridCompositeOptions {
  grid: GridLayout
  images: Map<string, UploadedImage>
  backgroundColor: string
  gap: number
  outputWidth?: number
  outputHeight?: number
}

export async function generateGridComposite({
  grid,
  images,
  backgroundColor,
  gap,
  outputWidth = 600,
  outputHeight = 600
}: GridCompositeOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 创建 Canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Unable to get 2D context from canvas')
      }

      canvas.width = outputWidth
      canvas.height = outputHeight

      // 设置背景色
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, outputWidth, outputHeight)

      // 计算网格单元尺寸
      const cellWidth = (outputWidth - gap * (grid.cols - 1)) / grid.cols
      const cellHeight = (outputHeight - gap * (grid.rows - 1)) / grid.rows

      let loadedImages = 0
      const totalImages = grid.cells.filter(cell => cell.imageId && images.has(cell.imageId)).length

      // 如果没有图片需要加载，直接返回背景
      if (totalImages === 0) {
        const dataUrl = canvas.toDataURL('image/png', 1.0)
        resolve(dataUrl)
        return
      }

      // 绘制每个单元格
      grid.cells.forEach((cell) => {
        const imageData = cell.imageId ? images.get(cell.imageId) : undefined

        if (!imageData) {
          // 绘制空白单元格
          const x = cell.col * (cellWidth + gap)
          const y = cell.row * (cellHeight + gap)
          const width = cellWidth * cell.colSpan + gap * (cell.colSpan - 1)
          const height = cellHeight * cell.rowSpan + gap * (cell.rowSpan - 1)

          ctx.fillStyle = '#ffffff'
          ctx.fillRect(x, y, width, height)

          // 绘制边框
          ctx.strokeStyle = '#e5e7eb'
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, width, height)
          return
        }

        // 加载并绘制图片
        const img = new Image()
        img.onload = () => {
          const x = cell.col * (cellWidth + gap)
          const y = cell.row * (cellHeight + gap)
          const width = cellWidth * cell.colSpan + gap * (cell.colSpan - 1)
          const height = cellHeight * cell.rowSpan + gap * (cell.rowSpan - 1)

          // 计算图片适配尺寸（保持宽高比，覆盖填充）
          const imgAspect = img.width / img.height
          const cellAspect = width / height

          let drawWidth, drawHeight, drawX, drawY

          if (imgAspect > cellAspect) {
            // 图片更宽，以高度为准
            drawHeight = height
            drawWidth = height * imgAspect
            drawX = x - (drawWidth - width) / 2
            drawY = y
          } else {
            // 图片更高，以宽度为准
            drawWidth = width
            drawHeight = width / imgAspect
            drawX = x
            drawY = y - (drawHeight - height) / 2
          }

          // 先剪切到单元格区域
          ctx.save()
          ctx.beginPath()
          ctx.rect(x, y, width, height)
          ctx.clip()

          // 绘制图片
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
          ctx.restore()

          // 检查是否所有图片都已加载完成
          loadedImages++
          if (loadedImages === totalImages) {
            const dataUrl = canvas.toDataURL('image/png', 1.0)
            resolve(dataUrl)
          }
        }

        img.onerror = () => {
          console.error('Failed to load image:', imageData.url)
          loadedImages++
          if (loadedImages === totalImages) {
            const dataUrl = canvas.toDataURL('image/png', 1.0)
            resolve(dataUrl)
          }
        }

        img.crossOrigin = 'anonymous'
        img.src = imageData.url
      })
    } catch (error) {
      reject(error)
    }
  })
}

// 创建图片 URL 到 Map 的转换工具
export function createImageMap(images: UploadedImage[]): Map<string, UploadedImage> {
  const map = new Map<string, UploadedImage>()
  images.forEach((image) => map.set(image.id, image))
  return map
}