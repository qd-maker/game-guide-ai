/**
 * Supabase 客户端配置
 * 
 * 这个文件用于创建和管理 Supabase 客户端实例
 * 用于与 Supabase 数据库进行交互（存储聊天历史、用户数据等）
 */

import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 验证环境变量是否配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 环境变量未配置，某些功能可能无法使用')
}

/**
 * 创建 Supabase 客户端实例
 * 用于在服务端和客户端使用
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 在服务端不持久化会话
    autoRefreshToken: false,
  },
})

/**
 * 在服务端使用的 Supabase 客户端
 * 可以用于需要更高权限的操作
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

/**
 * 服务端管理员 Supabase 客户端
 * 用于需要更高权限的操作（如插入数据）
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

