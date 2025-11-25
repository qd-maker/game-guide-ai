import { NextRequest, NextResponse } from 'next/server'

// FastAPI 后端地址
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const { question, top_k = 3 } = await req.json()

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: '问题不能为空' },
        { status: 400 }
      )
    }

    // 调用 FastAPI 的 /ask 接口
    // 设置超时时间（LLM 生成可能需要更长时间）
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒超时（LLM 生成可能需要时间）
    
    try {
      const response = await fetch(`${FASTAPI_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          top_k: top_k,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('FastAPI 错误:', errorText)
        return NextResponse.json(
          { error: `FastAPI 错误: ${response.status} ${errorText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }

  } catch (error) {
    console.error('调用 FastAPI 时出错:', error)
    
    let errorMessage = '无法连接到后端服务'
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = `请求超时（60秒）。可能原因：\n1. FastAPI 服务未运行\n2. LLM 生成响应时间过长\n3. 网络连接问题\n\n请检查：\n- 确保 FastAPI 服务正在运行: cd resume-frontend && python index.py\n- 检查服务是否在 http://localhost:8000 运行`
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed') || error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到 FastAPI 服务。请确保：\n1. FastAPI 服务正在运行 (python index.py)\n2. 服务运行在 http://localhost:8000\n3. 检查防火墙设置\n\n启动命令：cd resume-frontend && python index.py'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
        hint: '请在新终端运行: cd resume-frontend && python index.py'
      },
      { status: 500 }
    )
  }
}

