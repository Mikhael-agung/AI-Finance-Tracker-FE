'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  CreditCard,
  Home,
  PieChart,
  Settings,
  RefreshCcw,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Wallets', href: '/wallets', icon: Wallet },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Sync', href: '/sync', icon: RefreshCcw },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col grow border-r border-gray-200 dark:border-gray-800 pt-5 bg-white dark:bg-gray-900 overflow-y-auto">
        <div className="flex items-center shrink-0 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              FinanceFlow
            </span>
          </div>
        </div>
        <div className="mt-8 flex-1 flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 shrink-0',
                      isActive
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}