'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { HistoryItem, clearHistory, removeHistoryItem, getHistoryStats } from '@/lib/history'

interface HistoryViewProps {
  historyItems: HistoryItem[]
  onBack: () => void
  onRefresh: () => void
}

export function HistoryView({ historyItems, onBack, onRefresh }: HistoryViewProps) {
  const t = useTranslations()
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [previewImage, setPreviewImage] = useState<{url: string, fileName: string} | null>(null)
  
  const validItems = historyItems.filter(item => !item.isExpired)
  const stats = getHistoryStats()
  
  // 处理ESC键关闭预览
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null)
        } else if (showConfirmClear) {
          setShowConfirmClear(false)
        }
      }
    }
    
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [previewImage, showConfirmClear])
  
  // 清空历史记录
  const handleClearHistory = useCallback(() => {
    clearHistory()
    onRefresh()
    setShowConfirmClear(false)
  }, [onRefresh])
  
  // 删除单个历史记录
  const handleRemoveItem = useCallback((id: string) => {
    removeHistoryItem(id)
    onRefresh()
  }, [onRefresh])
  
  // 下载压缩文件
  const handleDownload = useCallback((item: HistoryItem) => {
    if (item.compressionResult.compressed.url) {
      const link = document.createElement('a')
      link.href = `/api/download?url=${encodeURIComponent(item.compressionResult.compressed.url)}`
      link.download = `compressed_${item.compressionResult.original.fileName}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [])
  
  const formatFileSize = (bytes: number): string => {
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return t('history.justNow')
    if (diffInHours < 24) return `${diffInHours}小时前`
    return date.toLocaleDateString()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('history.title')}</h2>
          {validItems.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {t('history.stats.totalProcessed')}: {stats.totalItems} | 
              {t('history.stats.totalSaved')}: {formatFileSize(stats.totalSaved)} ({stats.totalSavedPercentage}%)
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {validItems.length > 0 && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
            >
              {t('history.clear')}
            </button>
          )}
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('comparison.backToUpload')}
          </button>
        </div>
      </div>
      
      {/* 确认清空对话框 */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('history.clear')}</h3>
            <p className="text-gray-600 mb-6">{t('history.confirmClear')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                {t('common.cancel') || '取消'}
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                {t('history.clear')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 图片预览模态窗口 */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.fileName}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 rounded-b-lg">
              <p className="text-sm font-medium truncate">{previewImage.fileName}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 历史记录列表 */}
      {validItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">{t('history.empty')}</p>
          <p className="text-gray-400 text-sm mt-2">压缩图片后会在这里显示历史记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {validItems.map(item => {
            const compressionRatio = Math.round((1 - item.compressionResult.compressed.fileSize / item.compressionResult.original.fileSize) * 100)
            const isExpiringSoon = item.compressionResult.expiresAt && 
              new Date(item.compressionResult.expiresAt).getTime() - Date.now() < 2 * 60 * 60 * 1000 // 2小时内过期
            
            return (
              <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* 图片预览 */}
                    <div className="flex-shrink-0">
                      {item.compressionResult.compressed.url ? (
                        <div className="relative">
                          <img
                            src={item.compressionResult.compressed.url}
                            alt={item.compressionResult.original.fileName}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer bg-white"
                            onClick={() => setPreviewImage({
                              url: item.compressionResult.compressed.url!,
                              fileName: item.compressionResult.original.fileName
                            })}
                            onError={(e) => {
                              // 如果压缩图片加载失败，尝试原图
                              if (item.compressionResult.original.url && e.currentTarget.src !== item.compressionResult.original.url) {
                                e.currentTarget.src = item.compressionResult.original.url
                              } else {
                                // 都失败时显示占位图
                                e.currentTarget.style.display = 'none'
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                if (nextElement) {
                                  nextElement.classList.remove('hidden')
                                }
                              }
                            }}
                          />
                          {/* 图片加载失败的占位符 */}
                          <div className="hidden w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        // 图片过期时的占位符
                        <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* 文件信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.compressionResult.original.fileName}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{formatDate(item.createdAt)}</span>
                        <span>{item.settings.mode === 'quality' ? '质量模式' : '大小模式'}</span>
                        <span>{item.settings.format.toUpperCase()}</span>
                        {isExpiringSoon && (
                          <span className="text-amber-600 font-medium">即将过期</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="删除记录"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{t('comparison.original')}</p>
                    <p className="font-medium text-lg">{formatFileSize(item.compressionResult.original.fileSize)}</p>
                    {item.compressionResult.original.width && item.compressionResult.original.height && (
                      <p className="text-xs text-gray-500">
                        {item.compressionResult.original.width} × {item.compressionResult.original.height}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{t('comparison.compressed')}</p>
                    <p className="font-medium text-lg">{formatFileSize(item.compressionResult.compressed.fileSize)}</p>
                    {item.compressionResult.compressed.width && item.compressionResult.compressed.height && (
                      <p className="text-xs text-gray-500">
                        {item.compressionResult.compressed.width} × {item.compressionResult.compressed.height}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{t('comparison.saved')}</p>
                    <p className={`font-medium text-lg ${compressionRatio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {compressionRatio > 0 ? '-' : '+'}{Math.abs(compressionRatio)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {compressionRatio > 0 ? '减少' : '增加'} {formatFileSize(Math.abs(item.compressionResult.original.fileSize - item.compressionResult.compressed.fileSize))}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  {item.compressionResult.compressed.url ? (
                    <button
                      onClick={() => handleDownload(item)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t('common.download')}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-md">
                      {t('history.expired')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}