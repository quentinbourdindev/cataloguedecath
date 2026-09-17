"use client"

import { useState, useRef } from "react"
import { PencilRuler, Plus, Paperclip, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CustomRequestCardProps {
  onAdd: (line: any) => void
  readonly?: boolean
}

export function CustomRequestCard({ onAdd, readonly }: CustomRequestCardProps) {
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (selected.size > 10 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 10 Mo")
        return
      }
      setFile(selected)
    }
  }

  const handleAdd = async () => {
    if (!description.trim()) return

    setIsUploading(true)
    let attachmentUrl = null

    try {
      if (file) {
        // Obtenir l'URL présignée
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
          }),
        })

        if (!presignRes.ok) throw new Error("Erreur d'upload")
        const { uploadUrl, fileUrl } = await presignRes.json()

        // Upload direct S3
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        })

        if (!uploadRes.ok) throw new Error("Erreur lors de l'upload")
        attachmentUrl = fileUrl
      }

      onAdd({
        productId: null,
        customName: `Sur mesure : ${description.trim()}`,
        productName: `Sur mesure : ${description.trim()}`,
        category: "SUR_MESURE",
        quantity,
        unitPriceHT: 0,
        pricingType: "UNIT",
        isOutOfCatalogue: true,
        attachmentUrl,
      })
      
      setDescription("")
      setQuantity(1)
      setFile(null)
    } catch (err) {
      toast.error("Erreur lors de l'ajout")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-white border-2 border-dashed border-neutral-300 rounded-2xl overflow-hidden hover:border-neutral-400 hover:shadow-lg hover:shadow-neutral-200/40 transition-all p-6 min-h-[calc(100vh-360px)] flex-1">
      
      {/* Icon & Title */}
      <div className="sm:w-1/3 shrink-0">
        <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-4">
          <PencilRuler className="w-6 h-6 text-neutral-500" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">Demande Hors Catalogue</h3>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Décrivez votre besoin spécifique (bâche sur-mesure, sticker spécial, signalétique atypique). Vous pouvez joindre une photo d'inspiration. Nous chiffrerons cette ligne manuellement lors de la validation.
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <label className="text-[11px] font-bold text-neutral-500 mb-1.5 block uppercase tracking-wider">Description de votre besoin *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={readonly || isUploading}
            placeholder="Ex: Bâche 4x3m avec œillets tous les 30cm, format spécial..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-none flex-1 min-h-[120px]"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            disabled={readonly || isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={readonly || isUploading}
            className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 transition-colors bg-white font-medium shadow-sm"
          >
            <Paperclip className="w-4 h-4" />
            {file ? "Changer la pièce jointe" : "Ajouter une photo / PDF"}
          </button>
          
          {file && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-100 px-3 py-2 rounded-lg">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-end gap-3 mt-auto pt-4">
          <div className="w-28">
            <label className="text-[11px] font-bold text-neutral-500 mb-1.5 block uppercase tracking-wider">Quantité</label>
            <div className="flex items-center">
              <button
                type="button"
                disabled={readonly || isUploading}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-10 border border-neutral-200 bg-neutral-50 text-neutral-600 rounded-l-lg hover:bg-neutral-100 disabled:opacity-50 flex items-center justify-center font-medium"
              >
                −
              </button>
              <div className="h-10 flex-1 border-y border-neutral-200 flex items-center justify-center text-sm font-semibold bg-white">
                {quantity}
              </div>
              <button
                type="button"
                disabled={readonly || isUploading}
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-10 border border-neutral-200 bg-neutral-50 text-neutral-600 rounded-r-lg hover:bg-neutral-100 disabled:opacity-50 flex items-center justify-center font-medium"
              >
                +
              </button>
            </div>
          </div>
          
          <button
            onClick={handleAdd}
            disabled={readonly || !description.trim() || isUploading}
            className="flex-1 bg-neutral-950 text-white font-semibold h-10 rounded-lg flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isUploading ? "Ajout en cours..." : "Ajouter au devis"}
          </button>
        </div>
      </div>
    </div>
  )
}
