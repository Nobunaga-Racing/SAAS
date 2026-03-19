'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  FilePen,
  Package,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'
import { clearAuth, getUser } from '@/src/lib/auth'

const navItems = [
  { href: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/clients',   label: 'Clients',     icon: Users },
  { href: '/invoices',  label: 'Factures',    icon: FileText },
  { href: '/quotes',    label: 'Devis',       icon: FilePen },
  { href: '/products',  label: 'Produits',    icon: Package },
  { href: '/settings',  label: 'Paramètres',  icon: Settings },
]

function getInitials(user: { firstName?: string; lastName?: string } | null) {
  if (!user) return '?'
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'
}

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const user     = getUser()

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col z-40" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg">
            <Zap className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            SaaS<span className="text-indigo-400">Gestion</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
                }
              `}
              style={!isActive ? undefined : undefined}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} style={{ width: 18, height: 18 }} />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {getInitials(user)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate leading-tight">Compte pro</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
