# Paper Pulse 3.0

<div align="center">

**AI 驱动的学术论文发现与研究助手**

[English](./README.md) · [中文](./README_ZH.md)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 功能特性

| 功能 | 描述 |
|------|------|
| 📚 **论文发现** | 浏览 arXiv 和 OpenReview 的论文，智能筛选 |
| 🎯 **个性化推荐** | 基于偏好标签卡的 AI 驱动的论文推荐 |
| 🤖 **AI 助手** | 与论文对话，获取 AI 摘要和解析 |
| 📖 **个人文库** | 保存论文，高亮和批注功能 |
| ✨ **每日运势** | 每日科研运势系统，助力科研心情 |
| 🏷️ **智能标签** | 用自然语言创建最多 10 个偏好标签卡 |

---

## 快速开始

### 环境要求

- Node.js 18.17+
- npm / yarn / pnpm / bun

### 安装部署

```bash
# 克隆仓库
git clone https://github.com/Otter-Knight/paper-pulse.git
cd paper-pulse

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env

# 启动开发服务器
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

---

## 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# 必需 - OpenAI API 密钥（用于 AI 聊天和摘要）
OPENAI_API_KEY="sk-your-openai-key"

# 必需 - Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# 可选 - Anthropic API（用于 Claude）
ANTHROPIC_API_KEY=""

# 可选 - 定时任务安全令牌
CRON_SECRET="your-random-secret"

# 开发模式（设为 "true" 使用模拟数据）
USE_MOCK_DATA="true"
```

> **提示：** 设置 `USE_MOCK_DATA="true"` 可在无需数据库的情况下进行测试。

---

## 部署上线

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

```bash
# 或使用 CLI 部署
npm i -g vercel
vercel
```

### Docker 部署

```dockerfile
# 构建镜像
docker build -t paper-pulse .

# 运行容器
docker run -p 3000:3000 --env-file .env paper-pulse
```

### 其他平台

- **Railway**: `npx vercel deploy --prod`
- **Render**: 从 GitHub 部署，构建命令填 `npm run build`，启动命令填 `npm start`
- **Netlify**: 从 GitHub 导入，默认配置即可直接使用

---

## 技术栈

<div align="center">

```
┌─────────────────────────────────────────────┐
│  前端                                       │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐ │
│  │ Next.js │ │ React   │ │ Tailwind CSS │ │
│  │ 16      │ │ 18      │ │ 3.x          │ │
│  └─────────┘ └─────────┘ └──────────────┘ │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐ │
│  │ Zustand │ │ Lucide  │ │ Vercel AI    │ │
│  │         │ │ Icons   │ │ SDK          │ │
│  └─────────┘ └─────────┘ └──────────────┘ │
│                                             │
│  后端                                       │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐ │
│  │ Prisma  │ │ Supabase│ │ OpenAI API   │ │
│  │         │ │ (PostgreS│ │              │ │
│  └─────────┘ └─────────┘ └──────────────┘ │
└─────────────────────────────────────────────┘
```

</div>

---

## 项目结构

```
paper-pulse/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页 - 论文发现
│   ├── feed/              # 个性化推荐
│   ├── library/           # 个人文库
│   ├── paper/[id]/       # 论文详情
│   └── api/               # API 路由
├── components/            # React 组件
│   ├── preference-builder.tsx
│   ├── paper-card.tsx
│   ├── fortune-checkin.tsx
│   └── ...
├── lib/                   # 工具函数和状态管理
│   ├── actions.ts         # 服务端 actions
│   ├── preference-store.ts
│   └── ...
└── public/               # 静态资源
```

---

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 类型检查
npx tsc --noEmit
```

---

## 开源协议

MIT License - 详见 [LICENSE](LICENSE)。

---

<div align="center">

**如果觉得这个项目对你有帮助，欢迎在 [GitHub](https://github.com/Otter-Knight/paper-pulse) 上给我们点个 Star！**

</div>
