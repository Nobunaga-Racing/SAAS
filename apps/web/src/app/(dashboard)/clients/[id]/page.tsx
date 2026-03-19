'use client'

import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Mail, Phone, MapPin, Pencil, Archive } from 'lucide-react'
import { api } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { Badge, ColorBadge } from '@/src/components/ui/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/src/components/ui/Table'
import { formatCurrency, formatDate } from '@/src/lib/utils'

const fetcher = (path: string) => api.get<Client>(path)

type Tab = 'info' | 'invoices' | 'quotes'

interface Client {
  id: string
  type: string
  firstName?: string
  lastName?: string
  companyName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  isActive: boolean
  createdAt: string
}

interface Invoice {
  id: string
  number: string
  totalTTC: number
  status: string
  dueDate?: string
}

interface Quote {
  id: string
  number: string
  totalTTC: number
  status: string
  expiryDate?: string
}

function clientName(c: Client) {
  if (c.type === 'COMPANY') return c.companyName ?? '-'
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || '-'
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('info')
  const [archiving, setArchiving] = useState(false)

  const handleArchive = async () => {
    if (!confirm('Archiver ce client ? Il ne sera plus visible dans la liste.')) return
    setArchiving(true)
    try {
      await api.post(`/clients/${id}/archive`, {})
      router.push('/clients')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur')
      setArchiving(false)
    }
  }

  const key = id ? `/clients/${id}` : null
  const { data: client, isLoading } = useSWR<Client>(key, fetcher)
  const invoicesKey = tab === 'invoices' ? `/invoices?clientId=${id}` : null
  const { data: invoicesData } = useSWR<{ data: Invoice[] }>(
    invoicesKey,
    (path: string) => api.get<{ data: Invoice[] }>(path)
  )
  const quotesKey = tab === 'quotes' ? `/quotes?clientId=${id}` : null
  const { data: quotesData } = useSWR<{ data: Quote[] }>(
    quotesKey,
    (path: string) => api.get<{ data: Quote[] }>(path)
  )

  if (isLoading) {
    return <div className="py-12 text-center text-gray-400">Chargement...</div>
  }
  if (!client) {
    return <div className="py-12 text-center text-gray-400">Client introuvable</div>
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: 'Informations' },
    { key: 'invoices', label: 'Factures' },
    { key: 'quotes', label: 'Devis' },
  ]

  return (
    <div>
      <Header
        title={clientName(client)}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button variant="secondary" size="sm" onClick={() => router.push(`/clients/${id}/edit`)}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
            <Button variant="danger" size="sm" onClick={handleArchive} loading={archiving}>
              <Archive className="h-4 w-4" />
              Archiver
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
          <Card title="Coordonnées">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <ColorBadge variant={client.type === 'COMPANY' ? 'blue' : 'gray'}>
                  {client.type === 'COMPANY' ? 'Entreprise' : 'Particulier'}
                </ColorBadge>
                <ColorBadge variant={client.isActive ? 'green' : 'gray'}>
                  {client.isActive ? 'Actif' : 'Inactif'}
                </ColorBadge>
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${client.email}`} className="hover:text-indigo-600">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  {client.phone}
                </div>
              )}
              {(client.address || client.city) && (
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    {client.address && <div>{client.address}</div>}
                    {(client.postalCode || client.city) && (
                      <div>{[client.postalCode, client.city].filter(Boolean).join(' ')}</div>
                    )}
                    {client.country && <div>{client.country}</div>}
                  </div>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 text-gray-400 text-xs">
                Client depuis le {formatDate(client.createdAt)}
              </div>
            </dl>
          </Card>
        </div>
      )}

      {tab === 'invoices' && (
        <Table>
          <Thead>
            <Tr>
              <Th>Numéro</Th>
              <Th>Montant TTC</Th>
              <Th>Statut</Th>
              <Th>Échéance</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(invoicesData?.data ?? []).length === 0 && (
              <Tr>
                <Td className="text-center text-gray-400 py-8" colSpan={5}>
                  Aucune facture
                </Td>
              </Tr>
            )}
            {(invoicesData?.data ?? []).map((inv) => (
              <Tr key={inv.id}>
                <Td className="font-medium">{inv.number}</Td>
                <Td>{formatCurrency(inv.totalTTC)}</Td>
                <Td><Badge status={inv.status} /></Td>
                <Td>{formatDate(inv.dueDate)}</Td>
                <Td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                  >
                    Voir
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {tab === 'quotes' && (
        <Table>
          <Thead>
            <Tr>
              <Th>Numéro</Th>
              <Th>Montant TTC</Th>
              <Th>Statut</Th>
              <Th>Expiration</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(quotesData?.data ?? []).length === 0 && (
              <Tr>
                <Td className="text-center text-gray-400 py-8" colSpan={5}>
                  Aucun devis
                </Td>
              </Tr>
            )}
            {(quotesData?.data ?? []).map((q) => (
              <Tr key={q.id}>
                <Td className="font-medium">{q.number}</Td>
                <Td>{formatCurrency(q.totalTTC)}</Td>
                <Td><Badge status={q.status} /></Td>
                <Td>{formatDate(q.expiryDate)}</Td>
                <Td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/quotes/${q.id}`)}
                  >
                    Voir
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  )
}
