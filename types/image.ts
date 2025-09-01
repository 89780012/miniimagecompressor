import { CompressionResult } from '@/lib/compression'
import { CompressionSettings } from '@/components/CompressionControls'

export interface ResizeSettings {
  width: number
  height: number
  maintainAspectRatio: boolean
  resizeMode: 'fit' | 'fill' | 'cover'
}

export interface ImageFile {
  id: string
  file: File
  preview: string
  size: number
  dimensions?: { width: number; height: number }
  settings?: CompressionSettings
  resizeSettings?: ResizeSettings
  progress: number
  status: 'pending' | 'compressing' | 'completed' | 'error'
  result?: CompressionResult
  error?: string
  relativePath?: string // 文件在文件夹中的相对路径，单个文件上传时为 undefined
}

export interface BatchProgress {
  completed: number
  total: number
  isRunning: boolean
}