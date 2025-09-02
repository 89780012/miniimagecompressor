import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'
import { uploadToR2, generateR2Key } from '@/lib/r2'
import { ResizeMode } from '@/lib/generated/prisma'

interface ResizeSettings {
  width: number
  height: number
  maintainAspectRatio: boolean
  resizeMode: 'fit' | 'fill' | 'cover'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const settingsStr = formData.get('settings') as string

    if (!file) {
      return NextResponse.json({ error: '没有文件上传' }, { status: 400 })
    }

    if (!settingsStr) {
      return NextResponse.json({ error: '缺少调整设置参数' }, { status: 400 })
    }

    const settings: ResizeSettings = JSON.parse(settingsStr)

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '仅支持图片文件' }, { status: 400 })
    }

    // 支持的格式检查
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
    if (!supportedFormats.includes(file.type)) {
      return NextResponse.json({ 
        error: '不支持的图片格式，仅支持 JPEG, PNG, WebP, GIF, BMP' 
      }, { status: 400 })
    }

    // SVG文件需要特殊处理
    if (file.type === 'image/svg+xml') {
      return NextResponse.json({ 
        error: 'SVG文件调整尺寸功能正在开发中' 
      }, { status: 400 })
    }

    // 转换文件为 Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 获取原始图片信息
    const metadata = await sharp(buffer).metadata()
    const originalFileSize = buffer.length

    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: '无法获取图片尺寸信息' }, { status: 400 })
    }

    // 生成R2存储键名
    const originalR2Key = generateR2Key(file.name, 'original')
    
    // 上传原始文件到R2
    const originalUploadResult = await uploadToR2(originalR2Key, buffer, file.type)
    if (!originalUploadResult.success) {
      return NextResponse.json({ 
        error: '原始文件上传失败', 
        details: originalUploadResult.error 
      }, { status: 500 })
    }

    // 创建数据库记录
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24小时后过期

    // 映射resizeMode字符串到Prisma枚举
    const resizeModeMapping: Record<string, ResizeMode> = {
      'fit': ResizeMode.FIT,
      'fill': ResizeMode.FILL,
      'cover': ResizeMode.COVER
    }
    
    const resize = await prisma.imageResize.create({
      data: {
        originalFileName: file.name,
        originalFileSize: originalFileSize,
        originalMimeType: file.type,
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        originalR2Key: originalR2Key,
        originalR2Url: originalUploadResult.url,
        targetWidth: settings.width,
        targetHeight: settings.height,
        maintainAspectRatio: settings.maintainAspectRatio,
        resizeMode: resizeModeMapping[settings.resizeMode],
        status: 'PROCESSING',
        expiresAt: expiresAt
      }
    })

    let processedBuffer: Buffer
    let actualWidth: number
    let actualHeight: number

    try {
      // 使用Sharp进行图片尺寸调整
      let sharpInstance = sharp(buffer)

      if (settings.maintainAspectRatio) {
        // 保持宽高比的调整
        switch (settings.resizeMode) {
          case 'fit':
            // 适应模式：图片完全显示在指定尺寸内
            sharpInstance = sharpInstance.resize(settings.width, settings.height, {
              fit: 'inside',
              withoutEnlargement: false
            })
            break
          case 'fill':
            // 填充模式：填满指定尺寸，可能会裁剪
            sharpInstance = sharpInstance.resize(settings.width, settings.height, {
              fit: 'cover',
              position: 'center'
            })
            break
          case 'cover':
            // 覆盖模式：图片覆盖整个区域
            sharpInstance = sharpInstance.resize(settings.width, settings.height, {
              fit: 'cover',
              position: 'center'
            })
            break
        }
      } else {
        // 不保持宽高比，强制调整为指定尺寸
        sharpInstance = sharpInstance.resize(settings.width, settings.height, {
          fit: 'fill'
        })
      }

      // 根据原始格式输出
      if (file.type === 'image/png') {
        sharpInstance = sharpInstance.png({ quality: 90 })
      } else if (file.type === 'image/webp') {
        sharpInstance = sharpInstance.webp({ quality: 90 })
      } else if (file.type === 'image/gif') {
        // GIF处理需要特殊考虑，这里暂时转为PNG
        sharpInstance = sharpInstance.png({ quality: 90 })
      } else {
        // 默认JPEG
        sharpInstance = sharpInstance.jpeg({ quality: 90 })
      }

      processedBuffer = await sharpInstance.toBuffer()
      
      // 获取调整后的实际尺寸
      const resizedMetadata = await sharp(processedBuffer).metadata()
      actualWidth = resizedMetadata.width || settings.width
      actualHeight = resizedMetadata.height || settings.height

    } catch (error) {
      console.error('图片处理失败:', error)
      await prisma.imageResize.update({
        where: { id: resize.id },
        data: { 
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : '图片处理失败'
        }
      })
      return NextResponse.json({ error: '图片调整尺寸失败' }, { status: 500 })
    }

    // 生成调整后的文件键名
    const resizedR2Key = generateR2Key(file.name, 'resized')
    
    // 上传调整后的文件到R2
    const resizedUploadResult = await uploadToR2(resizedR2Key, processedBuffer, file.type)
    if (!resizedUploadResult.success) {
      await prisma.imageResize.update({
        where: { id: resize.id },
        data: { 
          status: 'FAILED',
          errorMessage: '调整后文件上传失败'
        }
      })
      return NextResponse.json({ 
        error: '调整后文件上传失败', 
        details: resizedUploadResult.error 
      }, { status: 500 })
    }

    // 更新数据库记录
    await prisma.imageResize.update({
      where: { id: resize.id },
      data: {
        resizedFileSize: processedBuffer.length,
        resizedWidth: actualWidth,
        resizedHeight: actualHeight,
        resizedR2Key: resizedR2Key,
        resizedR2Url: resizedUploadResult.url,
        status: 'COMPLETED'
      }
    })

    // 构建响应数据
    const original = {
      fileName: file.name,
      size: originalFileSize,
      mimeType: file.type,
      url: originalUploadResult.url,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    }

    const resized = {
      fileName: file.name,
      size: processedBuffer.length,
      mimeType: file.type,
      url: resizedUploadResult.url,
      dimensions: {
        width: actualWidth,
        height: actualHeight
      }
    }

    const stats = {
      originalSize: originalFileSize,
      resizedSize: processedBuffer.length,
      sizeChange: ((processedBuffer.length - originalFileSize) / originalFileSize * 100).toFixed(1),
      originalDimensions: `${metadata.width} × ${metadata.height}`,
      resizedDimensions: `${actualWidth} × ${actualHeight}`
    }

    return NextResponse.json({
      success: true,
      id: resize.id,
      original,
      resized,
      stats,
      settings
    })

  } catch (error) {
    console.error('处理请求时出错:', error)
    return NextResponse.json({ 
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}