'use client'

import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            block w-full rounded-lg border px-3 py-2.5 text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
            transition-colors
            ${error ? 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200'}
            disabled:bg-gray-50 disabled:text-gray-400
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
