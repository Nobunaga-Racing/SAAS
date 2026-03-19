'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@/src/lib/auth'
import { Sidebar } from '@/src/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isLoggedIn()) router.replace('/login')
  }, [router])

  if (!mounted || !isLoggedIn()) return null

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
