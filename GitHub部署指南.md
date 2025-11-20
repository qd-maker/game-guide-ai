# GitHub 部署指南

## 📋 前置准备

1. **创建 GitHub 账号**（如果还没有）
   - 访问 https://github.com
   - 注册账号并登录

2. **创建新的 GitHub 仓库**
   - 登录 GitHub，点击右上角的 `+` → `New repository`
   - 填写仓库名称（例如：`game-guide-ai`）
   - 选择 `Public` 或 `Private`
   - **不要**勾选 "Initialize this repository with a README"（因为我们要推送现有代码）
   - 点击 `Create repository`

## 🚀 部署步骤

### 方法一：使用命令行（推荐）

#### 1. 初始化 Git 仓库

```bash
cd "ai game master/resume-frontend"
git init
```

#### 2. 添加所有文件

```bash
git add .
```

#### 3. 提交代码

```bash
git commit -m "Initial commit: AI Game Guide Assistant"
```

#### 4. 添加远程仓库

将 `YOUR_USERNAME` 和 `YOUR_REPO_NAME` 替换为你的 GitHub 用户名和仓库名：

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

例如：
```bash
git remote add origin https://github.com/zhangsan/game-guide-ai.git
```

#### 5. 推送到 GitHub

```bash
git branch -M main
git push -u origin main
```

### 方法二：使用 GitHub Desktop（图形界面）

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 登录 GitHub 账号
3. 点击 `File` → `Add Local Repository`
4. 选择项目目录：`ai game master/resume-frontend`
5. 点击 `Publish repository` 按钮
6. 输入仓库名称，选择是否公开，然后点击 `Publish Repository`

## 🔐 重要提示

### ⚠️ 安全提醒

**.env.local 文件已被添加到 .gitignore**，不会提交到 GitHub。这很重要，因为：

- ✅ **安全**：不会暴露你的 API 密钥
- ✅ **隐私**：敏感信息不会被泄露

### 📝 环境变量配置说明

在你的 GitHub 仓库中，建议创建一个 `.env.example` 文件作为模板：

```env
# Deepseek API 密钥
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

这样其他开发者克隆项目后，知道需要配置哪些环境变量。

## 🔄 后续更新代码

每次修改代码后，使用以下命令推送更新：

```bash
cd "ai game master/resume-frontend"

# 查看修改的文件
git status

# 添加修改的文件
git add .

# 提交更改
git commit -m "描述你的更改内容"

# 推送到 GitHub
git push
```

## 🌐 部署到生产环境

### Vercel 部署（推荐）

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 `New Project`
4. 选择你的 GitHub 仓库
5. 配置环境变量：
   - `DEEPSEEK_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. 点击 `Deploy`
7. 等待部署完成，会得到一个 `https://your-project.vercel.app` 的网址

### Netlify 部署

1. 访问 https://www.netlify.com
2. 使用 GitHub 账号登录
3. 点击 `New site from Git`
4. 选择你的 GitHub 仓库
5. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `.next`
6. 在 `Site settings` → `Environment variables` 中添加环境变量
7. 点击 `Deploy site`

## ❓ 常见问题

### 1. 如果提示需要身份验证

如果使用 HTTPS，可能会提示输入用户名和密码。建议使用 Personal Access Token：

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 生成新 token，勾选 `repo` 权限
3. 复制 token，在密码提示时使用这个 token

### 2. 如果推送被拒绝

```bash
# 先拉取远程更改
git pull origin main --allow-unrelated-histories

# 解决冲突后，再推送
git push -u origin main
```

### 3. 如果忘记添加 .env.local 到 .gitignore

如果不小心提交了敏感信息：

```bash
# 从 Git 历史中删除文件（但保留本地文件）
git rm --cached .env.local

# 提交更改
git commit -m "Remove .env.local from repository"

# 推送到 GitHub
git push

# 然后在 GitHub 上删除敏感信息：
# Settings → Security → Secret scanning → Revoke exposed secrets
```

## 📚 更多资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 文档](https://docs.github.com/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
