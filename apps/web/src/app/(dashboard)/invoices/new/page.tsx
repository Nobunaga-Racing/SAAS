'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import useSWR from 'swr'
import { api } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Input } from '@/src/components/ui/Input'
import { Select } from '@/src/components/ui/Select'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'
import { formatCurrency } from '@/src/lib/utils'

const lineSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.coerce.number().min(0.01, 'Quantité invalide'),
  unitPrice: z.coerce.number().min(0, 'Prix invalide'),
  vatRate: z.coerce.number().min(0).max(100),
})

const schema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  type: z.enum(['INVOICE', 'CREDIT_NOTE']),
  issueDate: z.string().min(1, 'Date requise'),
  dueDate: z.string().optional(),
  subject: z.string().optional(),
  lines: z.array(lineSchema).min(1, 'Au moins une ligne requise'),
})

type FormData = z.infer<typeof schema>

interface Client {
  id: string
  name: string
}

const fetcher = (path: string) => api.get<{ data: Client[] }>(path)

export default function NewInvoicePage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const { data: clientsData } = useSWR('/clients?limit=200', fetcher)
  const clients = clientsData?.data ?? []

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'INVOICE',
      issueDate: today,
      lines: [{ description: '', quantity: 1, unitPrice: 0, vatRate: 20 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const lines = watch('lines')

  const totalHT = lines.reduce((sum, l) => sum + (l.quantity || 0) * (l.unitPrice || 0), 0)
  const totalTVA = lines.reduce(
    (sum, l) =>
      sum + (l.quantity || 0) * (l.unitPrice || 0) * ((l.vatRate || 0) / 100),
    0
  )
  const totalTTC = totalHT + totalTVA

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const res = await api.post<{ id: string }>('/invoices', data)
      router.push(`/invoices/${res.id}`)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Erreur lors de la création')
    }
  }

  return (
    <div>
      <Header
        title="Nouvelle facture"
        action={
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        }
      />

      {serverError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-4xl">
        <Card title="Informations générales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Client *"
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Sélectionner un client"
              error={errors.clientId?.message}
              {...register('clientId')}
            />
            <Select
              label="Type"
              options={[
                { value: 'INVOICE', label: 'Facture' },
                { value: 'CREDIT_NOTE', label: 'Avoir' },
              ]}
              {...register('type')}
            />
            <Input
              label="Date d'émission *"
              type="date"
              error={errors.issueDate?.message}
              {...register('issueDate')}
            />
            <Input
              label="Date d'échéance"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />
            <div className="md:col-span-2">
              <Input
                label="Objet"
                placeholder="Objet de la facture"
                {...register('subject')}
              />
            </div>
          </div>
        </Card>

        <Card title="Lignes de facturation">
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Qté</div>
              <div className="col-span-2">Prix HT</div>
              <div className="col-span-2">TVA %</div>
              <div className="col-span-1"></div>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 md:col-span-5">
                  <input
                    placeholder="Description du produit/service"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.lines?.[index]?.description ? 'border-red-400' : 'border-gray-300'
                    }`}
                    {...register(`lines.${index}.description`)}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register(`lines.${index}.quantity`)}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register(`lines.${index}.unitPrice`)}
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="20"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...register(`lines.${index}.vatRate`)}
                  />
                </div>
                <div className="col-span-1 flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {errors.lines?.root && (
              <p className="text-xs text-red-600">{errors.lines.root.message}</p>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                append({ description: '', quantity: 1, unitPrice: 0, vatRate: 20 })
              }
            >
              <Plus className="h-4 w-4" />
              Ajouter une ligne
            </Button>
          </div>
        </Card>

        {/* Totaux */}
        <div className="flex justify-end">
          <div className="bg-white rounded-xl border border-gray-200 p-5 w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total HT</span>
              <span>{formatCurrency(totalHT)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA</span>
              <span>{formatCurrency(totalTVA)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total TTC</span>
              <span>{formatCurrency(totalTTC)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting}>
            Créer la facture
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
