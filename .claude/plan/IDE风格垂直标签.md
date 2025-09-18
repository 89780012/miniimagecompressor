# IDE风格垂直标签 - 执行计划

## 任务上下文
将 ConfigSidebar.tsx 中的横向 Tabs 改为类似 VSCode/IDEA 的右侧垂直标签，文字竖直排列。

## 技术背景
- 项目：Next.js 15 + TypeScript + Tailwind CSS 4 + Radix UI
- 文件：components/grid-collage/ConfigSidebar.tsx
- 当前问题：需要真正的IDE风格垂直标签（文字竖直）

## 实施方案
**技术选择**：自定义垂直标签组件 + CSS writing-mode
- 使用 `writing-mode: vertical-rl` 实现文字竖直排列
- Flexbox 布局：左侧内容区域 + 右侧固定标签区域
- 完全替代 Radix UI Tabs，保持功能一致

## 执行步骤
1. 分析当前 Tabs 结构和状态管理
2. 设计IDE风格垂直标签布局
3. 实现自定义垂直标签组件
4. 替换原有Tabs为垂直标签
5. 调整内容区域布局适配
6. 测试IDE风格标签交互

## 预期结果
- 标签紧贴右侧边缘，文字竖直显示
- 类似 VSCode 的侧边栏标签体验
- 保持原有交互功能和国际化支持
- 在 w-80 侧边栏中完美适配

---
*执行时间: 2025-09-18*
*任务：IDE风格垂直标签重构*