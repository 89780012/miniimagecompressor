import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'
import { uploadToR2, generateR2Key } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    const {
      r2Key,
      publicUrl,
      fileName,
      fileType,
      fileSize,
      targetSizeKb,
      quality,
      format,
      mode
    } = await request.json()

    // 验证必要参数
    if (!r2Key || !publicUrl || !fileName || !fileType || !fileSize) {
      return NextResponse.json({
        error: '缺少必要参数',
        details: '需要提供 r2Key, publicUrl, fileName, fileType, fileSize'
      }, { status: 400 })
    }

    // 从R2下载原始文件
    const response = await fetch(publicUrl)
    if (!response.ok) {
      return NextResponse.json({
        error: '无法获取原始文件',
        details: `HTTP ${response.status}: ${response.statusText}`
      }, { status: 400 })
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    // 获取原始图片信息
    const metadata = await sharp(buffer).metadata()
    const originalFileSize = buffer.length

    // 创建数据库记录
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24小时后过期

    const compression = await prisma.imageCompression.create({
      data: {
        originalFileName: fileName,
        originalFileSize: originalFileSize,
        originalMimeType: fileType,
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        originalR2Key: r2Key,
        originalR2Url: publicUrl,
        targetSizeKb: targetSizeKb ? parseInt(targetSizeKb) : null,
        quality: quality ? parseInt(quality) : null,
        format: format || 'jpeg',
        status: 'PROCESSING',
        expiresAt: expiresAt
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

        // 检查是否压缩后文件变大了，如果是则进行智能处理
        if (compressedBuffer.length >= originalFileSize) {
          console.log('质量压缩后文件变大，尝试优化处理')

          // 尝试更低的质量设置
          let optimizedQuality = Math.max(20, (quality ? parseInt(quality) : 80) - 20)
          let attempts = 0
          const maxAttempts = 5

          do {
            let tempSharp = sharp(buffer)

            if (format === 'jpeg') {
              tempSharp = tempSharp.jpeg({ quality: optimizedQuality })
            } else if (format === 'png') {
              const compressionLevel = Math.round((100 - optimizedQuality) / 10)
              tempSharp = tempSharp.png({ compressionLevel })
            } else if (format === 'webp') {
              tempSharp = tempSharp.webp({ quality: optimizedQuality })
            }

            const optimizedBuffer = await tempSharp.toBuffer()

            // 如果优化后的文件更小，使用优化版本
            if (optimizedBuffer.length < originalFileSize) {
              compressedBuffer = optimizedBuffer
              break
            }

            // 进一步降低质量
            optimizedQuality = Math.max(20, optimizedQuality - 10)
            attempts++
          } while (attempts < maxAttempts && optimizedQuality >= 20)

          // 如果质量压缩还是不行，尝试轻微调整尺寸（90%）
          if (compressedBuffer.length >= originalFileSize && metadata.width && metadata.height) {
            console.log('尝试轻微缩小尺寸以减少文件大小')
            const newWidth = Math.round(metadata.width * 0.9)
            const newHeight = Math.round(metadata.height * 0.9)

            let resizeSharp = sharp(buffer).resize(newWidth, newHeight)

            if (format === 'jpeg') {
              resizeSharp = resizeSharp.jpeg({ quality: quality ? parseInt(quality) : 80 })
            } else if (format === 'png') {
              const compressionLevel = Math.round((100 - (quality ? parseInt(quality) : 80)) / 10)
              resizeSharp = resizeSharp.png({ compressionLevel })
            } else if (format === 'webp') {
              resizeSharp = resizeSharp.webp({ quality: quality ? parseInt(quality) : 80 })
            }

            const resizedBuffer = await resizeSharp.toBuffer()
            if (resizedBuffer.length < originalFileSize) {
              compressedBuffer = resizedBuffer
            }
          }
        }
      }

      compressedMetadata = await sharp(compressedBuffer).metadata()

      // 生成压缩文件的R2键名
      const compressedFileName = `${fileName.replace(/\.[^/.]+$/, '')}.${format}`
      const compressedR2Key = generateR2Key(compressedFileName, 'compressed')

      // 上传压缩文件到R2
      const compressedMimeType = `image/${format === 'jpg' ? 'jpeg' : format}`
      const compressedUploadResult = await uploadToR2(
        compressedR2Key,
        compressedBuffer,
        compressedMimeType
      )

      if (!compressedUploadResult.success) {
        throw new Error(`压缩文件上传失败: ${compressedUploadResult.error}`)
      }

      const processingTime = Date.now() - startTime
      const compressionRatio = (1 - compressedBuffer.length / originalFileSize) * 100

      // 更新数据库记录
      await prisma.imageCompression.update({
        where: { id: compression.id },
        data: {
          compressedFileSize: compressedBuffer.length,
          compressedWidth: compressedMetadata.width,
          compressedHeight: compressedMetadata.height,
          compressedR2Key: compressedR2Key,
          compressedR2Url: compressedUploadResult.url,
          compressionRatio: compressionRatio,
          status: 'COMPLETED',
          processingTime: processingTime
        }
      })

      return NextResponse.json({
        id: compression.id,
        original: {
          fileName: fileName,
          fileSize: originalFileSize,
          width: metadata.width,
          height: metadata.height,
          url: publicUrl
        },
        compressed: {
          fileSize: compressedBuffer.length,
          width: compressedMetadata.width,
          height: compressedMetadata.height,
          url: compressedUploadResult.url
        },
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        processingTime,
        expiresAt: expiresAt.toISOString()
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