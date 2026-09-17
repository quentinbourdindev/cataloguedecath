"use client"

import { AlertTriangle, Lock, RefreshCw } from "lucide-react"
import { STATUS_LABELS } from "@/lib/utils"

interface ReadonlyBannerProps {
  briefId: string
  status: string
  storeName: string
}

import { FileDown } from "lucide-react"

export function ReadonlyBanner({ status, storeName, briefId }: ReadonlyBannerProps) {
  const isReviewing = status === "REVIEWING"

  return (
    <div
      className={`rounded-xl p-4 mb-6 flex items-start gap-3 ${
        isReviewing
          ? "bg-amber-50 border border-amber-200"
          : "bg-blue-50 border border-blue-200"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isReviewing ? (
          <RefreshCw className="w-5 h-5 text-amber-600" />
        ) : (
          <Lock className="w-5 h-5 text-blue-600" />
        )}
      </div>
      <div>
        <p
          className={`font-semibold text-sm ${
            isReviewing ? "text-amber-800" : "text-blue-800"
          }`}
        >
          {isReviewing
            ? "Votre devis est en cours de révision"
            : `Devis soumis — ${STATUS_LABELS[status]}`}
        </p>
        <p
          className={`text-xs mt-1 ${
            isReviewing ? "text-amber-600" : "text-blue-600"
          }`}
        >
          {isReviewing
            ? "L'équipe Graphik vous a renvoyé votre devis pour y apporter des corrections. Il est maintenant modifiable à nouveau."
            : `Votre devis pour ${storeName} a été soumis à l'équipe Graphik et est en lecture seule. Vous recevrez un email dès qu'il sera traité.`}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <a
          href={`/api/briefs/${briefId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5" />
          PDF
        </a>
        <a
          href={`/api/briefs/${briefId}/word`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5" />
          Word
        </a>
      </div>
    </div>
  )
}

