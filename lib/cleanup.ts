import { prisma } from '@/lib/prisma'
import { batchDeleteFromR2 } from '@/lib/r2'

/**
 * 清理过期的图片记录和R2文件
 * 删除超过24小时的图片文件和数据库记录
 */
export async function cleanupExpiredImages(): Promise<{
  success: boolean
  deletedRecords: number
  deletedFiles: number
  errors: string[]
}> {
  const errors: string[] = []
  let deletedRecords = 0
  let deletedFiles = 0

  try {
    console.log('开始清理过期图片...')
    
    // 查找所有过期的记录
    const expiredImages = await prisma.imageCompression.findMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date() // 过期时间小于当前时间
            }
          },
          {
            // 兼容旧数据：创建时间超过24小时且没有设置过期时间
            AND: [
              { expiresAt: null },
              { 
                createdAt: {
                  lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24小时前
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        originalR2Key: true,
        compressedR2Key: true,
        originalPath: true, // 兼容旧数据
        compressedPath: true // 兼容旧数据
      }
    })

    if (expiredImages.length === 0) {
      console.log('没有找到过期的图片记录')
      return { success: true, deletedRecords: 0, deletedFiles: 0, errors: [] }
    }

    console.log(`找到 ${expiredImages.length} 条过期记录`)

    // 收集需要删除的R2文件键名
    const r2KeysToDelete: string[] = []
    
    for (const image of expiredImages) {
      if (image.originalR2Key) {
        r2KeysToDelete.push(image.originalR2Key)
      }
      if (image.compressedR2Key) {
        r2KeysToDelete.push(image.compressedR2Key)
      }
    }

    // 批量删除R2文件
    if (r2KeysToDelete.length > 0) {
      console.log(`开始删除 ${r2KeysToDelete.length} 个R2文件...`)
      const deleteResult = await batchDeleteFromR2(r2KeysToDelete)
      deletedFiles = deleteResult.deletedCount
      
      if (deleteResult.errors.length > 0) {
        errors.push(...deleteResult.errors)
      }
      
      console.log(`成功删除 ${deletedFiles} 个R2文件`)
    }

    // 批量删除数据库记录
    const imageIds = expiredImages.map(img => img.id)
    const deleteDbResult = await prisma.imageCompression.deleteMany({
      where: {
        id: {
          in: imageIds
        }
      }
    })
    
    deletedRecords = deleteDbResult.count
    console.log(`成功删除 ${deletedRecords} 条数据库记录`)

    const success = errors.length === 0
    if (success) {
      console.log(`清理完成：删除了 ${deletedRecords} 条记录和 ${deletedFiles} 个文件`)
    } else {
      console.log(`清理部分完成：删除了 ${deletedRecords} 条记录和 ${deletedFiles} 个文件，但有 ${errors.length} 个错误`)
    }

    return {
      success,
      deletedRecords,
      deletedFiles,
      errors
    }

  } catch (error) {
    const errorMessage = `清理过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`
    console.error(errorMessage)
    errors.push(errorMessage)
    
    return {
      success: false,
      deletedRecords,
      deletedFiles,
      errors
    }
  }
}

/**
 * 获取清理统计信息
 */
export async function getCleanupStats(): Promise<{
  totalRecords: number
  expiredRecords: number
  totalFilesEstimated: number
}> {
  try {
    // 总记录数
    const totalRecords = await prisma.imageCompression.count()
    
    // 过期记录数
    const expiredRecords = await prisma.imageCompression.count({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date()
            }
          },
          {
            AND: [
              { expiresAt: null },
              { 
                createdAt: {
                  lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
              }
            ]
          }
        ]
      }
    })

    // 估算文件数量（原图 + 压缩图）
    const totalFilesEstimated = totalRecords * 2

    return {
      totalRecords,
      expiredRecords, 
      totalFilesEstimated
    }
  } catch (error) {
    console.error('获取清理统计信息失败:', error)
    return {
      totalRecords: 0,
      expiredRecords: 0,
      totalFilesEstimated: 0
    }
  }
}