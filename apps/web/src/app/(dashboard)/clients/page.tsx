'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, Plus, Users } from 'lucide-react'
import { api } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Button } from '@/src/components/ui/Button'
import { ColorBadge } from '@/src/components/ui/Badge'

interface Client {
  id: string
  type: 'INDIVIDUAL' | 'COMPANY'
  name: string
  email?: string
  phone?: string
  status: string
}

interface ClientsResponse {
  data: Client[]
  total: number
  meta?: { total: number }
}

const fetcher = (path: string) => api.get<ClientsResponse>(path)

const STATUS_CLIENT: Record<string, string> = {
  ACTIVE: 'ACTIF',
  PROSPECT: 'PROSPECT',
  ARCHIVED: 'ARCHIVÉ',
}

export default function ClientsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useSWR(
    `/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`,
    fetcher
  )

  const clients = data?.data ?? []
  const total = data?.meta?.total ?? data?.total ?? 0

  return (
    <div>
      <Header
        title="Clients"
        subtitle={total > 0 ? `${total} client${total > 1 ? 's' : ''}` : undefined}
        action={
          <Button onClick={() => router.push('/clients/new')} size="sm">
            <Plus className="h-3.5 w-3.5" /> Nouveau client
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          <div className="col-span-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</div>
          <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</div>
          <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Téléphone</div>
          <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</div>
        </div>

        {isLoading && (
          <div className="py-16 text-center text-sm text-gray-400">Chargement...</div>
        )}

        {!isLoading && clients.length === 0 && (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 mb-4">
              {search ? 'Aucun client ne correspond à votre recherche' : 'Aucun client pour le moment'}
            </p>
            {!search && (
              <Button size="sm" onClick={() => router.push('/clients/new')}>
                <Plus className="h-3.5 w-3.5" /> Ajouter un client
              </Button>
            )}
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {clients.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/clients/${c.id}`)}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-indigo-50/20 cursor-pointer transition-colors group"
            >
              <div className="col-span-4">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                  {c.name || '-'}
                </p>
              </div>
              <div className="col-span-2 flex items-center">
                <ColorBadge variant={c.type === 'COMPANY' ? 'blue' : 'gray'}>
                  {c.type === 'COMPANY' ? 'Entreprise' : 'Particulier'}
                </ColorBadge>
              </div>
              <div className="col-span-3 flex items-center text-sm text-gray-600">
                {c.email ?? '-'}
              </div>
              <div className="col-span-2 flex items-center text-sm text-gray-600">
                {c.phone ?? '-'}
              </div>
              <div className="col-span-1 flex items-center">
                <ColorBadge variant={c.status === 'ACTIVE' ? 'green' : c.status === 'PROSPECT' ? 'blue' : 'gray'}>
                  {STATUS_CLIENT[c.status] ?? c.status}
                </ColorBadge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
