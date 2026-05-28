'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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
  { name: 'Dashboard', href: '/dashboard/overview', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Wallets', href: '/wallets', icon: Wallet },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Sync', href: '/sync', icon: RefreshCcw },
  { name: 'Settings', href: '/settings', icon: Settings },
]

function SidebarContent() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    navItems.forEach(item => { router.prefetch(item.href) })
  }, [router])

  return (
    <div className="flex flex-col grow border-r border-gray-200 dark:border-gray-800 pt-14 bg-white dark:bg-gray-900 overflow-y-auto h-full">
      {/* Logo */}
      <div className="flex items-center shrink-0 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-primary">
            <span className="text-primary font-bold italic text-base" style={{ fontFamily: 'Georgia, serif' }}>
              FF
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            FinanceFlow
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="mt-10 flex-1 flex flex-col">
        <nav className="flex-1 px-3 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-3 text-lg font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                )}
              >
                <Icon
                  className={cn(
                    'mr-4 h-6 w-6 shrink-0',
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
  )
}

export function Sidebar() {
  return (
    <div className="hidden xl:flex xl:w-63 xl:flex-col xl:fixed xl:inset-y-0">
      <SidebarContent />
    </div>
  )
}

export function MobileSidebar() {
  return (
    <div className="flex flex-col w-64 h-full">
      <SidebarContent />
    </div>
  )
}