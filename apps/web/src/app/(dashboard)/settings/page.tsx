'use client'

import useSWR from 'swr'
import { useForm } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { api, getToken } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { Card } from '@/src/components/ui/Card'

interface Settings {
  id: string
  name: string
  companyName?: string
  siret?: string
  vatNumber?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  zipCode?: string
  country?: string
  phone?: string
  logoUrl?: string
  defaultPaymentTermDays?: number
  invoiceFooter?: string
  smtpHost?: string
  smtpPort?: number
  smtpSecure?: boolean
  smtpUser?: string
  smtpFrom?: string
}

type FormData = Omit<Settings, 'id' | 'name' | 'logoUrl'> & { smtpPass?: string }

export default function SettingsPage() {
  const { data: settings, mutate } = useSWR<Settings>(
    '/settings',
    (path: string) => api.get<Settings>(path)
  )

  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>()

  useEffect(() => {
    if (settings) {
      reset({
        companyName: settings.companyName ?? '',
        siret: settings.siret ?? '',
        vatNumber: settings.vatNumber ?? '',
        addressLine1: settings.addressLine1 ?? '',
        addressLine2: settings.addressLine2 ?? '',
        city: settings.city ?? '',
        zipCode: settings.zipCode ?? '',
        country: settings.country ?? 'FR',
        phone: settings.phone ?? '',
        defaultPaymentTermDays: settings.defaultPaymentTermDays ?? 30,
        invoiceFooter: settings.invoiceFooter ?? '',
        smtpHost:   settings.smtpHost   ?? '',
        smtpPort:   settings.smtpPort   ?? 587,
        smtpSecure: settings.smtpSecure ?? false,
        smtpUser:   settings.smtpUser   ?? '',
        smtpFrom:   settings.smtpFrom   ?? '',
        smtpPass:   '',
      })
      if (settings.logoUrl) setLogoPreview(`http://localhost:4000${settings.logoUrl}`)
    }
  }, [settings, reset])

  const onSubmit = async (data: FormData) => {
    const payload: Record<string, unknown> = { ...data }
    // Ne pas écraser le mot de passe si le champ est laissé vide
    if (!data.smtpPass) delete payload.smtpPass
    await api.put('/settings', payload)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    mutate()
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      const res = await fetch('http://localhost:4000/api/settings/logo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      if (!res.ok) throw new Error('Erreur upload')
      const json = await res.json()
      setLogoPreview(`http://localhost:4000${json.data.logoUrl}`)
      mutate()
    } catch {
      alert('Erreur lors de l\'upload du logo')
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = async () => {
    await api.put('/settings', { logoUrl: null })
    setLogoPreview(null)
    mutate()
  }

  return (
    <div>
      <Header title="Paramètres de l'entreprise" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">

        {/* Logo */}
        <Card title="Logo de l'entreprise">
          <div className="flex items-center gap-6">
            <div className="relative">
              {logoPreview ? (
                <div className="relative group">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-24 w-24 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400">
                  <Upload className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {logoPreview ? 'Changer le logo' : 'Importer un logo'}
              </Button>
              <p className="text-xs text-gray-400">PNG, JPG, SVG · Max 2 Mo</p>
            </div>
          </div>
        </Card>

        {/* Infos société */}
        <Card title="Informations légales">
          <div className="space-y-4">
            <Input label="Raison sociale" placeholder="Mon Entreprise SAS" {...register('companyName')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="SIRET" placeholder="12345678901234" {...register('siret')} />
              <Input label="N° TVA intracommunautaire" placeholder="FR12345678901" {...register('vatNumber')} />
            </div>
            <Input label="Téléphone" placeholder="+33 1 23 45 67 89" {...register('phone')} />
          </div>
        </Card>

        {/* Adresse */}
        <Card title="Adresse">
          <div className="space-y-4">
            <Input label="Adresse ligne 1" placeholder="1 rue de la Paix" {...register('addressLine1')} />
            <Input label="Adresse ligne 2" placeholder="Bâtiment A" {...register('addressLine2')} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="Code postal" placeholder="75001" {...register('zipCode')} />
              <div className="col-span-2">
                <Input label="Ville" placeholder="Paris" {...register('city')} />
              </div>
            </div>
            <Input label="Pays (code ISO)" placeholder="FR" {...register('country')} />
          </div>
        </Card>

        {/* Facturation */}
        <Card title="Paramètres de facturation">
          <div className="space-y-4">
            <Input
              label="Délai de paiement par défaut (jours)"
              type="number"
              placeholder="30"
              {...register('defaultPaymentTermDays', { valueAsNumber: true })}
            />
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Pied de page des factures
              </label>
              <textarea
                rows={3}
                placeholder="Mentions légales, IBAN, conditions de paiement..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
                {...register('invoiceFooter')}
              />
            </div>
          </div>
        </Card>

        {/* Email / SMTP */}
        <Card title="Configuration email (envoi de factures)">
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Configurez votre serveur SMTP pour envoyer des factures et devis par email depuis votre propre adresse.
              Pour Gmail, utilisez un <strong>mot de passe d&apos;application</strong> (pas votre mot de passe habituel).
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Serveur SMTP" placeholder="smtp.gmail.com" {...register('smtpHost')} />
              <Input label="Port" type="number" placeholder="587" {...register('smtpPort', { valueAsNumber: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Utilisateur / Email expéditeur" placeholder="vous@gmail.com" {...register('smtpUser')} />
              <Input label="Adresse d'affichage (From)" placeholder="Mon Entreprise <vous@gmail.com>" {...register('smtpFrom')} />
            </div>
            <Input
              label="Mot de passe SMTP"
              type="password"
              placeholder="Laissez vide pour conserver le mot de passe actuel"
              {...register('smtpPass')}
            />
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="smtpSecure"
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/30"
                {...register('smtpSecure')}
              />
              <label htmlFor="smtpSecure" className="text-sm text-gray-700 cursor-pointer">
                Connexion sécurisée (SSL/TLS — port 465)
              </label>
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={isSubmitting}>
            Enregistrer
          </Button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              ✓ Paramètres sauvegardés
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
