'use client'

import { useState, useCallback } from 'react'

export interface DownloadState {
  isDownloading: boolean
  current: number
  total: number
  currentFile: string
  error?: string
}

export function useDownloadProgress() {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    current: 0,
    total: 0,
    currentFile: ''
  })

  const startDownload = useCallback((total: number) => {
    setDownloadState({
      isDownloading: true,
      current: 0,
      total,
      currentFile: '准备下载...',
      error: undefined
    })
  }, [])

  const updateProgress = useCallback((current: number, total: number, currentFile: string) => {
    setDownloadState(prev => ({
      ...prev,
      current,
      total,
      currentFile
    }))
  }, [])

  const completeDownload = useCallback((success: boolean, error?: string) => {
    setDownloadState(prev => ({
      ...prev,
      isDownloading: false,
      error: success ? undefined : error
    }))
  }, [])

  const resetDownload = useCallback(() => {
    setDownloadState({
      isDownloading: false,
      current: 0,
      total: 0,
      currentFile: ''
    })
  }, [])

  return {
    downloadState,
    startDownload,
    updateProgress,
    completeDownload,
    resetDownload
  }
}