// 直接上传到R2的客户端工具函数

export interface PresignedUrlResponse {
  presignedUrl: string
  r2Key: string
  publicUrl: string
  expiresIn: number
}

export interface DirectUploadOptions {
  onProgress?: (progress: number) => void
  onSuccess?: (result: { r2Key: string; publicUrl: string }) => void
  onError?: (error: Error) => void
}

/**
 * 获取预签名URL
 */
export async function getPresignedUrl(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<PresignedUrlResponse> {
  const response = await fetch('/api/upload/presigned-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName,
      fileType,
      fileSize,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || error.error || '获取预签名URL失败')
  }

  return response.json()
}

/**
 * 直接上传文件到R2
 */
export async function uploadToR2Direct(
  file: File,
  presignedUrl: string,
  options: DirectUploadOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // 监听上传进度
    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          options.onProgress!(progress)
        }
      })
    }

    // 监听完成事件
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`上传失败: HTTP ${xhr.status}`))
      }
    })

    // 监听错误事件
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误，上传失败'))
    })

    // 监听超时事件
    xhr.addEventListener('timeout', () => {
      reject(new Error('上传超时'))
    })

    // 配置请求
    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.timeout = 300000 // 5分钟超时

    // 开始上传
    xhr.send(file)
  })
}

/**
 * 完整的直接上传流程
 */
export async function directUploadFile(
  file: File,
  options: DirectUploadOptions = {}
): Promise<{ r2Key: string; publicUrl: string }> {
  try {
    // 1. 获取预签名URL
    const { presignedUrl, r2Key, publicUrl } = await getPresignedUrl(
      file.name,
      file.type,
      file.size
    )

    // 2. 直接上传到R2
    await uploadToR2Direct(file, presignedUrl, {
      onProgress: options.onProgress,
    })

    const result = { r2Key, publicUrl }

    // 3. 调用成功回调
    if (options.onSuccess) {
      options.onSuccess(result)
    }

    return result
  } catch (error) {
    const uploadError = error instanceof Error ? error : new Error('未知上传错误')

    // 调用错误回调
    if (options.onError) {
      options.onError(uploadError)
    }

    throw uploadError
  }
}

/**
 * 调用直接压缩API
 */
export async function compressDirectUploadedFile(
  uploadResult: { r2Key: string; publicUrl: string },
  file: File,
  compressionOptions: {
    targetSizeKb?: number
    quality?: number
    format?: string
    mode: 'quality' | 'size'
  }
) {
  const response = await fetch('/api/compress/direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      r2Key: uploadResult.r2Key,
      publicUrl: uploadResult.publicUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      ...compressionOptions,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.details || error.error || '压缩处理失败')
  }

  return response.json()
}