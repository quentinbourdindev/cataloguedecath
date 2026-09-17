"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, FileText, CheckCircle, X, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface StepUploadProps {
  briefId: string
  initialData: { uploadedPlanUrl: string; uploadedPlanName?: string } | null
  readonly?: boolean
  onValidate: (data: { uploadedPlanUrl: string; uploadedPlanName: string }) => void
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_MB = 50

export function StepUpload({ briefId, initialData, readonly, onValidate }: StepUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialData?.uploadedPlanUrl ?? null)
  const [uploadedName, setUploadedName] = useState<string>(initialData?.uploadedPlanName ?? "")
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (selectedFile: File) => {
    setUploadError(null)

    // Validation type
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setUploadError("Format non accepté. Utilisez PDF, JPG, PNG ou WebP.")
      return
    }

    // Validation taille
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`Le fichier dépasse la limite de ${MAX_SIZE_MB} Mo.`)
      return
    }

    setFile(selectedFile)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 1. Obtenir l'URL présignée
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefId,
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      })

      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error || "Impossible d'initier l'upload")
      }

      const { uploadUrl, fileUrl } = await presignRes.json()

      // 2. Upload direct vers MinIO via XMLHttpRequest (pour la progression)
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
        xhr.onerror = () => reject(new Error("Erreur réseau pendant l'upload"))
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", selectedFile.type)
        xhr.send(selectedFile)
      })

      setUploadedUrl(fileUrl)
      setUploadedName(selectedFile.name)
      onValidate({ uploadedPlanUrl: fileUrl, uploadedPlanName: selectedFile.name })
      toast.success("Plan uploadé avec succès !")
    } catch (err: any) {
      setUploadError(err.message || "Erreur lors de l'upload")
      setFile(null)
    } finally {
      setIsUploading(false)
    }
  }, [briefId, onValidate])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleRemove = () => {
    setFile(null)
    setUploadedUrl(null)
    setUploadedName("")
    setUploadProgress(0)
    setUploadError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">Plan de masse / 3D</h2>
      <p className="text-neutral-500 text-sm mb-6">
        Uploadez le plan du magasin (PDF ou image). Ce document est{" "}
        <strong>obligatoire</strong> pour valider votre demande.
      </p>

      {uploadedUrl && !isUploading ? (
        /* Fichier uploadé */
        <div className="border-2 border-green-200 bg-green-50 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900 text-sm">
                  {uploadedName || "Plan uploadé"}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  Fichier enregistré avec succès
                </p>
              </div>
            </div>
            {!readonly && (
              <button
                onClick={handleRemove}
                className="text-green-400 hover:text-red-500 transition-colors"
                title="Supprimer et réuploader"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!readonly && (
            <p className="text-xs text-green-600 mt-4 text-center">
              Cliquez sur ✕ pour remplacer le fichier
            </p>
          )}
        </div>
      ) : (
        /* Zone de drop */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !readonly && !isUploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            isDragging
              ? "border-neutral-950 bg-neutral-50 scale-[1.01]"
              : "border-neutral-300 hover:border-neutral-400"
          } ${readonly || isUploading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-neutral-400 animate-spin" />
              <p className="font-medium text-neutral-700 text-sm">Upload en cours…</p>
              <div className="w-full max-w-xs bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-neutral-950 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-400">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
              <p className="font-semibold text-neutral-700 mb-1">
                Glissez votre plan ici
              </p>
              <p className="text-sm text-neutral-400 mb-4">ou cliquez pour sélectionner un fichier</p>
              <p className="text-xs text-neutral-300">PDF, JPG, PNG ou WebP — max. 50 Mo</p>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {uploadError}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
        className="hidden"
      />

      {!uploadedUrl && !readonly && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mt-4 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          L&apos;upload du plan est obligatoire pour soumettre votre devis
        </p>
      )}
    </div>
  )
}
