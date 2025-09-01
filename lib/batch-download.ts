import JSZip from 'jszip'
import { HistoryItem } from './history'

export interface DownloadableItem {
  id: string
  fileName: string
  url: string
  relativePath?: string
}

// 进度回调类型
export type ProgressCallback = (current: number, total: number, currentFile: string) => void

export async function downloadAsZip(
  items: DownloadableItem[], 
  zipFileName: string = `compressed_images_${Date.now()}.zip`,
  onProgress?: ProgressCallback
) {
  if (items.length === 0) {
    alert('没有可下载的文件')
    return
  }

  try {
    const zip = new JSZip()
    let successCount = 0
    
    // 下载所有文件并添加到压缩包
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // 更新进度
      if (onProgress) {
        onProgress(i, items.length, item.fileName)
      }
      
      try {
        // 直接使用API代理下载，避免CORS问题
        const proxyUrl = `/api/download?url=${encodeURIComponent(item.url)}`
        const response = await fetch(proxyUrl)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${item.fileName}: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        
        // 确定文件在压缩包中的路径
        const filePath = item.relativePath 
          ? item.relativePath.replace(/\\/g, '/') // 统一使用 / 作为路径分隔符
          : `compressed_${item.fileName}` // 单个文件上传的放在根目录
        
        zip.file(filePath, blob)
        successCount++
      } catch (error) {
        console.error(`下载文件失败: ${item.fileName}`, error)
        // 继续处理其他文件，不因单个文件失败而中断整个下载
      }
    }
    
    // 最后更新进度（压缩阶段）
    if (onProgress) {
      onProgress(items.length, items.length, '正在生成压缩包...')
    }
    
    if (successCount === 0) {
      alert('没有成功下载任何文件')
      return false
    }
    
    // 生成并下载压缩包
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = zipFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log(`压缩包下载完成，包含 ${successCount} 个文件`)
    return true
    
  } catch (error) {
    console.error('批量下载失败:', error)
    alert('批量下载失败，请重试')
    return false
  }
}

// 历史记录专用的下载函数
export async function downloadHistoryAsZip(
  historyItems: HistoryItem[], 
  onProgress?: ProgressCallback
) {
  const downloadableItems: DownloadableItem[] = historyItems
    .filter(item => item.compressionResult?.compressed?.url && !item.isExpired)
    .map(item => ({
      id: item.id,
      fileName: item.compressionResult.original.fileName,
      url: item.compressionResult.compressed.url!, // 非空断言，因为上面已经过滤了
      // 历史记录中可能没有relativePath信息，使用fileName作为根目录文件
    }))
  
  return await downloadAsZip(
    downloadableItems, 
    `history_compressed_images_${Date.now()}.zip`,
    onProgress
  )
}