import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

// 设置最大执行时间，防止生成长攻略时超时
export const maxDuration = 60

// 配置 Deepseek (兼容 OpenAI SDK)
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

/**
 * POST /api/guide
 * 处理游戏指南请求
 * 
 * Body: { gameName: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { gameName } = await req.json()

    // 验证输入
    if (!gameName || typeof gameName !== 'string' || !gameName.trim()) {
      return NextResponse.json(
        { error: '游戏名称不能为空' },
        { status: 400 }
      )
    }

    const normalizedGameName = gameName.trim()

    // 1. 检查 Supabase 缓存（不区分大小写）
    const { data: cachedGuide, error: queryError } = await supabaseAdmin
      .from('game_guides')
      .select('id, game_name, content, created_at')
      .ilike('game_name', normalizedGameName)
      .maybeSingle()

    if (queryError) {
      console.error('查询 Supabase 缓存时出错:', queryError)
    }

    // 2. 如果找到缓存，直接返回
    if (cachedGuide && cachedGuide.content) {
      return NextResponse.json({
        content: cachedGuide.content,
        cached: true,
        gameName: cachedGuide.game_name,
        createdAt: cachedGuide.created_at,
      })
    }

    // 3. 如果没有缓存，调用 Deepseek API 生成指南
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'Deepseek API 密钥未配置' },
        { status: 500 }
      )
    }

    const systemPrompt = `You are a hardcore gaming expert. Write a comprehensive, structured guide for the game: ${normalizedGameName}. Use Markdown (headers, lists, bolding) to make it readable. Format your response as follows:

## 🎮 Game Overview
Brief introduction to the game type and background.

## 💡 Core Mechanics for Beginners
List 3-5 essential operations or mechanics that newcomers must know.

## 🗺️ Walkthrough & Key Strategies
Provide walkthrough ideas for early game, mid-game, or difficult sections.

## 🔥 Advanced/Completionist Tips
Offer tips for advanced players or achievement hunters.

Use clear Markdown formatting with lists, bold text, and emojis to make it visually appealing. Be enthusiastic and professional in tone.`

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Generate a comprehensive guide for: ${normalizedGameName}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      return NextResponse.json(
        { error: '无法生成游戏指南，请稍后重试' },
        { status: 500 }
      )
    }

    // 4. 保存到 Supabase（使用 upsert 避免重复）
    const { error: insertError } = await supabaseAdmin
      .from('game_guides')
      .upsert(
        {
          game_name: normalizedGameName,
          content: generatedContent,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'game_name',
        }
      )

    if (insertError) {
      console.error('保存到 Supabase 时出错:', insertError)
      // 即使保存失败，也返回生成的内容
    }

    // 5. 返回生成的内容
    return NextResponse.json({
      content: generatedContent,
      cached: false,
      gameName: normalizedGameName,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('处理游戏指南请求时出错:', error)
    
    // 处理 OpenAI API 错误
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { 
          error: `Deepseek API 错误: ${error.message}`,
          status: error.status,
        },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}
