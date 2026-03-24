'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, ShoppingBag, LogOut, ChefHat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'
import type { User } from '@supabase/supabase-js'

const NAV = [
  { href: '/stores', label: 'Stores', icon: Store },
  { href: '/orders', label: 'All Orders', icon: ShoppingBag },
]

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-60 bg-slate-900 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Merchant</p>
            <p className="text-slate-500 text-xs uppercase tracking-widest">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="px-3 py-2 rounded-lg bg-slate-800 mb-2">
          <p className="text-white text-sm font-medium truncate">
            {user.user_metadata?.name ?? 'Merchant'}
          </p>
          <p className="text-slate-400 text-xs truncate">{user.email}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
