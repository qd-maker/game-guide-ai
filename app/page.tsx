"use client"

import { Search, Gamepad2, Sparkles, ChevronRight, Terminal, AlertCircle } from 'lucide-react'
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import ReactMarkdown from 'react-markdown'

interface GuideResponse {
  content: string
  cached: boolean
  gameName: string
  createdAt: string
}

export default function GameGuidePage() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [guideContent, setGuideContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (guideContent) {
      scrollToBottom()
    }
  }, [guideContent])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || isLoading) return

    const gameName = input.trim()
    setIsLoading(true)
    setError(null)
    setGuideContent(null)
    setIsCached(false)

    try {
      const response = await fetch('/api/guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameName }),
      })

      const data: GuideResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP 错误! 状态码: ${response.status}`)
      }

      setGuideContent(data.content)
      setIsCached(data.cached)
    } catch (err) {
      console.error('获取游戏指南时出错:', err)
      setError(
        err instanceof Error 
          ? err.message 
          : '无法获取游戏指南，请稍后重试'
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
            Master Any Game <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              Instantly
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enter a game title below and let our AI generate a comprehensive strategy guide, tips, and walkthroughs in seconds.
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
              placeholder="Enter game name (e.g., Elden Ring, Cyberpunk 2077)..."
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
                    Generate Guide <ChevronRight className="ml-1 h-4 w-4" />
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
        {(guideContent || isLoading) && (
          <div className="w-full max-w-4xl mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm uppercase tracking-wider font-semibold">
              <Terminal className="h-4 w-4" />
              <span>Generated Guide</span>
              {isCached && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs normal-case">
                  缓存
                </span>
              )}
            </div>
            
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden shadow-2xl glow-box">
              <div className="p-6 md:p-10 prose prose-invert prose-headings:text-primary prose-a:text-cyan-400 prose-strong:text-foreground max-w-none">
                {guideContent ? (
                  <div className="leading-relaxed markdown-content">
                    <ReactMarkdown
                      components={{
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mb-4 mt-6 text-primary">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mb-3 mt-5 text-primary">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mb-2 mt-4 text-foreground">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4">{children}</li>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                      code: ({ children }) => (
                        <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
                          {children}
                        </code>
                      ),
                    }}
                    >
                      {guideContent}
                    </ReactMarkdown>
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
                <span>AI-Generated Content</span>
                <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500/50" />
                  <span>System Online</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State / Features */}
        {!guideContent && !isLoading && !error && (
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
