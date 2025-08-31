import { NextResponse } from 'next/server'
import { initCleanupScheduler } from '@/lib/scheduler'

let isInitialized = false

// 系统初始化端点
export async function POST() {
  try {
    if (isInitialized) {
      return NextResponse.json({ 
        message: '系统已经初始化过了',
        initialized: true 
      })
    }

    console.log('开始初始化系统服务...')
    
    // 启动定时清理任务
    initCleanupScheduler()
    
    isInitialized = true
    
    return NextResponse.json({
      success: true,
      message: '系统初始化完成',
      services: ['定时清理任务'],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('系统初始化失败:', error)
    return NextResponse.json(
      { 
        error: '系统初始化失败', 
        details: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}

// 检查初始化状态
export async function GET() {
  return NextResponse.json({
    initialized: isInitialized,
    timestamp: new Date().toISOString()
  })
}