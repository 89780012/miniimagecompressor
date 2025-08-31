import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredImages, getCleanupStats } from '@/lib/cleanup'

// 手动触发清理（用于测试和管理）
export async function POST(request: NextRequest) {
  try {
    // 可以添加身份验证检查
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CLEANUP_API_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    console.log('手动触发图片清理任务...')
    const result = await cleanupExpiredImages()
    
    return NextResponse.json({
      success: result.success,
      message: `清理完成：删除了 ${result.deletedRecords} 条记录和 ${result.deletedFiles} 个文件`,
      details: {
        deletedRecords: result.deletedRecords,
        deletedFiles: result.deletedFiles,
        errors: result.errors
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('手动清理任务失败:', error)
    return NextResponse.json(
      { 
        error: '清理任务执行失败', 
        details: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}

// 获取清理统计信息
export async function GET() {
  try {
    const stats = await getCleanupStats()
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('获取清理统计失败:', error)
    return NextResponse.json(
      { 
        error: '获取统计信息失败', 
        details: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}