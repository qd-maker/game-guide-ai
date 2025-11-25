"use client"

import { Search, Gamepad2, Sparkles, ChevronRight, Terminal, AlertCircle, ChevronDown } from 'lucide-react'
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import ReactMarkdown from 'react-markdown'

interface RAGResponse {
  answer: string
  relevant_chunks: string[]
  source: string  // "rag" 或 "llm_generated" 或 "llm_general"
  game_name?: string  // 检测到的游戏名称
}

export default function GameGuidePage() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [relevantChunks, setRelevantChunks] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [gameName, setGameName] = useState<string | null>(null)
  const [showChunks, setShowChunks] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (answer) {
      scrollToBottom()
    }
  }, [answer])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || isLoading) return

    const question = input.trim()
    setIsLoading(true)
    setError(null)
    setAnswer(null)
    setRelevantChunks([])
    setSource(null)
    setGameName(null)
    setShowChunks(false)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          top_k: 3 
        }),
      })

      const data: RAGResponse = await response.json()

      if (!response.ok) {
        throw new Error((data as any).error || `HTTP 错误! 状态码: ${response.status}`)
      }

      setAnswer(data.answer)
      setRelevantChunks(data.relevant_chunks || [])
      setSource(data.source || 'rag')
      setGameName(data.game_name || null)
    } catch (err) {
      console.error('获取回答时出错:', err)
      setError(
        err instanceof Error 
          ? err.message 
          : '无法获取回答，请确保 FastAPI 服务正在运行 (http://localhost:8000)'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern opacity-50" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">GameGuide AI</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Guides
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Latest
            </a>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              Sign In
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-12 md:py-24 flex flex-col items-center min-h-[calc(100vh-4rem)]">
        {/* Hero Section */}
        <div className="w-full max-w-3xl text-center space-y-6 mb-12">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            <span>Next-Gen Strategy Guides</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl glow-text">
            RAG 游戏攻略助手 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              智能问答
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            基于游戏攻略内容，智能回答你的问题。输入你的问题，获取准确的攻略答案。
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full max-w-2xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <form
            onSubmit={handleSearch}
            className="relative flex items-center"
          >
            <div className="absolute left-4 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题，例如：如何开始游戏？怎么升级？如何救出公主？"
              className="h-14 pl-12 pr-4 rounded-xl border-border/50 bg-background/90 backdrop-blur-xl text-lg shadow-xl focus-visible:ring-primary/50 transition-all"
            />
            <div className="absolute right-2">
              <Button 
                type="submit" 
                size="sm" 
                disabled={isLoading || !input.trim()}
                className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:0.4s]" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    提问 <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="w-full max-w-4xl mt-8">
            <Card className="bg-destructive/10 border-destructive/20 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">错误</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            </Card>
          </div>
        )}

        {/* Results Area */}
        {(answer || isLoading) && (
          <div className="w-full max-w-4xl mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-wider font-semibold">
              <Terminal className="h-4 w-4" />
                <span>
                  {source === 'rag' ? 'RAG 回答' : source === 'llm_generated' ? 'LLM 生成攻略' : 'LLM 通用回答'}
                </span>
              </div>
              {gameName && (
                <div className="text-sm text-primary font-medium">
                  🎮 游戏: {gameName}
                </div>
              )}
              {source === 'llm_generated' && (
                <div className="text-xs text-green-500 font-medium">
                  ✅ 已保存到 Supabase
                </div>
              )}
            </div>
            
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden shadow-2xl glow-box">
              <div className="p-6 md:p-10 prose prose-invert prose-headings:text-primary prose-a:text-cyan-400 prose-strong:text-foreground max-w-none">
                {answer ? (
                  <div className="space-y-6">
                    {/* 回答内容 */}
                  <div className="leading-relaxed markdown-content">
                      <h3 className="text-xl font-semibold mb-3 text-primary">回答：</h3>
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <ReactMarkdown
                      components={{
                      p: ({ children }) => (
                              <p className="mb-2 leading-relaxed">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                          {children}
                              </ul>
                            ),
                            li: ({ children }) => (
                              <li className="ml-4">{children}</li>
                      ),
                    }}
                    >
                          {answer}
                    </ReactMarkdown>
                      </div>
                    </div>

                    {/* 相关段落 */}
                    {relevantChunks.length > 0 && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setShowChunks((prev) => !prev)}
                          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${showChunks ? 'rotate-180' : ''}`}
                          />
                          {showChunks ? '收起相关攻略段落' : '展开相关攻略段落'}
                        </button>
                        {showChunks && (
                          <div className="space-y-3 mt-3">
                            {relevantChunks.map((chunk, index) => (
                              <div
                                key={index}
                                className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm"
                              >
                                <span className="text-primary font-medium">段落 {index + 1}:</span>{' '}
                                <span className="text-muted-foreground">{chunk}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-primary/10 rounded w-1/3 mb-6" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                    <div className="h-4 bg-muted rounded w-4/6" />
                    <div className="h-32 bg-muted/50 rounded w-full mt-6" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Footer of card */}
              <div className="bg-muted/30 px-6 py-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                <span>基于 RAG 系统生成</span>
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500/50" />
                  <span>System Online</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State / Features */}
        {!answer && !isLoading && !error && (
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {[
              {
                title: "Instant Strategy",
                desc: "Get real-time tactics for boss fights and difficult levels.",
                icon: "⚡",
              },
              {
                title: "Deep Lore",
                desc: "Understand the story and character backgrounds instantly.",
                icon: "📚",
              },
              {
                title: "Pro Builds",
                desc: "Optimize your character with the best equipment and stats.",
                icon: "🛡️",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all duration-300 cursor-default"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
