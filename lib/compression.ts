import { CompressionSettings } from '@/components/CompressionControls'

export interface CompressionResult {
  id: string
  original: {
    fileName: string
    fileSize: number
    width?: number
    height?: number
    path: string
  }
  compressed: {
    fileSize: number
    width?: number
    height?: number
    path: string
  }
  compressionRatio: number
  processingTime: number
}

export async function compressImage(
  file: File,
  settings: CompressionSettings
): Promise<CompressionResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('mode', settings.mode)
  formData.append('format', settings.format)
  
  if (settings.targetSizeKb) {
    formData.append('targetSizeKb', settings.targetSizeKb.toString())
  }
  
  if (settings.quality) {
    formData.append('quality', settings.quality.toString())
  }

  const response = await fetch('/api/compress', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '压缩失败')
  }

  return response.json()
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function calculateSavings(original: number, compressed: number): {
  savedBytes: number
  savedPercentage: number
} {
  const savedBytes = original - compressed
  const savedPercentage = (savedBytes / original) * 100
  
  return {
    savedBytes,
    savedPercentage: Math.round(savedPercentage * 100) / 100
  }
}