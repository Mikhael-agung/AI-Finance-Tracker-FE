import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./globals.css"
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinanceFlow - Dashboard',
  description: 'Personal finance tracking dashboard',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user }, error } = await (await supabase).auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header user={user} />
              <main className="flex-1 p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}