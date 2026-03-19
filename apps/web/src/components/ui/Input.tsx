'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-lg border px-3 py-2.5 text-sm
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
            placeholder:text-gray-400
            ${error
              ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/20'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
