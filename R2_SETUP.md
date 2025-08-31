# Cloudflare R2 集成配置指南

本项目已集成 Cloudflare R2 云存储服务，实现图片的云端存储和自动清理功能。

## 🚀 功能特点

- ✅ **云端存储**: 图片上传到 Cloudflare R2，不再占用服务器本地空间
- ✅ **自动清理**: 每天凌晨自动清理24小时前的文件和数据库记录
- ✅ **数据迁移**: 兼容原有本地存储数据，支持平滑迁移
- ✅ **API管理**: 提供手动清理和统计查询接口
- ✅ **错误处理**: 完善的错误处理和重试机制

## 📝 配置步骤

### 1. 创建 Cloudflare R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 **R2 Object Storage**
3. 创建新的存储桶
4. 记录存储桶名称

### 2. 获取 API 密钥

1. 在 Cloudflare Dashboard 中，进入 **R2** → **Manage R2 API Tokens**
2. 创建新的 API Token，权限选择：
   - **Object Read**
   - **Object Write** 
   - **Object Delete**
3. 记录 `Access Key ID` 和 `Secret Access Key`

### 3. 配置自定义域名（强烈推荐）

为了获得更好的性能和SEO效果，建议为R2存储桶配置自定义域名：

1. 在 Cloudflare Dashboard 中，进入 **R2** → **Manage R2 API Tokens**
2. 选择您的存储桶，点击 **Settings**
3. 在 **Custom Domains** 部分，点击 **Connect Domain**
4. 输入您的域名（如 `image.mycompressor.org`）
5. 按照提示添加 CNAME 记录到您的 DNS

### 4. 配置环境变量

复制 `.env.example` 到 `.env` 并填写以下配置：

```bash
# Cloudflare R2配置
R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key" 
R2_BUCKET_NAME="your_bucket_name"

# 自定义域名配置（强烈推荐）
R2_PUBLIC_DOMAIN="image.mycompressor.org"

# 定时清理配置
ENABLE_CLEANUP_SCHEDULER="true"
CLEANUP_CRON_SCHEDULE="0 0 0 * * *"  # 每天凌晨0点
TZ="Asia/Shanghai"
```

### 5. 运行数据库迁移

```bash
npm run prisma:migrate
```

### 6. 启动应用

```bash
npm run dev
```

### 7. 初始化系统服务（可选）

访问 `POST /api/init` 来手动初始化定时任务（通常会自动启动）。

## 📡 API 接口

### 压缩接口
- **POST /api/compress** - 上传并压缩图片（已更新为R2存储）

### 清理接口  
- **POST /api/cleanup** - 手动触发清理任务
- **GET /api/cleanup** - 获取清理统计信息

### 系统接口
- **POST /api/init** - 初始化系统服务
- **GET /api/init** - 检查初始化状态

## 🕒 定时清理机制

### 清理规则
- 自动清理超过24小时的图片文件
- 同时删除 R2 存储文件和数据库记录
- 兼容处理旧的本地存储数据

### 清理时间
- **默认**: 每天凌晨 00:00:00 执行
- **自定义**: 通过 `CLEANUP_CRON_SCHEDULE` 环境变量修改

### Cron 表达式格式
```
秒 分 时 日 月 周
0  0  0  *  *  *    # 每天凌晨0点
0  0  2  *  *  *    # 每天凌晨2点
0  30 1  *  *  0    # 每周日凌晨1:30
```

## 🔧 管理命令

### 手动清理
```bash
curl -X POST http://localhost:3000/api/cleanup \
  -H "Authorization: Bearer your_token"
```

### 查看统计信息
```bash  
curl http://localhost:3000/api/cleanup
```

## 🛠️ 故障排除

### 上传失败
1. 检查 R2 配置是否正确
2. 确认 API Token 权限充足
3. 验证存储桶名称和端点地址

### 定时任务未启动
1. 检查 `ENABLE_CLEANUP_SCHEDULER` 是否为 `true`
2. 确认应用运行环境支持 cron 任务
3. 查看服务器日志输出

### 清理失败
1. 检查数据库连接
2. 确认 R2 删除权限
3. 查看错误日志详情

## 📊 监控建议

### 日志监控
- 关注定时清理任务的执行日志
- 监控上传失败的错误信息
- 跟踪 R2 API 调用状态

### 存储监控
- 定期检查 R2 存储使用量
- 监控数据库记录增长情况
- 验证清理任务的有效性

## 🔄 数据迁移

如果你有现有的本地存储文件需要迁移到 R2：

1. 现有数据会继续正常工作（通过兼容性字段）
2. 新上传的文件将自动使用 R2 存储
3. 旧文件会在24小时后被自动清理（如果启用了定时任务）

## 💡 性能优化建议

1. **CDN 配置**: 为 R2 存储桶配置自定义域名和 CDN
2. **缓存策略**: 利用 R2 的缓存控制头优化访问速度  
3. **并行上传**: 大文件可考虑分片上传（未实现）
4. **压缩优化**: 根据业务需求调整压缩参数

## 📈 扩展功能

可以考虑后续添加的功能：
- [ ] 文件访问统计
- [ ] 批量上传支持
- [ ] 图片水印功能
- [ ] 用户账户系统
- [ ] 高级压缩算法

---

有问题请查看日志输出或提交 Issue。