import { CompressionResult } from './compression'
import { CompressionSettings } from '@/types/image'

const STORAGE_KEY = 'imageCompression_history'
const MAX_HISTORY_ITEMS = 100

export interface HistoryItem {
  id: string
  compressionResult: CompressionResult
  settings: CompressionSettings
  createdAt: string
  isExpired: boolean
}

export interface HistoryStats {
  totalItems: number
  totalOriginalSize: number
  totalCompressedSize: number
  totalSaved: number
  totalSavedPercentage: number
}

// 保存压缩记录到历史
export function saveToHistory(
  result: CompressionResult, 
  settings: CompressionSettings
): void {
  try {
    const history = getHistory()
    
    const historyItem: HistoryItem = {
      id: `${result.id}_${Date.now()}`,
      compressionResult: result,
      settings,
      createdAt: new Date().toISOString(),
      isExpired: false
    }
    
    // 添加到数组开头
    history.unshift(historyItem)
    
    // 限制历史记录数量
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory))
  } catch (error) {
    console.error('Failed to save to history:', error)
  }
}

// 获取历史记录
export function getHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const history: HistoryItem[] = JSON.parse(stored)
    
    // 检查并更新过期状态
    const updatedHistory = history.map(item => ({
      ...item,
      isExpired: isHistoryItemExpired(item)
    }))
    
    return updatedHistory
  } catch (error) {
    console.error('Failed to get history:', error)
    return []
  }
}

// 检查历史记录项是否过期
export function isHistoryItemExpired(item: HistoryItem): boolean {
  if (!item.compressionResult.expiresAt) return false
  
  const expirationDate = new Date(item.compressionResult.expiresAt)
  return new Date() > expirationDate
}

// 清除历史记录
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear history:', error)
  }
}

// 删除单个历史记录
export function removeHistoryItem(id: string): void {
  try {
    const history = getHistory()
    const filteredHistory = history.filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory))
  } catch (error) {
    console.error('Failed to remove history item:', error)
  }
}

// 清除过期的历史记录
export function clearExpiredHistory(): void {
  try {
    const history = getHistory()
    const validHistory = history.filter(item => !isHistoryItemExpired(item))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validHistory))
  } catch (error) {
    console.error('Failed to clear expired history:', error)
  }
}

// 获取历史统计信息
export function getHistoryStats(): HistoryStats {
  const history = getHistory()
  const validHistory = history.filter(item => !item.isExpired)
  
  if (validHistory.length === 0) {
    return {
      totalItems: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalSaved: 0,
      totalSavedPercentage: 0
    }
  }
  
  const totalOriginalSize = validHistory.reduce(
    (sum, item) => sum + (item.compressionResult.original.fileSize || 0), 0
  )
  
  const totalCompressedSize = validHistory.reduce(
    (sum, item) => sum + (item.compressionResult.compressed.fileSize || 0), 0
  )
  
  const totalSaved = totalOriginalSize - totalCompressedSize
  const totalSavedPercentage = totalOriginalSize > 0 
    ? Math.round((totalSaved / totalOriginalSize) * 100 * 100) / 100
    : 0
  
  return {
    totalItems: validHistory.length,
    totalOriginalSize,
    totalCompressedSize,
    totalSaved,
    totalSavedPercentage
  }
}

// 检查是否支持 localStorage
export function isHistorySupported(): boolean {
  try {
    const testKey = 'test_localStorage'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

// 格式化文件大小
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// 获取相对时间描述
export function getRelativeTimeString(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  if (diffInHours < 24) return `${diffInHours}小时前`
  if (diffInDays < 30) return `${diffInDays}天前`
  
  return date.toLocaleDateString()
}