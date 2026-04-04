import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isPlaceholder = !supabaseUrl || 
  supabaseUrl.includes('your-project-id') || 
  supabaseUrl.includes('placeholder') ||
  !supabaseAnonKey || 
  supabaseAnonKey === 'your-anon-key' ||
  supabaseAnonKey === 'placeholder-key';

if (isPlaceholder) {
  console.warn('Supabase credentials are missing or using placeholders. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
