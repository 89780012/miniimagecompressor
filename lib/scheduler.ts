import * as cron from 'node-cron'
import { cleanupExpiredImages } from '@/lib/cleanup'

/**
 * 初始化定时清理任务
 */
export function initCleanupScheduler() {
  // 检查是否启用定时清理
  const enableScheduler = process.env.ENABLE_CLEANUP_SCHEDULER !== 'false'
  
  if (!enableScheduler) {
    console.log('定时清理任务已禁用 (ENABLE_CLEANUP_SCHEDULER=false)')
    return
  }

  // 每天凌晨0点执行清理
  // cron表达式: 秒 分 时 日 月 周
  const cronExpression = process.env.CLEANUP_CRON_SCHEDULE || '0 0 0 * * *' // 每天0:00:00

  console.log(`启动图片清理定时任务: ${cronExpression}`)
  
  cron.schedule(cronExpression, async () => {
    console.log('开始执行定时清理任务...')
    try {
      const result = await cleanupExpiredImages()
      
      if (result.success) {
        console.log(`定时清理成功：删除了 ${result.deletedRecords} 条记录和 ${result.deletedFiles} 个文件`)
      } else {
        console.error(`定时清理部分失败：删除了 ${result.deletedRecords} 条记录和 ${result.deletedFiles} 个文件`)
        console.error('错误详情:', result.errors)
      }
    } catch (error) {
      console.error('定时清理任务执行失败:', error)
    }
  }, {
    timezone: process.env.TZ || 'Asia/Shanghai' // 默认使用上海时区
  })

  console.log('图片清理定时任务已启动')
}

/**
 * 停止定时任务（用于优雅关闭）
 */
export function stopCleanupScheduler() {
  // 获取所有活跃的定时任务并停止
  cron.getTasks().forEach((task, name) => {
    task.stop()
    console.log(`停止定时任务: ${name}`)
  })
}