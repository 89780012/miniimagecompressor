import { NextRequest, NextResponse } from 'next/server'
import { generateR2Key } from '@/lib/r2'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// 配置R2客户端
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize } = await request.json()

    // 验证输入
    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json({
        error: '缺少必要参数',
        details: '需要提供 fileName, fileType, fileSize'
      }, { status: 400 })
    }

    // 检查文件大小限制 (100MB for direct upload)
    const maxFileSize = 100 * 1024 * 1024 // 100MB
    if (fileSize > maxFileSize) {
      return NextResponse.json({
        error: '文件过大',
        details: `文件大小不能超过 100MB，当前文件大小: ${(fileSize / 1024 / 1024).toFixed(2)}MB`
      }, { status: 413 })
    }

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({
        error: '不支持的文件类型',
        details: `支持的格式: JPEG, PNG, WebP。当前文件类型: ${fileType}`
      }, { status: 400 })
    }

    // 生成R2存储键名
    const r2Key = generateR2Key(fileName, 'original')

    // 创建PUT对象命令
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: r2Key,
      ContentType: fileType,
      ContentLength: fileSize,
    })

    // 生成预签名URL (5分钟有效期)
    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 300, // 5 minutes
    })

    // 生成公开访问URL
    const publicUrl = process.env.R2_PUBLIC_DOMAIN
      ? `https://${process.env.R2_PUBLIC_DOMAIN}/${encodeURIComponent(r2Key)}`
      : `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${encodeURIComponent(r2Key)}`

    return NextResponse.json({
      presignedUrl,
      r2Key,
      publicUrl,
      expiresIn: 300
    })

  } catch (error) {
    console.error('生成预签名URL失败:', error)
    return NextResponse.json({
      error: '生成预签名URL失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}