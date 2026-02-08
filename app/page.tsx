// app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, Shield, RefreshCcw } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              FinanceFlow
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Master Your Finances with
            <span className="text-blue-600"> AI-Powered Insights</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Automatically track transactions, sync with your email, and get intelligent budgeting recommendations. 
            Take control of your financial future.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/login" className="inline-flex">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In with Google
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <RefreshCcw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automatic Sync</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect your Gmail for automatic transaction tracking
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered insights and spending pattern analysis
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bank-Level Security</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is encrypted and secure with Supabase
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 FinanceFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}