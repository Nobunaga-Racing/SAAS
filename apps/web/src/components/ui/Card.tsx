'use client'

import React from 'react'

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function Card({ title, children, className = '', action }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          {title && <h3 className="text-sm font-semibold text-gray-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

const colorMap: Record<string, { bg: string; icon: string; bar: string }> = {
  indigo: { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  bar: 'bg-indigo-500' },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', bar: 'bg-emerald-500' },
  blue:   { bg: 'bg-sky-50',     icon: 'text-sky-600',     bar: 'bg-sky-500' },
  orange: { bg: 'bg-orange-50',  icon: 'text-orange-600',  bar: 'bg-orange-500' },
  red:    { bg: 'bg-red-50',     icon: 'text-red-600',     bar: 'bg-red-500' },
  purple: { bg: 'bg-purple-50',  icon: 'text-purple-600',  bar: 'bg-purple-500' },
}

export function StatCard({
  label,
  value,
  icon,
  color = 'indigo',
  sub,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: string
  sub?: string
}) {
  const c = colorMap[color] ?? colorMap.indigo
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${c.bg} shrink-0`}>
          <div className={c.icon}>{icon}</div>
        </div>
      </div>
    </div>
  )
}
