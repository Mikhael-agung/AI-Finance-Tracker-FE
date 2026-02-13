'use client';

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { TransitionProvider } from '@/components/providers/transition-provider'
import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinanceFlow - Personal Finance Tracker',
  description: 'Track your finances, manage budgets, and sync transactions automatically',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

// 🔍 DEBUG COMPONENT
function SessionDebug() {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getSession();
        
        console.log('📍 [ROOT LAYOUT] Session Check:');
        console.log('  - Path:', window.location.pathname);
        console.log('  - Has Session:', !!data.session);
        console.log('  - Has Provider Token:', !!data.session?.provider_token);
        console.log('  - User ID:', data.session?.user?.id);
        console.log('  - Email:', data.session?.user?.email);
        
        if (data.session?.provider_token) {
          console.log('  ✅ PROVIDER_TOKEN ADA! Panjang:', data.session.provider_token.length);
        } else {
          console.log('  ❌ PROVIDER_TOKEN TIDAK ADA');
        }
      } catch (error) {
        console.error('Debug session error:', error);
      }
    };

    checkSession();
  }, []);

  return null; // Component ini gak ngerender apapun
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      translate="no"
      suppressHydrationWarning
      className="notranslate"
    >
      <head>
        <meta name="google" content="notranslate" />
        <meta name="robots" content="noimageindex" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TransitionProvider>
            {/* 🔍 DEBUG - Muncul di setiap page */}
            <SessionDebug />
            {children}
          </TransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}