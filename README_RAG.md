# RAG 问答系统使用指南

## 项目结构

```
resume-frontend/
├── guide.txt              # 游戏攻略文本
├── vectorize_guide.py     # 向量化脚本
├── index.py               # FastAPI 应用
├── guide_vectors.json     # 生成的向量文件（运行后生成）
├── .env                   # 环境变量配置
└── requirements.txt       # Python 依赖
```

## 完整运行步骤

### 1. 激活虚拟环境

```powershell
# 在项目根目录
.\.venv\Scripts\Activate.ps1
```

### 2. 安装依赖（如果还没安装）

```powershell
cd resume-frontend
pip install -r requirements.txt
```

### 3. 生成向量文件

```powershell
# 在 resume-frontend 目录下运行
python vectorize_guide.py
```

这会：
- 读取 `guide.txt` 文件
- 使用 sentence-transformers 模型生成向量
- 保存到 `guide_vectors.json`

**注意**：首次运行会自动下载模型，可能需要几分钟。

### 4. 配置 API 密钥

确保 `resume-frontend/.env` 文件中设置了 DeepSeek API 密钥：

```
DEEPSEEK_API_KEY=你的_api密钥
```

### 5. 启动 FastAPI 服务

```powershell
# 在 resume-frontend 目录下
python index.py
```

或者使用 uvicorn：

```powershell
uvicorn index:app --reload --host 0.0.0.0 --port 8000
```

服务启动后，访问：
- API 文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/health

### 6. 测试接口

#### 使用 curl：

```powershell
curl -X POST "http://localhost:8000/ask" `
  -H "Content-Type: application/json" `
  -d '{\"question\": \"如何开始游戏？\", \"top_k\": 3}'
```

#### 使用 Python：

```python
import requests

response = requests.post(
    "http://localhost:8000/ask",
    json={"question": "如何开始游戏？", "top_k": 3}
)
print(response.json())
```

#### 使用浏览器访问 API 文档：

打开 http://localhost:8000/docs，可以直接在网页上测试接口。

## API 接口说明

### POST /ask

接收用户问题，返回 AI 回答和相关段落。

**请求体：**
```json
{
  "question": "如何开始游戏？",
  "top_k": 3
}
```

**响应：**
```json
{
  "answer": "根据攻略内容...",
  "relevant_chunks": ["段落1", "段落2", "段落3"]
}
```

### GET /health

健康检查接口，查看服务状态。

## 常见问题

### 1. 向量文件不存在

如果看到 "向量文件不存在" 的错误，请先运行：
```powershell
python vectorize_guide.py
```

### 2. API 密钥未设置

如果没有设置 `DEEPSEEK_API_KEY`，系统会返回简单的基于规则的回答，而不是完整的 LLM 回答。

### 3. 模型下载慢

首次运行 `vectorize_guide.py` 时会自动下载模型，如果下载慢，可以：
- 使用代理
- 手动下载模型到本地

## 更新攻略内容

如果修改了 `guide.txt`，需要重新运行向量化：

```powershell
python vectorize_guide.py
```

然后重启 FastAPI 服务。





























