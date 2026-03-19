'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Zap } from 'lucide-react'
import { api } from '@/src/lib/api'
import { saveAuth } from '@/src/lib/auth'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const res = await api.post<{ accessToken: string; user: unknown }>('/auth/login', data)
      saveAuth(res.accessToken, res.user)
      router.push('/dashboard')
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Erreur de connexion')
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

        <div className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-11 h-11 bg-indigo-600 rounded-xl mb-4 shadow-lg shadow-indigo-600/30">
              <Zap className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              SaaS<span className="text-indigo-600">Gestion</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
          </div>

          {serverError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.fr"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
              Se connecter
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-white/30 mt-6">
        &copy; {new Date().getFullYear()} SaaSGestion — Tous droits réservés
      </p>
    </div>
  )
}
