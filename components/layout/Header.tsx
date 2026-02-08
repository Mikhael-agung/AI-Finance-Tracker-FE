'use client'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { UserNav } from '@/components/layout/UserNav'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { User } from '@supabase/supabase-js'

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-gray-900/60">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </div>
    </header>
  )
}