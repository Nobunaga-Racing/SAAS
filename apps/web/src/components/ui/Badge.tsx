'use client'

import { STATUS_LABELS, STATUS_COLORS } from '@/src/lib/utils'

interface BadgeProps {
  status: string
  className?: string
}

export function Badge({ status, className = '' }: BadgeProps) {
  const label = STATUS_LABELS[status] ?? status
  const color = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${color} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}

interface ColorBadgeProps {
  children: React.ReactNode
  variant?: 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'indigo'
  className?: string
}

const variantMap: Record<string, string> = {
  gray:   'bg-gray-50   text-gray-600   ring-gray-200',
  blue:   'bg-blue-50   text-blue-700   ring-blue-200',
  green:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red:    'bg-red-50    text-red-700    ring-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
}

export function ColorBadge({ children, variant = 'gray', className = '' }: ColorBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  )
}
