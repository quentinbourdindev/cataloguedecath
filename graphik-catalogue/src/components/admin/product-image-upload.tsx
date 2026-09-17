"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProductImageUploadProps {
  productId: string
  currentImageUrl?: string | null
  onUploadComplete: (url: string) => void
}

export function ProductImageUpload({
  productId,
  currentImageUrl,
  onUploadComplete,
}: ProductImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Seules les images sont acceptées")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image trop lourde (max 10 Mo)")
        return
      }

      const localUrl = URL.createObjectURL(file)
      setPreview(localUrl)
      setIsUploading(true)
      setUploadProgress(0)

      try {
        const presignRes = await fetch("/api/upload/product-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
          }),
        })

        if (!presignRes.ok) {
          const err = await presignRes.json()
          throw new Error(err.error || "Impossible d'initier l'upload")
        }

        const { uploadUrl, fileUrl } = await presignRes.json()

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100))
            }
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve()
            else reject(new Error(`Upload échoué (${xhr.status})`))
          }
          xhr.onerror = () => reject(new Error("Erreur réseau"))
          xhr.open("PUT", uploadUrl)
          xhr.setRequestHeader("Content-Type", file.type)
          xhr.send(file)
        })

        setPreview(fileUrl)
        onUploadComplete(fileUrl)
        toast.success("Image uploadée avec succès !")
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de l'upload")
        setPreview(currentImageUrl ?? null)
      } finally {
        setIsUploading(false)
        URL.revokeObjectURL(localUrl)
      }
    },
    [productId, currentImageUrl, onUploadComplete]
  )

  return (
    <div>
      <label className="text-sm font-medium text-neutral-700 block mb-1.5">
        Image du produit
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Aperçu produit"
            className="w-full h-40 object-cover rounded-xl border border-neutral-200"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <div className="w-2/3 bg-white/30 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-white text-xs">{uploadProgress}%</span>
            </div>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-black/80 transition-colors"
            >
              <Upload className="w-3 h-3" />
              Changer
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-neutral-500 transition-colors cursor-pointer"
        >
          <ImageIcon className="w-7 h-7 text-neutral-300" />
          <p className="text-sm text-neutral-400">Cliquez pour uploader une image</p>
          <p className="text-xs text-neutral-300">JPG, PNG, WebP — max. 10 Mo</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
        className="hidden"
      />
    </div>
  )
}
