"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft, Download, RefreshCw, CheckCircle, Plus, Trash2, Save, ExternalLink, FileDown
} from "lucide-react"
import Link from "next/link"
import { formatPrice, STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS } from "@/lib/utils"

interface BriefEditorProps {
  brief: any
  products: any[]
  currentUserRole: string
}

export function BriefEditor({ brief, products, currentUserRole }: BriefEditorProps) {
  const router = useRouter()
  const [lines, setLines] = useState<any[]>(brief.lines)
  const [totalHT, setTotalHT] = useState(brief.totalHT)
  const [isSaving, setIsSaving] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [notes, setNotes] = useState(brief.notes ?? "")

  const clientName =
    [brief.user.firstName, brief.user.lastName].filter(Boolean).join(" ") || brief.user.email

  const recalcTotal = (currentLines: any[]) => {
    const t = currentLines.reduce((sum: number, l: any) => sum + (l.totalPriceHT || 0), 0)
    setTotalHT(t)
    return t
  }

  const updateLine = (index: number, field: string, value: any) => {
    setLines((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }

      // Recalcul
      const line = updated[index]
      const pricingType = line.product?.pricingType ?? "UNIT"
      if (pricingType === "SQM" && line.width && line.height) {
        updated[index].totalPriceHT = line.width * line.height * line.unitPriceHT * line.quantity
      } else {
        updated[index].totalPriceHT = line.unitPriceHT * line.quantity
      }

      recalcTotal(updated)
      return updated
    })
  }

  const removeLine = (index: number) => {
    setLines((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      recalcTotal(updated)
      return updated
    })
  }

  const addOutOfCatalogueLine = () => {
    const newLine = {
      id: null,
      productId: null,
      customName: "Nouvelle prestation",
      quantity: 1,
      width: null,
      height: null,
      selectedOption: null,
      unitPriceHT: 0,
      totalPriceHT: 0,
      isOutOfCatalogue: true,
      product: null,
    }
    setLines((prev) => [...prev, newLine])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Sauvegarder les lignes
      const res = await fetch(`/api/briefs/${brief.id}/lines`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          lines.map((l) => ({
            productId: l.productId ?? null,
            customName: l.customName ?? null,
            quantity: l.quantity,
            width: l.width ?? null,
            height: l.height ?? null,
            selectedOption: l.selectedOption ?? null,
            unitPriceHT: l.unitPriceHT,
            pricingType: l.product?.pricingType ?? "UNIT",
            isOutOfCatalogue: l.isOutOfCatalogue ?? false,
          }))
        ),
      })

      // Sauvegarder les notes
      await fetch(`/api/briefs/${brief.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })

      if (!res.ok) throw new Error("Erreur sauvegarde")
      toast.success("Brief sauvegardé")
      router.refresh()
    } catch {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReview = async () => {
    if (!confirm("Renvoyer ce brief au client pour correction ?")) return
    setIsReviewing(true)
    try {
      const res = await fetch(`/api/briefs/${brief.id}/review`, { method: "POST" })
      if (!res.ok) throw new Error()
      toast.success("Brief renvoyé au client pour corrections")
      router.refresh()
    } catch {
      toast.error("Erreur lors de l'envoi")
    } finally {
      setIsReviewing(false)
    }
  }

  const handleValidate = async () => {
    if (!confirm("Valider définitivement ce brief ?")) return
    setIsValidating(true)
    try {
      const res = await fetch(`/api/briefs/${brief.id}/validate`, { method: "POST" })
      if (!res.ok) throw new Error()
      toast.success("Brief validé ! Email envoyé au client.")
      router.refresh()
    } catch {
      toast.error("Erreur lors de la validation")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="max-w-5xl">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/admin/briefs"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux briefs
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">{brief.store.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-neutral-500 text-sm">{clientName} — {brief.user.email}</p>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[brief.status]}`}>
              {STATUS_LABELS[brief.status]}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={`/api/briefs/${brief.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-100 border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
            title="Télécharger le devis en PDF"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </a>
          
          <a
            href={`/api/briefs/${brief.id}/word`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-100 border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
            title="Télécharger le devis en Word (DOCX)"
          >
            <FileDown className="w-4 h-4" />
            Word
          </a>

          {(brief.status === "SUBMITTED" || brief.status === "REVIEWING") && (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Sauvegarde…" : "Sauvegarder"}
              </button>

              <button
                onClick={handleReview}
                disabled={isReviewing}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                {isReviewing ? "Envoi…" : "Renvoyer pour correction"}
              </button>

              <button
                onClick={handleValidate}
                disabled={isValidating}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {isValidating ? "Validation…" : "Valider"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Colonne principale : lignes */}
        <div className="col-span-2 space-y-4">
          {/* Lignes du devis */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 text-sm">
                Lignes du devis ({lines.length})
              </h2>
              {(brief.status === "SUBMITTED" || brief.status === "REVIEWING") && (
                <button
                  onClick={addOutOfCatalogueLine}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 border border-dashed border-neutral-300 px-3 py-1.5 rounded-lg hover:border-neutral-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Hors catalogue
                </button>
              )}
            </div>

            <div className="divide-y divide-neutral-50">
              {lines.map((line, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Nom */}
                      {line.isOutOfCatalogue ? (
                        <input
                          value={line.customName ?? ""}
                          onChange={(e) => updateLine(i, "customName", e.target.value)}
                          placeholder="Nom de la prestation"
                          className="font-medium text-sm text-neutral-900 border-b border-transparent hover:border-neutral-300 focus:border-neutral-500 outline-none w-full pb-0.5 transition-colors"
                        />
                      ) : (
                        <p className="font-medium text-sm text-neutral-900">
                          {line.product?.name ?? line.customName ?? "—"}
                        </p>
                      )}

                      {line.product?.category && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {CATEGORY_LABELS[line.product.category]}
                        </p>
                      )}
                    </div>

                    {(brief.status === "SUBMITTED" || brief.status === "REVIEWING") && (
                      <button
                        onClick={() => removeLine(i)}
                        className="text-neutral-300 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Qté</label>
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 1)}
                        min={1}
                        disabled={brief.status === "VALIDATED"}
                        className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 disabled:bg-neutral-50"
                      />
                    </div>
                    {line.product?.pricingType === "SQM" && (
                      <>
                        <div>
                          <label className="text-xs text-neutral-400 block mb-1">L (m)</label>
                          <input
                            type="number"
                            value={line.width ?? ""}
                            onChange={(e) => updateLine(i, "width", parseFloat(e.target.value))}
                            step={0.1}
                            disabled={brief.status === "VALIDATED"}
                            className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 disabled:bg-neutral-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-neutral-400 block mb-1">H (m)</label>
                          <input
                            type="number"
                            value={line.height ?? ""}
                            onChange={(e) => updateLine(i, "height", parseFloat(e.target.value))}
                            step={0.1}
                            disabled={brief.status === "VALIDATED"}
                            className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 disabled:bg-neutral-50"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">P.U. HT (€)</label>
                      <input
                        type="number"
                        value={line.unitPriceHT}
                        onChange={(e) => updateLine(i, "unitPriceHT", parseFloat(e.target.value) || 0)}
                        step={0.01}
                        disabled={brief.status === "VALIDATED"}
                        className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 disabled:bg-neutral-50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <span className="text-sm font-semibold text-neutral-900">
                      = {formatPrice(line.totalPriceHT ?? 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="px-5 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center">
              <span className="font-semibold text-neutral-700">Total HT</span>
              <span className="text-xl font-bold text-neutral-900">{formatPrice(totalHT)}</span>
            </div>
          </div>

          {/* Notes internes */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold text-neutral-900 text-sm mb-3">Notes internes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes visibles uniquement par l'équipe Graphik…"
              rows={3}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 resize-none"
            />
          </div>
        </div>

        {/* Colonne latérale : logistique + plan */}
        <div className="space-y-4">
          {/* Logistique */}
          {brief.logistics && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h3 className="font-semibold text-neutral-900 text-sm mb-4">Logistique</h3>
              <dl className="space-y-3">
                {[
                  { label: "Contact", value: brief.logistics.contactName },
                  { label: "Email", value: brief.logistics.contactEmail },
                  { label: "Téléphone", value: brief.logistics.contactPhone },
                  {
                    label: "Quai déchargement",
                    value: brief.logistics.unloadingDock ? "✓ Oui" : "✗ Non",
                  },
                  {
                    label: "Matériel manutention",
                    value: brief.logistics.handlingEquipment ? "✓ Oui" : "✗ Non",
                  },
                  {
                    label: "Semaine livraison",
                    value: brief.logistics.requestedDeliveryWeek,
                  },
                  {
                    label: "Pose Graphik",
                    value: brief.logistics.installationByGraphik ? "✓ Oui" : "Non",
                  },
                  {
                    label: "Date de pose",
                    value: brief.logistics.requestedInstallationDate
                      ? new Date(brief.logistics.requestedInstallationDate).toLocaleDateString("fr-FR")
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs text-neutral-400">{label}</dt>
                    <dd className="text-sm font-medium text-neutral-900 mt-0.5">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Plan uploadé */}
          {brief.logistics?.uploadedPlanUrl && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h3 className="font-semibold text-neutral-900 text-sm mb-3">Plan uploadé</h3>
              <p className="text-xs text-neutral-500 mb-3 truncate">
                {brief.logistics.uploadedPlanName ?? "Plan de masse"}
              </p>
              <a
                href={brief.logistics.uploadedPlanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full bg-neutral-950 text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-neutral-800 transition-colors justify-center"
              >
                <Download className="w-4 h-4" />
                Télécharger le plan
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
