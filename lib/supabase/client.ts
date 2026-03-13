import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}

// FIX: pakai getUser() bukan getSession() — lebih reliable untuk token refresh
export async function getSession() {
  const supabase = createBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}