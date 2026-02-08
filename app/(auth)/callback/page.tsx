'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()
        
        // Get the session from URL hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session) {
          toast.success('Login successful!')
          router.push(redirectTo)
        } else {
          toast.error('Authentication failed')
          router.push('/login')
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        toast.error(error.message || 'Authentication failed')
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [router, redirectTo])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Signing you in...
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Please wait while we complete authentication.
        </p>
      </div>
    </div>
  )
}