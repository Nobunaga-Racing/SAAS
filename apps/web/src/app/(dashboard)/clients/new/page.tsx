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
  type: z.enum(['INDIVIDUAL', 'COMPANY']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewClientPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'INDIVIDUAL', country: 'FR' },
  })

  const type = watch('type')

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const payload = {
        type: data.type,
        name: data.type === 'COMPANY'
          ? (data.companyName || '')
          : `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email || undefined,
        phone: data.phone || undefined,
        addressLine1: data.address || undefined,
        zipCode: data.postalCode || undefined,
        city: data.city || undefined,
        country: data.country || 'FR',
      }
      await api.post('/clients', payload)
      router.push('/clients')
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Erreur lors de la création')
    }
  }

  return (
    <div>
      <Header
        title="Nouveau client"
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
        <Card title="Informations générales">
          <div className="space-y-4">
            <Select
              label="Type de client"
              options={[
                { value: 'INDIVIDUAL', label: 'Particulier' },
                { value: 'COMPANY', label: 'Entreprise' },
              ]}
              error={errors.type?.message}
              {...register('type')}
            />

            {type === 'COMPANY' ? (
              <Input
                label="Raison sociale"
                placeholder="ACME SAS"
                error={errors.companyName?.message}
                {...register('companyName')}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  placeholder="Jean"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Nom"
                  placeholder="Dupont"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="contact@exemple.fr"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Téléphone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
          </div>
        </Card>

        <Card title="Adresse">
          <div className="space-y-4">
            <Input
              label="Adresse"
              placeholder="1 rue de la Paix"
              error={errors.address?.message}
              {...register('address')}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Code postal"
                placeholder="75001"
                error={errors.postalCode?.message}
                {...register('postalCode')}
              />
              <div className="col-span-2">
                <Input
                  label="Ville"
                  placeholder="Paris"
                  error={errors.city?.message}
                  {...register('city')}
                />
              </div>
            </div>
            <Input
              label="Pays"
              placeholder="France"
              error={errors.country?.message}
              {...register('country')}
            />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting}>
            Créer le client
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
