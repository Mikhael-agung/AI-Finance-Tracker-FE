import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, AlertCircle } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-6">
            <div className="max-w-md text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-950/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>

                <h1 className="text-7xl font-bold text-gray-900 dark:text-white mb-4">404</h1>

                <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Page Not Found
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button size="lg" className="w-full sm:w-auto">
                            <Home className="mr-2 h-5 w-5" />
                            Back to Home
                        </Button>
                    </Link>

                    <Link href="/dashboard">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                            <Search className="mr-2 h-5 w-5" />
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        If you believe this is an error, please contact support.
                    </p>
                </div>
            </div>
        </div>
    )
}