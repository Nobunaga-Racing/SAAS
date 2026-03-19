'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Input } from '@/src/components/ui/Input'
import { Select } from '@/src/components/ui/Select'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'

const schema = z.object({
  type: z.enum(['PRODUCT', 'SERVICE']),
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  unitPrice: z.coerce.number().min(0, 'Prix invalide'),
  vatRate: z.coerce.number().min(0).max(100),
  unit: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewProductPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'SERVICE',
      vatRate: 20,
      unitPrice: 0,
    },
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await api.post('/products', data)
      router.push('/products')
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Erreur lors de la création')
    }
  }

  return (
    <div>
      <Header
        title="Nouveau produit"
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
        <Card title="Détails du produit">
          <div className="space-y-4">
            <Select
              label="Type"
              options={[
                { value: 'SERVICE', label: 'Service' },
                { value: 'PRODUCT', label: 'Produit physique' },
              ]}
              {...register('type')}
            />
            <Input
              label="Nom *"
              placeholder="Développement web, Conseil, etc."
              error={errors.name?.message}
              {...register('name')}
            />
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                placeholder="Description détaillée du produit ou service..."
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                {...register('description')}
              />
            </div>
          </div>
        </Card>

        <Card title="Tarification">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prix unitaire HT *"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.unitPrice?.message}
                {...register('unitPrice')}
              />
              <Input
                label="Unité"
                placeholder="heure, jour, pièce..."
                error={errors.unit?.message}
                {...register('unit')}
              />
            </div>
            <Select
              label="Taux de TVA"
              options={[
                { value: '0', label: '0% — Exonéré' },
                { value: '5.5', label: '5.5% — Taux réduit' },
                { value: '10', label: '10% — Taux intermédiaire' },
                { value: '20', label: '20% — Taux normal' },
              ]}
              error={errors.vatRate?.message}
              {...register('vatRate')}
            />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting}>
            Créer le produit
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
