# 🎮 AI Game Guide Assistant

<div align="center">

**A modern, full-stack web application that generates comprehensive game guides using AI and intelligent caching**

[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**English** | [中文](#中文版)

</div>

---

## 📋 Table of Contents / 目录

- [Overview](#-overview--项目概述)
- [Tech Stack](#-tech-stack--技术栈)
- [Features](#-features--核心功能)
- [Architecture](#-architecture--架构设计)
- [Getting Started](#-getting-started--快速开始)
- [Project Structure](#-project-structure--项目结构)
- [API Documentation](#-api-documentation--api-文档)
- [Deployment](#-deployment--部署说明)
- [Key Highlights](#-key-highlights--项目亮点)
- [Contact](#-contact--联系方式)

---

## 📖 Overview / 项目概述

**AI Game Guide Assistant** is a production-ready web application that leverages AI to generate comprehensive, structured game guides on-demand. Built with modern web technologies, it implements intelligent caching mechanisms, responsive UI design, and robust error handling to deliver a seamless user experience.

**AI 游戏指南助手**是一个生产级的 Web 应用，利用 AI 技术按需生成全面、结构化的游戏指南。采用现代 Web 技术构建，实现了智能缓存机制、响应式 UI 设计和健壮的错误处理，为用户提供流畅的体验。

### ✨ What Makes This Special / 项目特色

- **AI-Powered Content Generation** - Utilizes Deepseek API (OpenAI-compatible) for intelligent guide creation
- **Smart Caching System** - PostgreSQL-based caching reduces API calls and improves response times
- **Modern Tech Stack** - Built with Next.js 15, React 19, TypeScript, and TailwindCSS 4
- **Production-Ready** - Includes error handling, input validation, and optimized performance
- **Type-Safe** - Full TypeScript implementation with strict type checking
- **Responsive Design** - Mobile-first approach with beautiful, modern UI

---

## 🛠 Tech Stack / 技术栈

### Frontend / 前端
- **Framework**: Next.js 15.1.6 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.0
- **Styling**: TailwindCSS 4.0 with Custom Animations
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Markdown Rendering**: react-markdown 10.1.0

### Backend / 后端
- **Runtime**: Node.js (Next.js API Routes)
- **API Client**: OpenAI SDK (Deepseek Compatible)
- **Database**: Supabase (PostgreSQL)
- **ORM/Query Builder**: Supabase JavaScript Client

### Infrastructure / 基础设施
- **Database**: PostgreSQL (via Supabase)
- **Hosting**: Vercel-ready / Self-hostable
- **Environment**: Environment Variables for Configuration

### Development Tools / 开发工具
- **Package Manager**: npm / pnpm
- **Linting**: ESLint
- **Version Control**: Git / GitHub

---

## 🚀 Features / 核心功能

### Core Features / 主要功能
1. **AI-Powered Guide Generation** / AI 驱动指南生成
   - Generates comprehensive game guides using Deepseek API
   - Structured Markdown output with proper formatting
   - Customizable prompts for different game genres

2. **Intelligent Caching** / 智能缓存
   - Case-insensitive game name matching
   - Automatic cache management via Supabase
   - Reduces API costs and improves response times

3. **Real-time User Interface** / 实时用户界面
   - Loading states with smooth animations
   - Error handling with user-friendly messages
   - Responsive design for all devices

4. **Type Safety & Validation** / 类型安全与验证
   - Full TypeScript coverage
   - Input validation and sanitization
   - Robust error handling

### Technical Features / 技术特性
- ✅ Server-Side Rendering (SSR) with Next.js App Router
- ✅ API Route optimization with extended timeout support
- ✅ Database indexing for performance optimization
- ✅ Environment variable management
- ✅ Production-ready error handling

---

## 🏗 Architecture / 架构设计

### System Flow / 系统流程

```
User Input → Frontend (React/Next.js)
    ↓
API Route (/api/guide)
    ↓
Cache Check (Supabase PostgreSQL)
    ↓
    ├─ Cache Hit → Return Cached Content
    └─ Cache Miss → Call Deepseek API → Save to Cache → Return Content
    ↓
Frontend Rendering (React Markdown)
```

### Database Schema / 数据库结构

```sql
game_guides
├── id (UUID, Primary Key)
├── game_name (TEXT, UNIQUE, Indexed)
├── content (TEXT, Markdown Format)
└── created_at (TIMESTAMP)
```

### Key Design Decisions / 关键设计决策

1. **Caching Strategy**: PostgreSQL for persistence and reliability
2. **API Compatibility**: OpenAI SDK for easy provider switching
3. **Type Safety**: Full TypeScript for better developer experience
4. **Error Handling**: Graceful degradation with user-friendly messages

---

## 🚀 Getting Started / 快速开始

### Prerequisites / 前置要求

- Node.js 18+ / Node.js 18 或更高版本
- npm, pnpm, or yarn / npm、pnpm 或 yarn
- Supabase account (free tier works) / Supabase 账号（免费版即可）
- Deepseek API key / Deepseek API 密钥

### Installation / 安装步骤

1. **Clone the repository** / 克隆仓库

```bash
git clone https://github.com/qd-maker/game-guide-ai.git
cd game-guide-ai
```

2. **Install dependencies** / 安装依赖

```bash
npm install
# or
pnpm install
```

3. **Set up environment variables** / 配置环境变量

Create a `.env.local` file in the root directory / 在根目录创建 `.env.local` 文件：

```env
# Deepseek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Set up the database** / 设置数据库

Run the SQL script in Supabase SQL Editor / 在 Supabase SQL 编辑器中运行 SQL 脚本：

```bash
# See supabase_schema.sql for the complete schema
```

5. **Run the development server** / 启动开发服务器

```bash
npm run dev
# or
pnpm dev
```

6. **Open your browser** / 打开浏览器

Navigate to `http://localhost:3000` / 访问 `http://localhost:3000`

### Build for Production / 构建生产版本

```bash
npm run build
npm start
```

---

## 📁 Project Structure / 项目结构

```
game-guide-ai/
├── app/
│   ├── api/
│   │   └── guide/
│   │       └── route.ts          # API endpoint for guide generation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page component
├── components/
│   ├── ui/                       # Reusable UI components
│   └── ...
├── lib/
│   ├── supabase.ts               # Supabase client configuration
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
├── supabase_schema.sql           # Database schema
├── .env.local                    # Environment variables (not committed)
├── .gitignore                    # Git ignore rules
├── next.config.mjs               # Next.js configuration
├── package.json                  # Project dependencies
└── tsconfig.json                 # TypeScript configuration
```

---

## 📚 API Documentation / API 文档

### POST `/api/guide`

Generate or retrieve a game guide / 生成或获取游戏指南

**Request Body:**
```json
{
  "gameName": "Elden Ring"
}
```

**Response (Success):**
```json
{
  "content": "# Game Guide...",
  "cached": false,
  "gameName": "Elden Ring",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `500` - Internal Server Error

---

## 🌐 Deployment / 部署说明

### Vercel Deployment / Vercel 部署

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables in Vercel dashboard:
   - `DEEPSEEK_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### Self-Hosting / 自托管

The application can be self-hosted on any Node.js-compatible platform:

- Docker
- Railway
- Render
- DigitalOcean App Platform

---

## ⭐ Key Highlights / 项目亮点

### For Recruiters / 面向招聘者

This project demonstrates:

1. **Full-Stack Development** / 全栈开发能力
   - Frontend: React, Next.js, TypeScript
   - Backend: API Routes, Server-Side Logic
   - Database: PostgreSQL, Supabase Integration

2. **Modern Best Practices** / 现代最佳实践
   - TypeScript for type safety
   - Component-based architecture
   - RESTful API design
   - Error handling and validation

3. **Performance Optimization** / 性能优化
   - Intelligent caching strategy
   - Database indexing
   - Optimized API responses
   - Code splitting and lazy loading

4. **Production Readiness** / 生产就绪
   - Environment variable management
   - Error boundaries
   - Input validation
   - Security considerations

5. **Developer Experience** / 开发体验
   - Clean code structure
   - Comprehensive error handling
   - Type-safe implementation
   - Documentation

---

## 💼 Skills Demonstrated / 展示的技能

- ✅ **Frontend Development**: React, Next.js, TypeScript, TailwindCSS
- ✅ **Backend Development**: Node.js, API Routes, Server-Side Rendering
- ✅ **Database Management**: PostgreSQL, Supabase, SQL
- ✅ **AI Integration**: OpenAI SDK, Deepseek API
- ✅ **Version Control**: Git, GitHub
- ✅ **Deployment**: Vercel, Environment Configuration
- ✅ **Code Quality**: TypeScript, ESLint, Best Practices

---

## 📞 Contact / 联系方式

**Project Repository**: [GitHub](https://github.com/qd-maker/game-guide-ai)

**LinkedIn**: [Your LinkedIn Profile]  
**Email**: [Your Email Address]  
**Portfolio**: [Your Portfolio Website]

---

## 📄 License / 许可证

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ using Next.js, React, and TypeScript**

**Made for remote work and international opportunities** 🌍

</div>

---

# 中文版

## 📖 项目概述

**AI 游戏指南助手**是一个生产级的 Web 应用，利用 AI 技术按需生成全面、结构化的游戏指南。采用现代 Web 技术构建，实现了智能缓存机制、响应式 UI 设计和健壮的错误处理，为用户提供流畅的体验。

### ✨ 项目特色

- **AI 驱动内容生成** - 使用 Deepseek API（兼容 OpenAI）进行智能指南创建
- **智能缓存系统** - 基于 PostgreSQL 的缓存机制，减少 API 调用并提升响应速度
- **现代技术栈** - 使用 Next.js 15、React 19、TypeScript 和 TailwindCSS 4 构建
- **生产就绪** - 包含错误处理、输入验证和性能优化
- **类型安全** - 完整的 TypeScript 实现，严格的类型检查
- **响应式设计** - 移动优先的方法，美观现代的 UI

---

## 🛠 技术栈

### 前端技术
- **框架**: Next.js 15.1.6 (App Router)
- **UI 库**: React 19.0.0
- **语言**: TypeScript 5.0
- **样式**: TailwindCSS 4.0 + 自定义动画
- **UI 组件**: Radix UI + 自定义组件
- **图标**: Lucide React
- **Markdown 渲染**: react-markdown 10.1.0

### 后端技术
- **运行时**: Node.js (Next.js API Routes)
- **API 客户端**: OpenAI SDK (兼容 Deepseek)
- **数据库**: Supabase (PostgreSQL)
- **查询构建器**: Supabase JavaScript Client

### 基础设施
- **数据库**: PostgreSQL (通过 Supabase)
- **部署**: 支持 Vercel / 可自托管
- **环境**: 环境变量配置

---

## 🚀 核心功能

### 主要功能
1. **AI 驱动指南生成**
   - 使用 Deepseek API 生成全面的游戏指南
   - 结构化 Markdown 输出，格式规范
   - 可自定义提示词，适配不同游戏类型

2. **智能缓存**
   - 不区分大小写的游戏名称匹配
   - 通过 Supabase 自动管理缓存
   - 降低 API 成本并提升响应速度

3. **实时用户界面**
   - 流畅的加载动画状态
   - 用户友好的错误提示
   - 全设备响应式设计

4. **类型安全与验证**
   - 完整的 TypeScript 覆盖
   - 输入验证和清理
   - 健壮的错误处理

---

## 🏗 架构设计

### 系统流程

```
用户输入 → 前端 (React/Next.js)
    ↓
API 路由 (/api/guide)
    ↓
缓存检查 (Supabase PostgreSQL)
    ↓
    ├─ 缓存命中 → 返回缓存内容
    └─ 缓存未命中 → 调用 Deepseek API → 保存到缓存 → 返回内容
    ↓
前端渲染 (React Markdown)
```

### 关键设计决策

1. **缓存策略**: 使用 PostgreSQL 保证持久性和可靠性
2. **API 兼容性**: 使用 OpenAI SDK 便于切换提供商
3. **类型安全**: 完整 TypeScript 提升开发体验
4. **错误处理**: 优雅降级，提供友好的错误信息

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm、pnpm 或 yarn
- Supabase 账号（免费版即可）
- Deepseek API 密钥

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/qd-maker/game-guide-ai.git
cd game-guide-ai
```

2. **安装依赖**

```bash
npm install
# 或
pnpm install
```

3. **配置环境变量**

在根目录创建 `.env.local` 文件：

```env
# Deepseek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **设置数据库**

在 Supabase SQL 编辑器中运行 SQL 脚本（见 `supabase_schema.sql`）

5. **启动开发服务器**

```bash
npm run dev
# 或
pnpm dev
```

6. **打开浏览器**

访问 `http://localhost:3000`

---

## 💼 项目亮点（面向招聘者）

此项目展示了：

1. **全栈开发能力**
   - 前端：React、Next.js、TypeScript
   - 后端：API 路由、服务端逻辑
   - 数据库：PostgreSQL、Supabase 集成

2. **现代最佳实践**
   - TypeScript 类型安全
   - 组件化架构
   - RESTful API 设计
   - 错误处理和验证

3. **性能优化**
   - 智能缓存策略
   - 数据库索引
   - 优化的 API 响应
   - 代码分割和懒加载

4. **生产就绪**
   - 环境变量管理
   - 错误边界
   - 输入验证
   - 安全考虑

5. **开发体验**
   - 清晰的代码结构
   - 全面的错误处理
   - 类型安全实现
   - 完善的文档

---

## 💼 展示的技能

- ✅ **前端开发**: React、Next.js、TypeScript、TailwindCSS
- ✅ **后端开发**: Node.js、API 路由、服务端渲染
- ✅ **数据库管理**: PostgreSQL、Supabase、SQL
- ✅ **AI 集成**: OpenAI SDK、Deepseek API
- ✅ **版本控制**: Git、GitHub
- ✅ **部署**: Vercel、环境配置
- ✅ **代码质量**: TypeScript、ESLint、最佳实践

---

## 📞 联系方式

**项目仓库**: [GitHub](https://github.com/qd-maker/game-guide-ai)

**LinkedIn**: [您的 LinkedIn 个人资料]  
**邮箱**: [您的邮箱地址]  
**作品集**: [您的作品集网站]

---

<div align="center">

**使用 Next.js、React 和 TypeScript 构建** ❤️

**为远程工作和国际化机会而打造** 🌍

</div>
