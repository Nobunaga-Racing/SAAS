'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Download, Mail, Send, CheckCircle, XCircle, RefreshCw, Copy } from 'lucide-react'
import { api, getToken } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { Badge } from '@/src/components/ui/Badge'
import { Modal } from '@/src/components/ui/Modal'
import { Input } from '@/src/components/ui/Input'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/src/components/ui/Table'
import { formatCurrency, formatDate } from '@/src/lib/utils'

const BASE = 'http://localhost:4000/api'

interface QuoteLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
  lineTotalHt: number
  lineVatAmount: number
  lineTotalTtc: number
}

interface Quote {
  id: string
  number: string
  status: string
  issueDate: string
  expiryDate?: string
  subject?: string
  notes?: string
  client: { id: string; name: string; email?: string }
  lines: QuoteLine[]
  totals: {
    subtotalHt: number
    discountAmount: number
    totalHt: number
    totalVat: number
    totalTtc: number
  }
  invoiceId?: string
  invoiceNumber?: string
  isExpired?: boolean
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const key     = id ? `/quotes/${id}` : null

  const { data: quote, isLoading } = useSWR<Quote>(key, (p: string) => api.get<Quote>(p))

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError]                 = useState('')
  const [emailModal, setEmailModal]       = useState(false)
  const [emailTo, setEmailTo]             = useState('')
  const [rejectModal, setRejectModal]     = useState(false)
  const [rejectReason, setRejectReason]   = useState('')

  const doAction = async (action: string, body: object = {}, redirect?: (res: any) => void) => {
    setActionLoading(action); setError('')
    try {
      const res = await api.post<any>(`/quotes/${id}/${action}`, body)
      globalMutate(key)
      redirect?.(res)
    } catch (e: any) { setError(e.message ?? 'Erreur') }
    finally { setActionLoading(null) }
  }

  const handleDownloadPdf = async () => {
    try {
      const res = await fetch(`${BASE}/quotes/${id}/pdf`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Erreur PDF')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${quote?.number ?? 'devis'}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Erreur génération PDF') }
  }

  const handleSendEmail = async () => {
    setActionLoading('email'); setError('')
    try {
      await api.post(`/quotes/${id}/send-email`, emailTo ? { to: emailTo } : {})
      globalMutate(key)
      setEmailModal(false)
      alert('Email envoyé avec succès')
    } catch (e: any) { setError(e.message ?? 'Erreur envoi email') }
    finally { setActionLoading(null) }
  }

  const handleConvert = () => {
    doAction('convert', {}, (res) => {
      const invoiceId = res?.id ?? res?.invoiceId
      if (invoiceId) router.push(`/invoices/${invoiceId}`)
    })
  }

  if (isLoading) return <div className="py-12 text-center text-gray-400">Chargement...</div>
  if (!quote)    return <div className="py-12 text-center text-gray-400">Devis introuvable</div>

  const canSend    = quote.status === 'DRAFT'
  const canAccept  = quote.status === 'SENT'
  const canReject  = ['SENT', 'ACCEPTED'].includes(quote.status)
  const canConvert = quote.status === 'ACCEPTED'
  const canDuplicate = !['CONVERTED'].includes(quote.status)

  return (
    <div>
      <Header
        title={`Devis ${quote.number}`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {canSend && (
              <Button size="sm" loading={actionLoading === 'send'} onClick={() => doAction('send')}>
                <Send className="h-4 w-4" /> Envoyer
              </Button>
            )}
            {canAccept && (
              <Button size="sm" loading={actionLoading === 'accept'} onClick={() => doAction('accept')}>
                <CheckCircle className="h-4 w-4" /> Accepter
              </Button>
            )}
            {canReject && (
              <Button variant="danger" size="sm" onClick={() => setRejectModal(true)}>
                <XCircle className="h-4 w-4" /> Refuser
              </Button>
            )}
            {canConvert && (
              <Button variant="secondary" size="sm" loading={actionLoading === 'convert'} onClick={handleConvert}>
                <RefreshCw className="h-4 w-4" /> Convertir en facture
              </Button>
            )}
            {canDuplicate && (
              <Button variant="secondary" size="sm" loading={actionLoading === 'duplicate'}
                onClick={() => doAction('duplicate', {}, (res) => { if (res?.id) router.push(`/quotes/${res.id}`) })}>
                <Copy className="h-4 w-4" /> Dupliquer
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEmailModal(true)}>
              <Mail className="h-4 w-4" /> Envoyer par email
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Info sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <Card title="Informations">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Statut</dt>
                <dd><Badge status={quote.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Client</dt>
                <dd className="text-gray-700 font-medium">{quote.client?.name ?? '-'}</dd>
              </div>
              {quote.client?.email && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-500 text-xs">{quote.client.email}</dd>
                </div>
              )}
              {quote.subject && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Objet</dt>
                  <dd className="text-gray-700">{quote.subject}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Émission</dt>
                <dd className="text-gray-700">{formatDate(quote.issueDate)}</dd>
              </div>
              {quote.expiryDate && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Validité</dt>
                  <dd className={`font-medium ${quote.isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                    {formatDate(quote.expiryDate)}{quote.isExpired ? ' (expiré)' : ''}
                  </dd>
                </div>
              )}
              {quote.invoiceNumber && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Facture</dt>
                  <dd>
                    <button
                      onClick={() => router.push(`/invoices/${quote.invoiceId}`)}
                      className="text-indigo-600 hover:underline text-sm font-medium"
                    >
                      {quote.invoiceNumber}
                    </button>
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Montants">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Sous-total HT</dt>
                <dd>{formatCurrency(quote.totals.subtotalHt)}</dd>
              </div>
              {quote.totals.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <dt>Remise</dt>
                  <dd>-{formatCurrency(quote.totals.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Total HT</dt>
                <dd>{formatCurrency(quote.totals.totalHt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">TVA</dt>
                <dd>{formatCurrency(quote.totals.totalVat)}</dd>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <dt>Total TTC</dt>
                <dd className="text-indigo-600">{formatCurrency(quote.totals.totalTtc)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Lines */}
        <div className="lg:col-span-2 space-y-5">
          <Card title="Lignes">
            <Table>
              <Thead>
                <Tr>
                  <Th>Description</Th>
                  <Th>Qté</Th>
                  <Th>P.U. HT</Th>
                  <Th>TVA</Th>
                  <Th>Total TTC</Th>
                </Tr>
              </Thead>
              <Tbody>
                {quote.lines.map((line) => (
                  <Tr key={line.id}>
                    <Td>{line.description}</Td>
                    <Td>{line.quantity}</Td>
                    <Td>{formatCurrency(line.unitPrice)}</Td>
                    <Td>{line.vatRate} %</Td>
                    <Td className="font-medium">{formatCurrency(line.lineTotalTtc)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>

          {quote.notes && (
            <Card title="Notes">
              <p className="text-sm text-gray-600 whitespace-pre-line">{quote.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Email modal */}
      <Modal open={emailModal} onClose={() => setEmailModal(false)} title="Envoyer par email">
        <div className="space-y-4">
          <Input label="Destinataire" type="email"
            placeholder={quote.client?.email ?? 'email@client.fr'}
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
          />
          <p className="text-xs text-gray-400">
            Laissez vide pour utiliser l&apos;email du client. Le PDF sera joint automatiquement.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSendEmail} loading={actionLoading === 'email'} className="flex-1">
              <Mail className="h-4 w-4" /> Envoyer
            </Button>
            <Button variant="secondary" onClick={() => setEmailModal(false)} className="flex-1">Annuler</Button>
          </div>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Motif de refus">
        <div className="space-y-4">
          <Input label="Motif (optionnel)" placeholder="Prix trop élevé..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="danger" loading={actionLoading === 'reject'} className="flex-1"
              onClick={() => {
                doAction('reject', rejectReason ? { reason: rejectReason } : {})
                setRejectModal(false)
              }}>
              Confirmer le refus
            </Button>
            <Button variant="secondary" onClick={() => setRejectModal(false)} className="flex-1">Annuler</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
