import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — ini yang bikin user tidak harus login ulang
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect ke login kalau belum login dan akses halaman protected
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/transactions') ||
    request.nextUrl.pathname.startsWith('/wallets') ||
    request.nextUrl.pathname.startsWith('/budgets') ||
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/sync') ||
    request.nextUrl.pathname.startsWith('/reports') ||
    request.nextUrl.pathname.startsWith('/categories')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect ke dashboard kalau sudah login dan akses halaman auth
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/overview'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}