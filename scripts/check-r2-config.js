// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config()

console.log('🔧 R2 配置检查')
console.log('================')

// 检查必要的环境变量
const requiredEnvVars = [
  'R2_ENDPOINT',
  'R2_ACCESS_KEY_ID', 
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ 缺少必要的环境变量:')
  missingVars.forEach(varName => console.error(`   - ${varName}`))
  process.exit(1)
}

console.log('✅ 必要环境变量已配置')
console.log(`   - R2_ENDPOINT: ${process.env.R2_ENDPOINT}`)
console.log(`   - R2_BUCKET_NAME: ${process.env.R2_BUCKET_NAME}`)

// 检查自定义域名配置
if (process.env.R2_PUBLIC_DOMAIN) {
  console.log('✅ 自定义域名已配置')
  console.log(`   - R2_PUBLIC_DOMAIN: ${process.env.R2_PUBLIC_DOMAIN}`)
  
  // 测试生成的URL格式
  const testKey = 'images/2024/08/test_1234567890_abc_sample.jpg'
  const customUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${testKey}`
  const defaultUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${testKey}`
  
  console.log('🔗 URL 生成测试:')
  console.log(`   - 自定义域名URL: ${customUrl}`)
  console.log(`   - 默认R2 URL: ${defaultUrl}`)
  console.log('   ✅ 将使用自定义域名URL')
} else {
  console.log('⚠️  未配置自定义域名')
  console.log('   - 将使用默认 R2 URL')
  console.log('   - 建议配置 R2_PUBLIC_DOMAIN 以获得更好性能')
}

// 检查定时任务配置
console.log('\n⏰ 定时任务配置')
console.log('================')
console.log(`   - ENABLE_CLEANUP_SCHEDULER: ${process.env.ENABLE_CLEANUP_SCHEDULER || 'true'}`)
console.log(`   - CLEANUP_CRON_SCHEDULE: ${process.env.CLEANUP_CRON_SCHEDULE || '0 0 0 * * *'}`)
console.log(`   - TZ: ${process.env.TZ || 'Asia/Shanghai'}`)

console.log('\n🎉 配置检查完成！')
console.log('现在可以启动应用: npm run dev')