import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Alex Chen | Senior Frontend Engineer',
  description: 'Senior Frontend Engineer specializing in building accessible, pixel-perfect digital experiences.',
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className={cn(inter.className, "bg-background text-foreground antialiased leading-relaxed selection:bg-teal-300 selection:text-teal-900")}>
        <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 font-sans md:px-12 md:py-20 lg:px-24 lg:py-0">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
