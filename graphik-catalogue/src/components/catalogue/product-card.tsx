"use client"

import { useState } from "react"
import { Plus, ChevronDown, ChevronUp, Ruler } from "lucide-react"
import type { Product } from "@prisma/client"
import { formatPrice } from "@/lib/utils"
import type { CartLine } from "@/hooks/use-cart"

type ProductWithOptions = Product & { options: string[] | null }

interface ProductCardProps {
  product: ProductWithOptions
  readonly?: boolean
  onAdd: (line: Omit<CartLine, "totalPriceHT">) => void
}

export function ProductCard({ product, readonly, onAdd }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [width, setWidth] = useState<number>(product.defaultWidth ?? 1)
  const rawOptions = Array.isArray(product.options) ? product.options : []
  // Support both simple strings and { label, price } objects
  const options = rawOptions.map(opt => {
    if (typeof opt === 'string') return { label: opt, price: null }
    if (typeof opt === 'object' && opt !== null) return opt as { label: string, price?: number }
    return { label: String(opt), price: null }
  })

  const [height, setHeight] = useState<number>(product.defaultHeight ?? 1)
  const [selectedOption, setSelectedOption] = useState<string>(
    options[0]?.label ?? ""
  )

  const isSqm = product.pricingType === "SQM"
  const needsConfig = options.length > 0 || isSqm

  // Derive the active base price from the selected option or default to the product's unitPriceHT
  const selectedOptionObj = options.find(o => o.label === selectedOption)
  const basePrice = selectedOptionObj?.price ?? product.unitPriceHT

  const computedPrice = isSqm
    ? width * height * basePrice * quantity
    : basePrice * quantity

  const handleAdd = () => {
    onAdd({
      productId: product.id,
      productName: product.name,
      category: product.category,
      quantity,
      width: isSqm ? width : null,
      height: isSqm ? height : null,
      selectedOption: selectedOption || null,
      unitPriceHT: basePrice,
      pricingType: product.pricingType as "UNIT" | "SQM",
    })
    // Reset
    setQuantity(1)
    setExpanded(false)
  }

  return (
    <div className="group flex flex-col bg-white border border-neutral-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-neutral-200/40 hover:border-neutral-300 transition-all duration-300">
      {/* Zone Image */}
      <div className="aspect-[4/3] w-full bg-neutral-50/50 relative overflow-hidden flex items-center justify-center border-b border-neutral-100 p-6">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-sm"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-300">
            <svg className="w-10 h-10 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Aucune photo</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        {/* Nom & Description */}
        <div className="mb-4 flex-1">
          <h3 className="text-base font-bold text-neutral-900 leading-tight mb-1.5 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed mb-3">
              {product.description}
            </p>
          )}

          {/* Dimensions par défaut en pill */}
          {(product.defaultWidth || product.defaultHeight) && (
            <div className="inline-flex items-center gap-1.5 bg-neutral-100/80 px-2.5 py-1 rounded-md w-fit">
              <Ruler className="w-3 h-3 text-neutral-500" />
              <span className="text-[11px] font-semibold text-neutral-600 tracking-wider">
                {product.defaultWidth} mm × {product.defaultHeight} mm
              </span>
            </div>
          )}
        </div>

        {/* Prix */}
        <div className="flex items-end gap-2 mb-5">
          <p className="text-2xl font-black tracking-tight text-neutral-900">
            {formatPrice(basePrice)}
          </p>
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            {isSqm ? "le m²" : "l'unité"}
          </p>
        </div>

        {!readonly && (
          <div className="mt-auto border-t border-neutral-100 pt-4">
            {needsConfig ? (
              <>
                {/* Toggle configuration */}
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-neutral-700 hover:text-neutral-900 mb-2 py-1 transition-colors"
                >
                  <span>Configurer & ajouter</span>
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expanded && (
                  <div className="space-y-4 pt-2">
                    {/* Dimensions (SQM seulement) */}
                    {isSqm && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 mb-1.5 block uppercase tracking-wider">Largeur (m)</label>
                          <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                            min={0.1}
                            step={0.1}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-semibold transition-shadow"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-500 mb-1.5 block uppercase tracking-wider">Hauteur (m)</label>
                          <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                            min={0.1}
                            step={0.1}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-semibold transition-shadow"
                          />
                        </div>
                      </div>
                    )}

                    {/* Options */}
                    {options.length > 0 && (
                      <div>
                        <label className="text-[11px] font-bold text-neutral-500 mb-1.5 block uppercase tracking-wider">Option</label>
                        <select
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 font-semibold transition-shadow"
                        >
                          {options.map((opt) => (
                            <option key={opt.label} value={opt.label}>
                              {opt.label}{opt.price ? ` — ${formatPrice(opt.price)}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quantité & Ajouter (Mode étendu) */}
                    <div>
                      <label className="text-[11px] font-bold text-neutral-500 mb-1.5 block uppercase tracking-wider">Quantité</label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-neutral-100 rounded-full p-1 w-28 justify-between">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-sm transition-all"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold text-neutral-900">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-sm transition-all"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={handleAdd}
                          className="flex-1 bg-neutral-950 text-white rounded-full py-2.5 text-sm font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-4 h-4" />
                          {formatPrice(computedPrice)}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!expanded && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-semibold py-2.5 rounded-full hover:bg-neutral-100 transition-colors mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter au devis
                  </button>
                )}
              </>
            ) : (
              /* Simple Product: No Config Needed */
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-neutral-100 rounded-full p-1 w-28 justify-between shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-sm transition-all"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-white hover:shadow-sm transition-all"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-neutral-950 text-white rounded-full py-2.5 text-sm font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
