import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Detect missing env vars at module load. The Supabase client is forgiving
// about undefined inputs (it'll still construct), but every call will fail
// silently — and on prod that surfaces as a blank screen because React's
// first render tries to use the client. Surface a real message instead.
export const envMissing = !url || !key

export const supabase = createClient(url ?? '', key ?? '')
