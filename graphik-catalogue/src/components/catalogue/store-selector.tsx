"use client"

import { Store } from "lucide-react"
import type { Store as StoreType } from "@prisma/client"

interface StoreSelectorProps {
  stores: StoreType[]
  onSelect: (storeId: string) => void
}

export function StoreSelector({ stores, onSelect }: StoreSelectorProps) {
  return (
    <div className="max-w-lg mx-auto py-16 text-center">
      <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Store className="w-8 h-8 text-neutral-600" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">
        Sélectionnez votre magasin
      </h1>
      <p className="text-neutral-500 text-sm mb-8">
        Vous gérez plusieurs magasins. Choisissez celui pour lequel vous souhaitez créer un devis.
      </p>
      <div className="grid gap-3">
        {stores.map((store) => (
          <button
            key={store.id}
            onClick={() => onSelect(store.id)}
            className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-400 hover:shadow-sm transition-all text-left group"
          >
            <div>
              <p className="font-semibold text-neutral-900">{store.name}</p>
              {store.city && (
                <p className="text-sm text-neutral-400 mt-0.5">{store.city}</p>
              )}
            </div>
            <span className="text-neutral-400 group-hover:text-neutral-900 transition-colors">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}
