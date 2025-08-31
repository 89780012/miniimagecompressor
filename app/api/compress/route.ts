import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const targetSizeKb = formData.get('targetSizeKb') as string
    const quality = formData.get('quality') as string
    const format = formData.get('format') as string
    const mode = formData.get('mode') as string

    if (!file) {
      return NextResponse.json({ error: '没有文件上传' }, { status: 400 })
    }

    // 转换文件为 Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 获取原始图片信息
    const metadata = await sharp(buffer).metadata()
    const originalFileSize = buffer.length

    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // 生成唯一文件名
    const timestamp = Date.now()
    const originalFileName = file.name
    const fileExtension = path.extname(originalFileName)
    const baseName = path.basename(originalFileName, fileExtension)
    
    const originalPath = `/uploads/${baseName}_${timestamp}_original${fileExtension}`
    const originalFullPath = path.join(process.cwd(), 'public', originalPath)

    // 保存原始文件
    await writeFile(originalFullPath, buffer)

    // 创建数据库记录
    const compression = await prisma.imageCompression.create({
      data: {
        originalFileName: originalFileName,
        originalFileSize: originalFileSize,
        originalMimeType: file.type,
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        originalPath: originalPath,
        targetSizeKb: targetSizeKb ? parseInt(targetSizeKb) : null,
        quality: quality ? parseInt(quality) : null,
        format: format || 'jpeg',
        status: 'PROCESSING'
      }
    })

    // 开始压缩处理
    const startTime = Date.now()
    let compressedBuffer: Buffer
    let compressedMetadata: sharp.Metadata

    try {
      let sharpInstance = sharp(buffer)

      // 根据输出格式处理
      if (format === 'jpeg') {
        if (mode === 'quality' && quality) {
          sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) })
        } else {
          sharpInstance = sharpInstance.jpeg({ quality: 80 })
        }
      } else if (format === 'png') {
        if (mode === 'quality' && quality) {
          const compressionLevel = Math.round((100 - parseInt(quality)) / 10)
          sharpInstance = sharpInstance.png({ compressionLevel })
        } else {
          sharpInstance = sharpInstance.png({ compressionLevel: 6 })
        }
      } else if (format === 'webp') {
        if (mode === 'quality' && quality) {
          sharpInstance = sharpInstance.webp({ quality: parseInt(quality) })
        } else {
          sharpInstance = sharpInstance.webp({ quality: 80 })
        }
      }

      // 如果是按大小压缩，需要进行迭代压缩
      if (mode === 'size' && targetSizeKb) {
        const targetBytes = parseInt(targetSizeKb) * 1024
        let currentQuality = 80
        let attempts = 0
        const maxAttempts = 10

        do {
          let tempSharp = sharp(buffer)
          
          if (format === 'jpeg') {
            tempSharp = tempSharp.jpeg({ quality: currentQuality })
          } else if (format === 'png') {
            const compressionLevel = Math.round((100 - currentQuality) / 10)
            tempSharp = tempSharp.png({ compressionLevel })
          } else if (format === 'webp') {
            tempSharp = tempSharp.webp({ quality: currentQuality })
          }

          compressedBuffer = await tempSharp.toBuffer()
          
          if (compressedBuffer.length <= targetBytes || attempts >= maxAttempts) {
            break
          }

          // 调整质量进行下一次尝试
          const ratio = targetBytes / compressedBuffer.length
          if (ratio < 0.8) {
            currentQuality = Math.max(10, Math.round(currentQuality * 0.7))
          } else {
            currentQuality = Math.max(10, Math.round(currentQuality * 0.9))
          }
          
          attempts++
        } while (attempts < maxAttempts)

        // 如果还是太大，尝试调整尺寸
        if (compressedBuffer.length > targetBytes && metadata.width && metadata.height) {
          const ratio = Math.sqrt(targetBytes / compressedBuffer.length)
          const newWidth = Math.round(metadata.width * ratio)
          const newHeight = Math.round(metadata.height * ratio)
          
          let resizeSharp = sharp(buffer).resize(newWidth, newHeight)
          
          if (format === 'jpeg') {
            resizeSharp = resizeSharp.jpeg({ quality: currentQuality })
          } else if (format === 'png') {
            const compressionLevel = Math.round((100 - currentQuality) / 10)
            resizeSharp = resizeSharp.png({ compressionLevel })
          } else if (format === 'webp') {
            resizeSharp = resizeSharp.webp({ quality: currentQuality })
          }
          
          compressedBuffer = await resizeSharp.toBuffer()
        }
      } else {
        // 按质量压缩
        compressedBuffer = await sharpInstance.toBuffer()
      }

      compressedMetadata = await sharp(compressedBuffer).metadata()

      // 保存压缩后的文件
      const compressedPath = `/uploads/${baseName}_${timestamp}_compressed.${format}`
      const compressedFullPath = path.join(process.cwd(), 'public', compressedPath)
      await writeFile(compressedFullPath, compressedBuffer)

      const processingTime = Date.now() - startTime
      const compressionRatio = (1 - compressedBuffer.length / originalFileSize) * 100

      // 更新数据库记录
      await prisma.imageCompression.update({
        where: { id: compression.id },
        data: {
          compressedFileSize: compressedBuffer.length,
          compressedWidth: compressedMetadata.width,
          compressedHeight: compressedMetadata.height,
          compressedPath: compressedPath,
          compressionRatio: compressionRatio,
          status: 'COMPLETED',
          processingTime: processingTime
        }
      })

      return NextResponse.json({
        id: compression.id,
        original: {
          fileName: originalFileName,
          fileSize: originalFileSize,
          width: metadata.width,
          height: metadata.height,
          path: originalPath
        },
        compressed: {
          fileSize: compressedBuffer.length,
          width: compressedMetadata.width,
          height: compressedMetadata.height,
          path: compressedPath
        },
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        processingTime
      })

    } catch (compressionError) {
      // 更新数据库记录为失败状态
      await prisma.imageCompression.update({
        where: { id: compression.id },
        data: {
          status: 'FAILED',
          errorMessage: compressionError instanceof Error ? compressionError.message : '未知压缩错误'
        }
      })

      throw compressionError
    }

  } catch (error) {
    console.error('压缩处理错误:', error)
    return NextResponse.json(
      { error: '图片压缩失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}