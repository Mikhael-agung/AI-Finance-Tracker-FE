import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
export const createBrowserClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}

export async function getSession() {
  const supabase = createBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}