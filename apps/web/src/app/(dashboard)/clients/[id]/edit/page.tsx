'use client'

import useSWR from 'swr'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Input } from '@/src/components/ui/Input'
import { Select } from '@/src/components/ui/Select'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'

interface ClientData {
  id: string
  type: string
  name: string
  email?: string
  phone?: string
  addressLine1?: string
  zipCode?: string
  city?: string
  country?: string
}

const schema = z.object({
  type: z.enum(['INDIVIDUAL', 'COMPANY']),
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const { data: client } = useSWR<ClientData>(
    id ? `/clients/${id}` : null,
    (path: string) => api.get<ClientData>(path)
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (client) {
      reset({
        type: client.type as 'INDIVIDUAL' | 'COMPANY',
        name: client.name,
        email: client.email ?? '',
        phone: client.phone ?? '',
        addressLine1: client.addressLine1 ?? '',
        zipCode: client.zipCode ?? '',
        city: client.city ?? '',
        country: client.country ?? 'FR',
      })
    }
  }, [client, reset])

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await api.put(`/clients/${id}`, {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        addressLine1: data.addressLine1 || undefined,
        zipCode: data.zipCode || undefined,
        city: data.city || undefined,
      })
      router.push(`/clients/${id}`)
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Erreur lors de la modification')
    }
  }

  if (!client) {
    return <div className="py-12 text-center text-gray-400">Chargement...</div>
  }

  return (
    <div>
      <Header
        title="Modifier le client"
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
            <Input
              label="Nom / Raison sociale"
              placeholder="Jean Dupont ou ACME SAS"
              error={errors.name?.message}
              {...register('name')}
            />
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
              error={errors.addressLine1?.message}
              {...register('addressLine1')}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Code postal"
                placeholder="75001"
                error={errors.zipCode?.message}
                {...register('zipCode')}
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
              label="Pays (code ISO)"
              placeholder="FR"
              error={errors.country?.message}
              {...register('country')}
            />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting}>
            Enregistrer
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
