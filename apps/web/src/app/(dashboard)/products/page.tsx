'use client'

import useSWR, { mutate } from 'swr'
import { useRouter } from 'next/navigation'
import { Plus, Star, ToggleLeft, ToggleRight, Package } from 'lucide-react'
import { api } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Button } from '@/src/components/ui/Button'
import { ColorBadge } from '@/src/components/ui/Badge'
import { formatCurrency } from '@/src/lib/utils'

interface Product {
  id: string
  type: 'PRODUCT' | 'SERVICE'
  name: string
  description?: string
  unitPrice: number
  vatRate: number
  unit?: string
  isActive: boolean
  isFavorite: boolean
}

interface ProductsResponse {
  data: Product[]
  total: number
}

const fetcher = (path: string) => api.get<ProductsResponse>(path)

export default function ProductsPage() {
  const router = useRouter()
  const { data, isLoading } = useSWR('/products', fetcher)
  const products = data?.data ?? []

  const toggleActive = async (p: Product) => {
    try {
      await api.patch(`/products/${p.id}`, { isActive: !p.isActive })
      mutate('/products')
    } catch {}
  }

  const toggleFavorite = async (p: Product) => {
    try {
      await api.patch(`/products/${p.id}`, { isFavorite: !p.isFavorite })
      mutate('/products')
    } catch {}
  }

  return (
    <div>
      <Header
        title="Produits & Services"
        action={
          <Button onClick={() => router.push('/products/new')} size="sm">
            <Plus className="h-4 w-4" />
            Nouveau produit
          </Button>
        }
      />

      {isLoading && (
        <div className="py-12 text-center text-gray-400">Chargement...</div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun produit ou service</p>
          <Button
            className="mt-4"
            size="sm"
            onClick={() => router.push('/products/new')}
          >
            Créer mon premier produit
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                {p.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleFavorite(p)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    p.isFavorite
                      ? 'text-yellow-500 bg-yellow-50'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                  }`}
                  title={p.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Star className="h-4 w-4" fill={p.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => toggleActive(p)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    p.isActive
                      ? 'text-green-500 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={p.isActive ? 'Désactiver' : 'Activer'}
                >
                  {p.isActive ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ColorBadge variant={p.type === 'SERVICE' ? 'blue' : 'indigo'}>
                {p.type === 'SERVICE' ? 'Service' : 'Produit'}
              </ColorBadge>
              <ColorBadge variant={p.isActive ? 'green' : 'gray'}>
                {p.isActive ? 'Actif' : 'Inactif'}
              </ColorBadge>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(p.unitPrice)}
                </span>
                {p.unit && (
                  <span className="text-xs text-gray-400 ml-1">/ {p.unit}</span>
                )}
              </div>
              <span className="text-xs text-gray-500">TVA {p.vatRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
