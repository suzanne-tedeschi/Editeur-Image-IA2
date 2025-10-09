import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase env variables are required')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

export const SUPABASE_INPUT_BUCKET = process.env.SUPABASE_INPUT_BUCKET || 'input-images'
export const SUPABASE_OUTPUT_BUCKET = process.env.SUPABASE_OUTPUT_BUCKET || 'output-images'
