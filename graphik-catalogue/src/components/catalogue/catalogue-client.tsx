"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShoppingCart, Package } from "lucide-react"
import type { Product, Brief, BriefLine, Store } from "@prisma/client"
import { CATEGORY_LABELS, formatPrice } from "@/lib/utils"
import { useCart, type CartLine } from "@/hooks/use-cart"
import { useAutosave } from "@/hooks/use-autosave"
import { ProductCard } from "./product-card"
import { CustomRequestCard } from "./custom-request-card"
import { CartSidebar } from "./cart-sidebar"
import { StoreSelector } from "./store-selector"
import { ReadonlyBanner } from "./readonly-banner"

type ProductWithJson = Product & { options: string[] | null }

type BriefWithLines = Brief & {
  lines: (BriefLine & { product: Product | null })[]
  logistics: any
}

interface CatalogueClientProps {
  user: any
  stores: Store[]
  activeStore: Store | null
  products: ProductWithJson[]
  initialBrief: BriefWithLines | null
}

// Regrouper les produits par catégorie
function groupByCategory(products: ProductWithJson[]) {
  const groups: Record<string, ProductWithJson[]> = {}
  for (const p of products) {
    if (!groups[p.category]) groups[p.category] = []
    groups[p.category].push(p)
  }
  return groups
}

export function CatalogueClient({
  user,
  stores,
  activeStore,
  products,
  initialBrief,
}: CatalogueClientProps) {
  const router = useRouter()
  const isReadonly =
    initialBrief?.status === "SUBMITTED" || initialBrief?.status === "VALIDATED"

  // Initialiser le panier depuis le brief existant
  const initialLines: CartLine[] =
    initialBrief?.lines.map((line) => ({
      id: line.id,
      productId: line.productId,
      productName:
        line.customName ??
        line.product?.name ??
        "Prestation hors catalogue",
      category: line.product?.category,
      quantity: line.quantity,
      width: line.width,
      height: line.height,
      selectedOption: line.selectedOption,
      unitPriceHT: line.unitPriceHT,
      totalPriceHT: line.totalPriceHT,
      pricingType: (line.product?.pricingType ?? "UNIT") as "UNIT" | "SQM",
      isOutOfCatalogue: line.isOutOfCatalogue,
      attachmentUrl: line.attachmentUrl,
    })) ?? []

  const { lines, totalHT, addLine, updateLine, removeLine, setLines } = useCart(initialLines)
  const [briefId, setBriefId] = useState<string | null>(initialBrief?.id ?? null)
  const [isSaving, setIsSaving] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = groupByCategory(products)
  const categoryKeys = Object.keys(categories)
  if (!categoryKeys.includes("SUR_MESURE")) categoryKeys.push("SUR_MESURE")

  // Initialiser la catégorie active
  useEffect(() => {
    if (categoryKeys.length > 0 && !activeCategory) {
      setActiveCategory(categoryKeys[0])
    }
  }, [categoryKeys, activeCategory])

  // Créer le brief si nécessaire et sauvegarder les lignes
  const saveLines = useCallback(
    async (currentLines: CartLine[]) => {
      if (!activeStore || isReadonly) return

      setIsSaving(true)
      try {
        let currentBriefId = briefId

        // Créer un brief si pas encore existant
        if (!currentBriefId) {
          const res = await fetch("/api/briefs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storeId: activeStore.id }),
          })
          if (!res.ok) throw new Error("Impossible de créer le brief")
          const brief = await res.json()
          currentBriefId = brief.id
          setBriefId(brief.id)
        }

        // Sauvegarder toutes les lignes (PUT remplace tout)
        await fetch(`/api/briefs/${currentBriefId}/lines`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            currentLines.map((l) => ({
              productId: l.productId,
              customName: l.customName,
              quantity: l.quantity,
              width: l.width,
              height: l.height,
              selectedOption: l.selectedOption,
              unitPriceHT: l.unitPriceHT,
              pricingType: l.pricingType,
              isOutOfCatalogue: l.isOutOfCatalogue ?? false,
              attachmentUrl: l.attachmentUrl,
            }))
          ),
        })
      } catch (err) {
        console.error("Autosave error:", err)
        toast.error("Sauvegarde automatique échouée")
      } finally {
        setIsSaving(false)
      }
    },
    [activeStore, briefId, isReadonly]
  )

  // Autosave déclenché à chaque changement du panier
  useAutosave(lines, saveLines)

  const handleAddToCart = (line: Omit<CartLine, "totalPriceHT">) => {
    if (isReadonly) return
    addLine(line)
    toast.success(`${line.productName} ajouté au devis`, { duration: 2000 })
  }

  // Si pas de store sélectionné, afficher le sélecteur
  if (!activeStore) {
    return (
      <StoreSelector
        stores={stores}
        onSelect={(storeId) => router.push(`/catalogue?storeId=${storeId}`)}
      />
    )
  }

  return (
    <div className="relative">
      {/* Bannière lecture seule */}
      {isReadonly && (
        <ReadonlyBanner
          status={initialBrief!.status}
          storeName={activeStore.name}
          briefId={initialBrief!.id}
        />
      )}

      <div className="flex gap-8">
        {/* Contenu principal */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* En-tête */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">
              Catalogue — {activeStore.name}
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Sélectionnez vos prestations pour composer votre devis
            </p>
          </div>

          {/* Navigation catégories */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {categoryKeys.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-neutral-950 text-white"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {cat === "SUR_MESURE" ? "Sur Mesure" : (CATEGORY_LABELS[cat] ?? cat)}
                <span className="ml-1.5 text-xs opacity-60">
                  ({cat === "SUR_MESURE" ? 1 : categories[cat]?.length ?? 0})
                </span>
              </button>
            ))}
          </div>

          {/* Grille de produits */}
          {activeCategory && (categories[activeCategory] || activeCategory === "SUR_MESURE") && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                {activeCategory === "SUR_MESURE" ? "Sur Mesure" : (CATEGORY_LABELS[activeCategory] ?? activeCategory)}
              </h2>
              
              {activeCategory === "SUR_MESURE" ? (
                <div className="w-full">
                  <CustomRequestCard readonly={isReadonly} onAdd={handleAddToCart} />
                </div>
              ) : categories[activeCategory].length === 0 ? (

                <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                  <Package className="w-10 h-10 mb-3 opacity-40" />
                  <p>Aucun produit dans cette catégorie</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                  {categories[activeCategory].map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      readonly={isReadonly}
                      onAdd={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar panier (desktop) */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24">
            <CartSidebar
              lines={lines}
              totalHT={totalHT}
              briefId={briefId}
              storeId={activeStore.id}
              readonly={isReadonly}
              isSaving={isSaving}
              onUpdateLine={updateLine}
              onRemoveLine={removeLine}
            />
          </div>
        </div>
      </div>

      {/* Bouton panier mobile */}
      {!isReadonly && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden z-30 bg-neutral-950 text-white rounded-2xl px-5 py-3 flex items-center gap-2 shadow-xl"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">{lines.length} article{lines.length > 1 ? "s" : ""}</span>
          <span className="font-bold">{formatPrice(totalHT)}</span>
        </button>
      )}

      {/* Drawer panier mobile */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto">
            <CartSidebar
              lines={lines}
              totalHT={totalHT}
              briefId={briefId}
              storeId={activeStore.id}
              readonly={isReadonly}
              isSaving={isSaving}
              onUpdateLine={updateLine}
              onRemoveLine={removeLine}
              onClose={() => setCartOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
