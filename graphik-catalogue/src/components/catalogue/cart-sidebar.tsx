"use client"

import { useRouter } from "next/navigation"
import { ShoppingCart, Trash2, Paperclip, ArrowRight, Save, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { CartLine } from "@/hooks/use-cart"

interface CartSidebarProps {
  lines: CartLine[]
  totalHT: number
  briefId: string | null
  storeId: string
  readonly?: boolean
  isSaving?: boolean
  onUpdateLine: (index: number, updates: Partial<CartLine>) => void
  onRemoveLine: (index: number) => void
  onClose?: () => void
}

export function CartSidebar({
  lines,
  totalHT,
  briefId,
  storeId,
  readonly,
  isSaving,
  onUpdateLine,
  onRemoveLine,
  onClose,
}: CartSidebarProps) {
  const router = useRouter()

  const handleProceed = () => {
    if (!briefId || lines.length === 0) return
    onClose?.()
    router.push(`/devis?storeId=${storeId}&briefId=${briefId}`)
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      {/* En-tête */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-neutral-600" />
          <h2 className="font-semibold text-neutral-900 text-sm">
            Mon devis ({lines.length})
          </h2>
        </div>
        {isSaving && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Sauvegarde…
          </div>
        )}
        {!isSaving && lines.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <Save className="w-3 h-3" />
            Sauvegardé
          </div>
        )}
      </div>

      {/* Lignes */}
      <div className="max-h-80 overflow-y-auto">
        {lines.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingCart className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-400 text-sm">Votre devis est vide</p>
            <p className="text-neutral-300 text-xs mt-1">
              Ajoutez des prestations depuis le catalogue
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-50">
            {lines.map((line, i) => (
              <li key={i} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {line.productName}
                    </p>
                    {line.width && line.height && (
                      <p className="text-xs text-neutral-400">
                        {line.width}m × {line.height}m
                      </p>
                    )}
                    {line.selectedOption && (
                      <p className="text-xs text-neutral-400">{line.selectedOption}</p>
                    )}
                  </div>
                  {!readonly && (
                    <button
                      onClick={() => onRemoveLine(i)}
                      className="text-neutral-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  {!readonly ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateLine(i, { quantity: Math.max(1, line.quantity - 1) })}
                        className="w-6 h-6 rounded border border-neutral-300 text-neutral-600 text-sm flex items-center justify-center hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold w-4 text-center text-neutral-900">{line.quantity}</span>
                      <button
                        onClick={() => onUpdateLine(i, { quantity: line.quantity + 1 })}
                        className="w-6 h-6 rounded border border-neutral-300 text-neutral-600 text-sm flex items-center justify-center hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">Qté : {line.quantity}</span>
                  )}
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatPrice(line.totalPriceHT)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pied */}
      {lines.length > 0 && (
        <div className="border-t border-neutral-100 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-neutral-600">Total HT estimé</span>
            <span className="text-lg font-bold text-neutral-900">{formatPrice(totalHT)}</span>
          </div>

          {!readonly ? (
            <button
              onClick={handleProceed}
              disabled={lines.length === 0}
              className="w-full bg-neutral-950 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Valider mon devis
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-center">
              <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg inline-block">
                Devis soumis — en lecture seule
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
