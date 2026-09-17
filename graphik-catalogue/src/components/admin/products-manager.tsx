"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, X, Package, Eye, EyeOff } from "lucide-react"
import { productSchema, type ProductFormValues } from "@/lib/validations"
import { CATEGORY_LABELS, formatPrice } from "@/lib/utils"
import type { Product } from "@prisma/client"
import { ProductImageUpload } from "./product-image-upload"

type ProductWithOptions = Product & { options: any }

interface ProductsManagerProps {
  initialProducts: ProductWithOptions[]
}

const CATEGORIES = [
  "VISUEL_EXTERIEUR",
  "BACHE_LAMELLES_PVC",
  "SIGNALETIQUES_SUSPENDUES",
  "PANNEAUX_IMPRIMES",
  "CLAUSTRAS_VERRIERES",
  "REBOARD",
] as const

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithOptions | null>(null)
  const [optionInput, setOptionInput] = useState("")
  const [options, setOptions] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { pricingType: "UNIT", sortOrder: 0 },
  })

  const pricingType = watch("pricingType")

  const openCreate = () => {
    setEditingProduct(null)
    setOptions([])
    setImageUrl(null)
    reset({ pricingType: "UNIT", sortOrder: 0 })
    setShowForm(true)
  }

  const openEdit = (product: ProductWithOptions) => {
    setEditingProduct(product)
    const opts = Array.isArray(product.options) ? product.options : []
    setOptions(opts)
    setImageUrl(product.imageUrl ?? null)
    reset({
      category: product.category as any,
      name: product.name,
      description: product.description ?? "",
      defaultWidth: product.defaultWidth ?? undefined,
      defaultHeight: product.defaultHeight ?? undefined,
      pricingType: product.pricingType as any,
      unitPriceHT: product.unitPriceHT,
      sortOrder: product.sortOrder,
    })
    setShowForm(true)
  }

  const addOption = () => {
    if (optionInput.trim() && !options.includes(optionInput.trim())) {
      setOptions((prev) => [...prev, optionInput.trim()])
      setOptionInput("")
    }
  }

  const removeOption = (opt: any) => setOptions((prev) => prev.filter((o) => o !== opt))

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = { ...data, options, imageUrl: imageUrl ?? undefined }
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products"
      const method = editingProduct ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()
      const saved = await res.json()

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)))
        toast.success("Produit mis à jour")
      } else {
        setProducts((prev) => [saved, ...prev])
        toast.success("Produit créé")
      }

      setShowForm(false)
      reset()
    } catch {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActive = async (product: ProductWithOptions) => {
    const method = product.isActive ? "DELETE" : "PATCH"
    const res = await fetch(`/api/products/${product.id}`, {
      method: product.isActive ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: product.isActive ? undefined : JSON.stringify({ isActive: true }),
    })
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      )
      toast.success(product.isActive ? "Produit désactivé" : "Produit réactivé")
    }
  }

  const grouped = products.reduce((acc: Record<string, typeof products>, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Catalogue Produits</h1>
          <p className="text-neutral-500 text-sm mt-1">{products.filter((p) => p.isActive).length} produits actifs</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-950 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau produit
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900">
                {editingProduct ? "Modifier le produit" : "Nouveau produit"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Catégorie */}
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select {...register("category")} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200">
                  <option value="">Sélectionner…</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>

              {/* Nom */}
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input {...register("name")} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">Description</label>
                <textarea {...register("description")} rows={2} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 resize-none" />
              </div>

              {/* Type de tarification */}
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">
                  Type de tarification <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["UNIT", "SQM"] as const).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 border-2 rounded-xl p-3 cursor-pointer transition-colors ${
                        pricingType === type ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200"
                      }`}
                    >
                      <input type="radio" {...register("pricingType")} value={type} className="sr-only" />
                      <span className="text-sm font-medium">{type === "UNIT" ? "À l'unité" : "Au m²"}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prix unitaire */}
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">
                  Prix unitaire HT (€) <span className="text-red-500">*</span>
                </label>
                <input type="number" step="0.01" {...register("unitPriceHT")} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200" />
                {errors.unitPriceHT && <p className="text-red-500 text-xs mt-1">{errors.unitPriceHT.message}</p>}
              </div>

              {/* Dimensions par défaut */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Largeur défaut (m)</label>
                  <input type="number" step="0.01" {...register("defaultWidth")} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Hauteur défaut (m)</label>
                  <input type="number" step="0.01" {...register("defaultHeight")} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200" />
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">Options disponibles</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption() } }}
                    placeholder="ex: Recto-verso, Pelliculage mat…"
                    className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300"
                  />
                  <button type="button" onClick={addOption} className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {options.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt, i) => {
    const label = typeof opt === 'string' ? opt : (opt.label + (opt.price ? " (" + opt.price + "€)" : ""));
    return (
                      <span key={i} className="flex items-center gap-1.5 bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1.5 rounded-full">
                        {label}
                        <button type="button" onClick={() => removeOption(opt)}>
                          <X className="w-3 h-3 text-neutral-400 hover:text-red-500" />
                        </button>
                      </span>
                    )})}
                  </div>
                )}
              </div>

              {/* Ordre */}
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">Ordre d&apos;affichage</label>
                <input type="number" {...register("sortOrder")} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200" />
              </div>

              {/* Image */}
              {editingProduct ? (
                <ProductImageUpload
                  productId={editingProduct.id}
                  currentImageUrl={imageUrl}
                  onUploadComplete={(url) => setImageUrl(url)}
                />
              ) : (
                <p className="text-xs text-neutral-400 bg-neutral-50 rounded-lg px-3 py-2">
                  💡 L&apos;image peut être ajoutée après la création du produit
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neutral-950 text-white font-semibold py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 text-sm"
              >
                {isSubmitting ? "Sauvegarde…" : editingProduct ? "Mettre à jour" : "Créer le produit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Liste par catégorie */}
      <div className="space-y-6">
        {CATEGORIES.filter((cat) => grouped[cat]?.length > 0).map((cat) => (
          <div key={cat} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200">
              <h2 className="font-semibold text-neutral-900 text-sm">
                {CATEGORY_LABELS[cat]}
                <span className="ml-2 text-neutral-400 font-normal text-xs">
                  ({grouped[cat].length})
                </span>
              </h2>
            </div>
            <div className="divide-y divide-neutral-50">
              {grouped[cat].map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between px-5 py-3.5 ${
                    !product.isActive ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-neutral-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-neutral-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{product.name}</p>
                      <p className="text-xs text-neutral-400">
                        {formatPrice(product.unitPriceHT)} / {product.pricingType === "SQM" ? "m²" : "unité"}
                        {product.defaultWidth && product.defaultHeight && (
                          <> · {product.defaultWidth}m × {product.defaultHeight}m</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleActive(product)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title={product.isActive ? "Désactiver" : "Réactiver"}
                    >
                      {product.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
