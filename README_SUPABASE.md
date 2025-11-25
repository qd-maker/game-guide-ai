# Supabase 配置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 注册/登录账号
3. 创建新项目
4. 等待项目初始化完成

## 2. 创建数据库表

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 运行 `supabase_schema.sql` 文件中的 SQL 脚本
3. 或者直接复制以下 SQL：

```sql
CREATE TABLE IF NOT EXISTS game_guides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_name TEXT NOT NULL UNIQUE,
    guide_content TEXT NOT NULL,
    question TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_guides_game_name ON game_guides(game_name);
CREATE INDEX IF NOT EXISTS idx_game_guides_created_at ON game_guides(created_at);
```

## 3. 获取 API 密钥

1. 在 Supabase Dashboard 中，进入 **Settings** > **API**
2. 复制以下信息：
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_KEY)

## 4. 配置环境变量

在 `resume-frontend/.env` 文件中添加：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
DEEPSEEK_API_KEY=your-deepseek-api-key
FASTAPI_URL=http://localhost:8000
```

## 5. 安装依赖

```bash
cd resume-frontend
pip install -r requirements.txt
```

## 6. 测试

启动 FastAPI 服务后，系统会自动：
- 检测问题中的游戏名称
- 如果 RAG 内容不适用于该游戏，自动生成新攻略
- 将生成的攻略保存到 Supabase

## 功能说明

### 工作流程

1. **提取游戏名称**：从用户问题中识别游戏名称（支持 `<<游戏名>>`、`《游戏名》` 等格式）
2. **RAG 搜索**：在现有攻略中搜索相关内容
3. **游戏匹配检测**：判断 RAG 内容是否适用于输入的游戏
4. **生成新攻略**：如果不匹配，使用 LLM 生成新攻略
5. **保存到 Supabase**：将生成的攻略保存到数据库

### 响应字段

API 响应包含以下字段：
- `answer`: 回答内容
- `relevant_chunks`: 相关段落（RAG 模式）
- `source`: 回答来源（`rag` / `llm_generated` / `llm_general`）
- `game_name`: 检测到的游戏名称



























