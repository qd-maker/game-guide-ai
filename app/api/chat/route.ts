import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { supabaseAdmin } from "@/lib/supabase"

// 设置最大执行时间，防止生成长攻略时超时
export const maxDuration = 60

// 配置 DeepSeek (兼容 OpenAI SDK)
const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  // 获取用户的最后一条消息（即游戏名）
  const lastMessage = messages[messages.length - 1]
  const gameName = lastMessage.content

  // --- 核心逻辑：异步保存搜索记录到 Supabase ---
  // 我们不等待它完成，以免阻塞 AI 的响应速度
  if (gameName) {
    supabaseAdmin
      .from('search_logs') // 确保你在 Supabase 创建了这个表
      .insert([
        {
          game_name: gameName,
          created_at: new Date().toISOString()
        }
      ])
      .then(({ error }) => {
        if (error) console.error('Error saving to Supabase:', error)
      })
  }

  // --- 核心逻辑：调用 DeepSeek API ---
  const result = streamText({
    model: deepseek("deepseek-chat"), // 或者是 "deepseek-reasoner" 如果你需要更强的推理
    system:
      "你是一个专业的游戏攻略助手 AI。你的目标是为电子游戏提供全面、易读的指南。" +
      "当用户提供游戏名称时，请按以下结构输出攻略：" +
      "\n\n" +
      "## 🎮 游戏概览\n" +
      "简短介绍游戏类型和背景。\n\n" +
      "## 💡 新手核心机制\n" +
      "列出3-5个新手必须知道的操作或机制。\n\n" +
      "## 🗺️ 流程与关键策略\n" +
      "针对早期、中期或难点提供通关思路。\n\n" +
      "## 🔥 进阶/白金技巧\n" +
      "提供一些高级玩家或全成就需要的技巧。\n\n" +
      "请使用清晰的 Markdown 格式，多用列表、粗体和 Emoji 让排版更漂亮。语气要热情且专业。",
    messages,
  })

  return result.toDataStreamResponse()
}
