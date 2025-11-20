/**
 * Supabase 客户端配置
 * 
 * 这个文件用于创建和管理 Supabase 客户端实例
 * 用于与 Supabase 数据库进行交互（存储聊天历史、用户数据等）
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
const getSupabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const getSupabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const getSupabaseServiceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 创建一个安全的客户端创建函数
function createSupabaseClientSafely(url: string, key: string): SupabaseClient {
  // 如果 URL 或 Key 为空，使用占位符值来避免构建时错误
  const safeUrl = url || 'https://placeholder.supabase.co'
  const safeKey = key || 'placeholder-key-123456789012345678901234567890123456789012345678901234567890'
  
  try {
    return createClient(safeUrl, safeKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  } catch (error) {
    // 如果创建失败，仍然返回一个客户端实例（使用占位符）
    console.warn('⚠️ Supabase 客户端创建失败，使用占位符客户端:', error)
    return createClient('https://placeholder.supabase.co', safeKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
}

/**
 * 创建 Supabase 客户端实例
 * 用于在服务端和客户端使用
 */
export const supabase = createSupabaseClientSafely(getSupabaseUrl(), getSupabaseAnonKey())

/**
 * 在服务端使用的 Supabase 客户端
 * 可以用于需要更高权限的操作
 */
export function createServerClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseServiceRoleKey() || getSupabaseAnonKey()
  return createSupabaseClientSafely(url, key)
}

/**
 * 服务端管理员 Supabase 客户端
 * 用于需要更高权限的操作（如插入数据）
 */
export const supabaseAdmin = (() => {
  const url = getSupabaseUrl()
  const key = getSupabaseServiceRoleKey() || getSupabaseAnonKey()
  return createSupabaseClientSafely(url, key)
})()

