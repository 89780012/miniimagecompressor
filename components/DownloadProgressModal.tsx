'use client'

import { CheckCircle, Download, X, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DownloadProgressModalProps {
  isOpen: boolean
  current: number
  total: number
  currentFile: string
  isDownloading: boolean
  error?: string
  onClose: () => void
}

export function DownloadProgressModal({
  isOpen,
  current,
  total,
  currentFile,
  isDownloading,
  error,
  onClose
}: DownloadProgressModalProps) {
  const t = useTranslations()
  
  if (!isOpen) return null

  const progress = total > 0 ? (current / total) * 100 : 0
  const isCompleted = !isDownloading && !error && total > 0
  const hasError = !isDownloading && error

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Download className="w-5 h-5 text-blue-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {hasError ? t('downloadProgress.failed') : isCompleted ? t('downloadProgress.completed') : t('downloadProgress.downloading')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isDownloading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {hasError ? (
          <div className="text-red-600 text-sm mb-4">
            {error}
          </div>
        ) : isCompleted ? (
          <div className="text-green-600 text-sm mb-4">
            {t('downloadProgress.successMessage')}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{t('downloadProgress.progress')}</span>
                <span>{current}/{total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500 truncate">
                {currentFile}
              </div>
            </div>
          </>
        )}

        {(isCompleted || hasError) && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {t('downloadProgress.confirm')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}