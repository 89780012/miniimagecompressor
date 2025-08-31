import { initCleanupScheduler, stopCleanupScheduler } from '@/lib/scheduler'

// 应用启动时的初始化函数
export function initializeApp() {
  // 仅在服务器端运行
  if (typeof window === 'undefined') {
    console.log('初始化应用服务...')
    
    // 启动定时清理任务
    initCleanupScheduler()
    
    // 注册优雅关闭处理
    const gracefulShutdown = () => {
      console.log('正在停止应用服务...')
      stopCleanupScheduler()
      process.exit(0)
    }
    
    // 监听退出信号
    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)
    process.on('SIGQUIT', gracefulShutdown)
    
    console.log('应用服务初始化完成')
  }
}

// 立即执行初始化（仅在服务器端）
initializeApp()