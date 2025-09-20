import { directUploadFile, compressDirectUploadedFile } from './direct-upload'

export interface CompressionSettings {
  mode: 'quality' | 'size'
  targetSizeKb?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export interface CompressionResult {
  id: string
  original: {
    fileName: string
    fileSize: number
    width?: number
    height?: number
    url: string
  }
  compressed: {
    fileSize: number
    width?: number
    height?: number
    url: string
    path?: string // 兼容现有代码
  }
  compressionRatio: number
  processingTime: number
  expiresAt: string
}

/**
 * 智能压缩函数 - 自动选择上传方式
 * 小文件(<=4MB): 通过服务器上传
 * 大文件(>4MB): 直接上传到R2
 */
export async function compressImage(
  file: File,
  settings: CompressionSettings,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  const FILE_SIZE_THRESHOLD = 4 * 1024 * 1024 // 4MB

  if (file.size <= FILE_SIZE_THRESHOLD) {
    // 小文件：使用原有的服务器上传方式
    return compressViaServer(file, settings, onProgress)
  } else {
    // 大文件：使用直接上传方式
    return compressViaDirect(file, settings, onProgress)
  }
}

/**
 * 通过服务器上传并压缩（原有方式）
 */
async function compressViaServer(
  file: File,
  settings: CompressionSettings,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', settings.mode)
    formData.append('format', settings.format || 'jpeg')

    if (settings.targetSizeKb) {
      formData.append('targetSizeKb', settings.targetSizeKb.toString())
    }
    if (settings.quality) {
      formData.append('quality', settings.quality.toString())
    }

    const xhr = new XMLHttpRequest()

    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 50 // 上传占50%
          onProgress(progress)
        }
      })
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText)

          // 统一返回格式，确保兼容性
          const normalizedResult: CompressionResult = {
            ...result,
            compressed: {
              ...result.compressed,
              path: result.compressed.url // 添加path字段兼容
            }
          }

          if (onProgress) {
            onProgress(100) // 完成
          }
          resolve(normalizedResult)
        } catch {
          reject(new Error('解析响应失败'))
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText)
          reject(new Error(error.details || error.error || '压缩失败'))
        } catch {
          reject(new Error(`HTTP ${xhr.status}: 压缩失败`))
        }
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('网络错误，压缩失败'))
    })

    xhr.open('POST', '/api/compress')
    xhr.send(formData)
  })
}

/**
 * 通过直接上传方式压缩
 */
async function compressViaDirect(
  file: File,
  settings: CompressionSettings,
  onProgress?: (progress: number) => void
): Promise<CompressionResult> {
  try {
    // 1. 直接上传到R2 (占80%进度)
    const uploadResult = await directUploadFile(file, {
      onProgress: (uploadProgress) => {
        if (onProgress) {
          const totalProgress = uploadProgress * 0.8 // 上传占80%
          onProgress(totalProgress)
        }
      }
    })

    // 2. 调用压缩API (占20%进度)
    if (onProgress) {
      onProgress(80) // 上传完成
    }

    const compressionResult = await compressDirectUploadedFile(
      uploadResult,
      file,
      {
        targetSizeKb: settings.targetSizeKb,
        quality: settings.quality,
        format: settings.format || 'jpeg',
        mode: settings.mode
      }
    )

    // 统一返回格式，确保兼容性
    const normalizedResult: CompressionResult = {
      ...compressionResult,
      compressed: {
        ...compressionResult.compressed,
        path: compressionResult.compressed.url // 添加path字段兼容
      }
    }

    if (onProgress) {
      onProgress(100) // 完成
    }

    return normalizedResult

  } catch (error) {
    throw error instanceof Error ? error : new Error('直接上传压缩失败')
  }
}