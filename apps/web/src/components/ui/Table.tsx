'use client'

import React from 'react'

export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-100 shadow-sm ${className}`}>
      <table className="min-w-full">{children}</table>
    </div>
  )
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-100">
      {children}
    </thead>
  )
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-50 bg-white">{children}</tbody>
}

export function Tr({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={`hover:bg-indigo-50/30 transition-colors duration-100 ${className}`}>
      {children}
    </tr>
  )
}

export function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

export function Td({
  children,
  className = '',
  colSpan,
}: {
  children: React.ReactNode
  className?: string
  colSpan?: number
}) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3.5 text-sm text-gray-700 ${className}`}>
      {children}
    </td>
  )
}
