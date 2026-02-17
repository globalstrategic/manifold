import { createClient } from 'common/supabase/utils'
import { ENV_CONFIG } from 'common/envs/constants'

let currentToken: string | undefined

export function getSupabaseInstanceId() {
  return ENV_CONFIG.supabaseInstanceId
}

export function initSupabaseClient() {
  const instanceId = getSupabaseInstanceId()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ENV_CONFIG.supabaseAnonKey
  return createClient(instanceId, anonKey)
}

export function updateSupabaseAuth(token?: string) {
  if (currentToken != token) {
    currentToken = token
    if (token == null) {
      delete db['rest'].headers['Authorization']
      db['realtime'].setAuth(null)
    } else {
      db['rest'].headers['Authorization'] = `Bearer ${token}`
      db['realtime'].setAuth(token)
    }
  }
}

export const db = initSupabaseClient()
