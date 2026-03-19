export function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  PAID: 'Payé',
  OVERDUE: 'En retard',
  CANCELLED: 'Annulé',
  ACCEPTED: 'Accepté',
  REJECTED: 'Refusé',
  EXPIRED: 'Expiré',
  CONVERTED: 'Converti',
  PARTIAL: 'Partiel',
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-gray-50    text-gray-600    ring-gray-200',
  SENT:      'bg-blue-50    text-blue-700    ring-blue-200',
  PAID:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  OVERDUE:   'bg-red-50     text-red-700     ring-red-200',
  CANCELLED: 'bg-gray-50    text-gray-500    ring-gray-200',
  ACCEPTED:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED:  'bg-red-50     text-red-700     ring-red-200',
  EXPIRED:   'bg-orange-50  text-orange-700  ring-orange-200',
  CONVERTED: 'bg-purple-50  text-purple-700  ring-purple-200',
  PARTIAL:   'bg-amber-50   text-amber-700   ring-amber-200',
}
