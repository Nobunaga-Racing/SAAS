'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Plus, FileText, Search } from 'lucide-react'
import { api } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { formatCurrency, formatDate } from '@/src/lib/utils'

interface Invoice {
  id: string
  number: string
  client?: { name: string }
  totalTtc: number
  status: string
  dueDate?: string
  issueDate: string
}

interface InvoicesResponse {
  data: Invoice[]
  total: number
  meta?: { total: number }
}

const fetcher = (path: string) => api.get<InvoicesResponse>(path)

export default function InvoicesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useSWR(
    `/invoices${search ? `?search=${encodeURIComponent(search)}` : ''}`,
    fetcher
  )
  const invoices = data?.data ?? []
  const total = data?.meta?.total ?? data?.total ?? 0

  return (
    <div>
      <Header
        title="Factures"
        subtitle={total > 0 ? `${total} facture${total > 1 ? 's' : ''}` : undefined}
        action={
          <Button onClick={() => router.push('/invoices/new')} size="sm">
            <Plus className="h-3.5 w-3.5" /> Nouvelle facture
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher une facture..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Numéro</div>
          <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Émission</div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Échéance</div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Montant TTC</div>
          <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</div>
        </div>

        {isLoading && (
          <div className="py-16 text-center text-sm text-gray-400">Chargement...</div>
        )}

        {!isLoading && invoices.length === 0 && (
          <div className="py-16 text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 mb-4">
              {search ? 'Aucune facture ne correspond à votre recherche' : 'Aucune facture pour le moment'}
            </p>
            {!search && (
              <Button size="sm" onClick={() => router.push('/invoices/new')}>
                <Plus className="h-3.5 w-3.5" /> Créer une facture
              </Button>
            )}
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              onClick={() => router.push(`/invoices/${inv.id}`)}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-indigo-50/20 cursor-pointer transition-colors group"
            >
              <div className="col-span-2 flex items-center">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                  {inv.number}
                </p>
              </div>
              <div className="col-span-3 flex items-center text-sm text-gray-600">
                {inv.client?.name ?? '-'}
              </div>
              <div className="col-span-2 flex items-center text-sm text-gray-500">
                {formatDate(inv.issueDate)}
              </div>
              <div className="col-span-2 flex items-center text-sm text-gray-500">
                {formatDate(inv.dueDate)}
              </div>
              <div className="col-span-2 flex items-center justify-end">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(inv.totalTtc ?? 0)}
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                <Badge status={inv.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
