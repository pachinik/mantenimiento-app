import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://enpfrtuosmabhmhwemwm.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const MAINTENANCE_TABLE = 'maintenance_records'
export const MAINTENANCE_BUCKET = 'maintenance-files'

let client: SupabaseClient | null = null

export function getSupabase() {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Falta la variable NEXT_PUBLIC_SUPABASE_ANON_KEY para conectar con Supabase.')
  }
  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })
  return client
}
