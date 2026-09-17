"use client"

import { formatPrice, CATEGORY_LABELS } from "@/lib/utils"
import { ShoppingCart } from "lucide-react"

interface StepRecapProps {
  lines: any[]
  totalHT: number
  storeName: string
  readonly?: boolean
}

export function StepRecap({ lines, totalHT, storeName, readonly }: StepRecapProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">Récapitulatif</h2>
      <p className="text-neutral-500 text-sm mb-6">
        Vérifiez les prestations sélectionnées pour {storeName}.
        {!readonly && " Retournez au catalogue pour modifier les quantités."}
      </p>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
          <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium">Votre devis est vide</p>
          <p className="text-sm mt-1">Retournez au catalogue pour ajouter des prestations</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            {lines.map((line: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 text-sm">
                    {line.customName ?? line.product?.name ?? "Prestation hors catalogue"}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {line.product?.category && (
                      <span className="text-xs text-neutral-400">
                        {CATEGORY_LABELS[line.product.category] ?? line.product.category}
                      </span>
                    )}
                    {line.width && line.height && (
                      <span className="text-xs text-neutral-400">
                        {line.width}m × {line.height}m
                      </span>
                    )}
                    {line.selectedOption && (
                      <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                        {line.selectedOption}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatPrice(line.totalPriceHT)}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {line.quantity} × {formatPrice(line.unitPriceHT)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-neutral-50 rounded-xl px-5 py-4 flex items-center justify-between">
            <span className="font-semibold text-neutral-700">Total HT estimé</span>
            <span className="text-2xl font-bold text-neutral-900">{formatPrice(totalHT)}</span>
          </div>

          <p className="text-xs text-neutral-400 mt-3 text-center">
            * Ce total est une estimation. Le devis définitif sera établi par l&apos;équipe Graphik.
          </p>
        </>
      )}
    </div>
  )
}
