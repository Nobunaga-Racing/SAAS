'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Download, Mail, Send, CreditCard, XCircle, CheckCircle } from 'lucide-react'
import { api, getToken } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { Badge } from '@/src/components/ui/Badge'
import { Modal } from '@/src/components/ui/Modal'
import { Input } from '@/src/components/ui/Input'
import { Select } from '@/src/components/ui/Select'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/src/components/ui/Table'
import { formatCurrency, formatDate } from '@/src/lib/utils'

const BASE = 'http://localhost:4000/api'

interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
  lineTotalHt: number
  lineVatAmount: number
  lineTotalTtc: number
}

interface Payment {
  id: string
  amount: number
  paymentDate: string
  method: string
  reference?: string
}

interface Invoice {
  id: string
  number: string
  status: string
  type: string
  issueDate: string
  dueDate?: string
  subject?: string
  notes?: string
  client: { id: string; name: string; email?: string }
  lines: InvoiceLine[]
  subtotalHt: number
  discountAmount: number
  totalHt: number
  totalVat: number
  totalTtc: number
  amountPaid: number
  amountDue: number
  payments: Payment[]
}

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  { value: 'CREDIT_CARD',   label: 'Carte bancaire' },
  { value: 'CHECK',         label: 'Chèque' },
  { value: 'CASH',          label: 'Espèces' },
  { value: 'DIRECT_DEBIT',  label: 'Prélèvement' },
  { value: 'OTHER',         label: 'Autre' },
]

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const key     = id ? `/invoices/${id}` : null

  const { data: invoice, isLoading } = useSWR<Invoice>(key, (p: string) => api.get<Invoice>(p))

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError]                 = useState('')
  const [paymentModal, setPaymentModal]   = useState(false)
  const [emailModal, setEmailModal]       = useState(false)
  const [emailTo, setEmailTo]             = useState('')
  const [paymentForm, setPaymentForm]     = useState({
    amount: '', paymentDate: new Date().toISOString().split('T')[0],
    method: 'BANK_TRANSFER', reference: '',
  })

  const doAction = async (action: string, body: object = {}) => {
    setActionLoading(action); setError('')
    try {
      await api.post(`/invoices/${id}/${action}`, body)
      globalMutate(key)
    } catch (e: any) { setError(e.message ?? 'Erreur') }
    finally { setActionLoading(null) }
  }

  const handleDownloadPdf = async () => {
    try {
      const res = await fetch(`${BASE}/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error('Erreur PDF')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${invoice?.number ?? 'facture'}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Erreur génération PDF') }
  }

  const handleSendEmail = async () => {
    setActionLoading('email'); setError('')
    try {
      await api.post(`/invoices/${id}/send-email`, emailTo ? { to: emailTo } : {})
      globalMutate(key)
      setEmailModal(false)
      alert('Email envoyé avec succès')
    } catch (e: any) { setError(e.message ?? 'Erreur envoi email') }
    finally { setActionLoading(null) }
  }

  const handlePayment = async () => {
    if (!paymentForm.amount) return
    setActionLoading('payment'); setError('')
    try {
      await api.post(`/invoices/${id}/payments`, {
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        method: paymentForm.method,
        reference: paymentForm.reference || undefined,
      })
      globalMutate(key)
      setPaymentModal(false)
      setPaymentForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], method: 'BANK_TRANSFER', reference: '' })
    } catch (e: any) { setError(e.message ?? 'Erreur') }
    finally { setActionLoading(null) }
  }

  if (isLoading) return <div className="py-12 text-center text-gray-400">Chargement...</div>
  if (!invoice)  return <div className="py-12 text-center text-gray-400">Facture introuvable</div>

  const canPay     = ['SENT', 'PARTIAL', 'OVERDUE'].includes(invoice.status)
  const canSend    = invoice.status === 'DRAFT'
  const canCancel  = !['PAID', 'CANCELLED'].includes(invoice.status)
  const isPaid     = invoice.status === 'PAID'

  return (
    <div>
      <Header
        title={`Facture ${invoice.number}`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {canSend && (
              <Button size="sm" loading={actionLoading === 'send'} onClick={() => doAction('send')}>
                <Send className="h-4 w-4" /> Marquer envoyée
              </Button>
            )}
            {canPay && (
              <Button size="sm" onClick={() => setPaymentModal(true)}>
                <CreditCard className="h-4 w-4" /> Enregistrer paiement
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEmailModal(true)}>
              <Mail className="h-4 w-4" /> Envoyer par email
            </Button>
            {canCancel && (
              <Button variant="danger" size="sm" loading={actionLoading === 'cancel'}
                onClick={() => { if (confirm('Annuler cette facture ?')) doAction('cancel') }}>
                <XCircle className="h-4 w-4" /> Annuler
              </Button>
            )}
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
                <dd><Badge status={invoice.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Type</dt>
                <dd className="text-gray-700">{invoice.type === 'CREDIT_NOTE' ? 'Avoir' : 'Facture'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Client</dt>
                <dd className="text-gray-700 font-medium">{invoice.client?.name ?? '-'}</dd>
              </div>
              {invoice.client?.email && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-500 text-xs">{invoice.client.email}</dd>
                </div>
              )}
              {invoice.subject && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Objet</dt>
                  <dd className="text-gray-700">{invoice.subject}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Émission</dt>
                <dd className="text-gray-700">{formatDate(invoice.issueDate)}</dd>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Échéance</dt>
                  <dd className="text-gray-700">{formatDate(invoice.dueDate)}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Montants">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Sous-total HT</dt>
                <dd>{formatCurrency(invoice.subtotalHt)}</dd>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <dt>Remise</dt>
                  <dd>-{formatCurrency(invoice.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Total HT</dt>
                <dd>{formatCurrency(invoice.totalHt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">TVA</dt>
                <dd>{formatCurrency(invoice.totalVat)}</dd>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <dt>Total TTC</dt>
                <dd className="text-indigo-600">{formatCurrency(invoice.totalTtc)}</dd>
              </div>
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Déjà réglé</dt>
                  <dd>{formatCurrency(invoice.amountPaid)}</dd>
                </div>
              )}
              {invoice.amountDue > 0 && (
                <div className="flex justify-between text-orange-600 font-semibold">
                  <dt>Solde dû</dt>
                  <dd>{formatCurrency(invoice.amountDue)}</dd>
                </div>
              )}
              {isPaid && (
                <div className="flex items-center gap-1.5 text-green-600 font-medium pt-1">
                  <CheckCircle className="h-4 w-4" /> Facture réglée
                </div>
              )}
            </dl>
          </Card>
        </div>

        {/* Lines + Payments */}
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
                {invoice.lines.map((line) => (
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

          {invoice.payments && invoice.payments.length > 0 && (
            <Card title="Paiements reçus">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Méthode</Th>
                    <Th>Référence</Th>
                    <Th>Montant</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {invoice.payments.map((p) => (
                    <Tr key={p.id}>
                      <Td>{formatDate(p.paymentDate)}</Td>
                      <Td>{PAYMENT_METHODS.find((m) => m.value === p.method)?.label ?? p.method}</Td>
                      <Td>{p.reference ?? '-'}</Td>
                      <Td className="font-medium text-green-600">{formatCurrency(p.amount)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Card>
          )}

          {invoice.notes && (
            <Card title="Notes">
              <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Payment modal */}
      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title="Enregistrer un paiement">
        <div className="space-y-4">
          <Input label="Montant (€) *" type="number" step="0.01"
            placeholder={String(invoice.amountDue ?? invoice.totalTtc)}
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
          />
          <Input label="Date de paiement" type="date"
            value={paymentForm.paymentDate}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
          />
          <Select label="Méthode" options={PAYMENT_METHODS}
            value={paymentForm.method}
            onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
          />
          <Input label="Référence" placeholder="Numéro de virement..."
            value={paymentForm.reference}
            onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handlePayment} loading={actionLoading === 'payment'} className="flex-1">
              Enregistrer
            </Button>
            <Button variant="secondary" onClick={() => setPaymentModal(false)} className="flex-1">
              Annuler
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email modal */}
      <Modal open={emailModal} onClose={() => setEmailModal(false)} title="Envoyer par email">
        <div className="space-y-4">
          <Input label="Destinataire"
            type="email"
            placeholder={invoice.client?.email ?? 'email@client.fr'}
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
            <Button variant="secondary" onClick={() => setEmailModal(false)} className="flex-1">
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
