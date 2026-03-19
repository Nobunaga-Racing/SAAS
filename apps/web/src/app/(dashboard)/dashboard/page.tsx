'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Users, FileText, TrendingUp, FilePen, Clock, AlertTriangle, Plus, ArrowRight } from 'lucide-react'
import { api } from '@/src/lib/api'
import { getUser } from '@/src/lib/auth'
import { Header } from '@/src/components/layout/Header'
import { StatCard } from '@/src/components/ui/Card'
import { Badge } from '@/src/components/ui/Badge'
import { Button } from '@/src/components/ui/Button'
import { formatCurrency, formatDate } from '@/src/lib/utils'

interface PaginatedResponse<T = unknown> {
  data?: T[]
  total?: number
  meta?: { total: number }
}

interface AccountingData {
  revenue?: number
  invoiced?: number
  pending?: number
}

interface Invoice {
  id: string
  number: string
  client?: { name: string }
  totalTtc: number
  status: string
  dueDate?: string
}

interface Quote {
  id: string
  number: string
  client?: { name: string }
  totals: { totalTtc: number }
  status: string
  expiryDate?: string
}

function now() { return new Date().toISOString().split('T')[0] }

export default function DashboardPage() {
  const user   = getUser()
  const router = useRouter()

  const { data: clients }      = useSWR('/clients?limit=1', (p: string) => api.get<PaginatedResponse>(p), { onErrorRetry: () => {} })
  const { data: quotesData }   = useSWR('/quotes?status=SENT&limit=5', (p: string) => api.get<PaginatedResponse<Quote>>(p), { onErrorRetry: () => {} })
  const { data: invoicesData } = useSWR('/invoices?limit=5', (p: string) => api.get<PaginatedResponse<Invoice>>(p), { onErrorRetry: () => {} })
  const { data: overdueData }  = useSWR('/invoices?overdue=true&limit=1', (p: string) => api.get<PaginatedResponse>(p), { onErrorRetry: () => {} })
  const { data: accounting }   = useSWR('/accounting/summary', (p: string) => api.get<AccountingData>(p), { onErrorRetry: () => {} })

  const totalClients    = clients?.meta?.total ?? clients?.total ?? 0
  const pendingQuotes   = quotesData?.meta?.total ?? quotesData?.total ?? 0
  const overdueCount    = overdueData?.meta?.total ?? overdueData?.total ?? 0
  const revenue         = accounting?.revenue ?? 0
  const recentInvoices  = invoicesData?.data ?? []
  const recentQuotes    = quotesData?.data ?? []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bonne après-midi' : 'Bonsoir'

  return (
    <div>
      {/* Welcome banner */}
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}{user?.firstName ? `, ${user.firstName}` : ''} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Voici un aperçu de votre activité — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => router.push('/quotes/new')}>
            <Plus className="h-3.5 w-3.5" /> Nouveau devis
          </Button>
          <Button size="sm" onClick={() => router.push('/invoices/new')}>
            <Plus className="h-3.5 w-3.5" /> Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Total clients"
          value={totalClients}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          sub="actifs"
        />
        <StatCard
          label="CA encaissé"
          value={formatCurrency(revenue)}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
          sub="toutes périodes"
        />
        <StatCard
          label="Devis en attente"
          value={pendingQuotes}
          icon={<FilePen className="h-5 w-5" />}
          color="indigo"
          sub="réponse client attendue"
        />
        <StatCard
          label="Factures en retard"
          value={overdueCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={overdueCount > 0 ? 'red' : 'green'}
          sub={overdueCount > 0 ? 'nécessitent une relance' : 'aucune en retard'}
        />
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Recent invoices */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-800">Dernières factures</h3>
            </div>
            <button onClick={() => router.push('/invoices')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentInvoices.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Aucune facture</div>
            ) : recentInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => router.push(`/invoices/${inv.id}`)}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{inv.number}</p>
                  <p className="text-xs text-gray-500 truncate">{inv.client?.name ?? '-'}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.totalTtc)}</p>
                    {inv.dueDate && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" /> {formatDate(inv.dueDate)}
                      </p>
                    )}
                  </div>
                  <Badge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending quotes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FilePen className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-800">Devis en attente</h3>
            </div>
            <button onClick={() => router.push('/quotes')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentQuotes.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Aucun devis en attente</div>
            ) : recentQuotes.map((q) => (
              <div
                key={q.id}
                onClick={() => router.push(`/quotes/${q.id}`)}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{q.number}</p>
                  <p className="text-xs text-gray-500 truncate">{q.client?.name ?? '-'}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(q.totals?.totalTtc ?? 0)}</p>
                    {q.expiryDate && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" /> {formatDate(q.expiryDate)}
                      </p>
                    )}
                  </div>
                  <Badge status={q.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
