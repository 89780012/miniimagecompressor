import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Cloudflare R2配置
const R2_CONFIG = {
  region: 'auto', // Cloudflare R2使用'auto'
  endpoint: process.env.R2_ENDPOINT, // 例如: https://xxx.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME!
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN // 可选：自定义域名

// 初始化S3客户端（兼容R2）
const r2Client = new S3Client(R2_CONFIG)

/**
 * 上传文件到R2
 * @param key - 文件在R2中的键名
 * @param buffer - 文件数据
 * @param contentType - MIME类型
 * @returns 上传结果
 */
export async function uploadToR2(
  key: string, 
  buffer: Buffer, 
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1年缓存
    })

    await r2Client.send(command)
    
    // 构建公开访问URL
    const publicUrl = PUBLIC_DOMAIN 
      ? `https://${PUBLIC_DOMAIN}/${key}`
      : `${R2_CONFIG.endpoint}/${BUCKET_NAME}/${key}`

    return { 
      success: true, 
      url: publicUrl 
    }
  } catch (error) {
    console.error('R2上传失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '上传失败' 
    }
  }
}

/**
 * 从R2删除文件
 * @param key - 文件在R2中的键名
 * @returns 删除结果
 */
export async function deleteFromR2(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
    return { success: true }
  } catch (error) {
    console.error('R2删除失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '删除失败' 
    }
  }
}

/**
 * 生成R2文件的预签名URL（用于临时访问）
 * @param key - 文件在R2中的键名
 * @param expiresIn - 过期时间（秒），默认1小时
 * @returns 预签名URL
 */
export async function getSignedUrlFromR2(
  key: string, 
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

/**
 * 生成唯一的R2文件键名
 * @param originalFileName - 原始文件名
 * @param prefix - 前缀（如'original'或'compressed'）
 * @returns 唯一键名
 */
export function generateR2Key(originalFileName: string, prefix: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = originalFileName.split('.').pop()
  const baseName = originalFileName.replace(/\.[^/.]+$/, '')
  
  // 格式: images/{year}/{month}/{prefix}_{timestamp}_{random}_{basename}.{ext}
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  return `images/${year}/${month}/${prefix}_${timestamp}_${randomStr}_${baseName}.${extension}`
}

/**
 * 批量删除R2文件
 * @param keys - 要删除的文件键名数组
 * @returns 删除结果
 */
export async function batchDeleteFromR2(
  keys: string[]
): Promise<{ success: boolean; deletedCount: number; errors: string[] }> {
  const results = await Promise.allSettled(
    keys.map(key => deleteFromR2(key))
  )
  
  let deletedCount = 0
  const errors: string[] = []
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      deletedCount++
    } else {
      const error = result.status === 'rejected' 
        ? result.reason 
        : result.value.error
      errors.push(`删除 ${keys[index]} 失败: ${error}`)
    }
  })
  
  return {
    success: errors.length === 0,
    deletedCount,
    errors
  }
}