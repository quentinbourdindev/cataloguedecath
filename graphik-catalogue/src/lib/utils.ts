import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un prix en euros (fr-FR)
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Calcule le prix en fonction du type de tarification
 */
export function calculateLinePrice({
  pricingType,
  unitPriceHT,
  quantity,
  width,
  height,
}: {
  pricingType: "UNIT" | "SQM"
  unitPriceHT: number
  quantity: number
  width?: number | null
  height?: number | null
}): number {
  if (pricingType === "SQM" && width && height) {
    const surface = width * height
    return surface * unitPriceHT * quantity
  }
  return unitPriceHT * quantity
}

/**
 * Traduit les enums en labels français
 */
export const CATEGORY_LABELS: Record<string, string> = {
  VISUEL_EXTERIEUR: "Visuel Extérieur",
  BACHE_LAMELLES_PVC: "Bâche Lamelles + PVC Plié à Chaud",
  SIGNALETIQUES_SUSPENDUES: "Signalétiques Suspendues",
  PANNEAUX_IMPRIMES: "Panneaux Imprimés",
  CLAUSTRAS_VERRIERES: "Claustras Bleus + Verrières",
  REBOARD: "Reboard",
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  REVIEWING: "En révision",
  VALIDATED: "Validé",
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  REVIEWING: "bg-amber-100 text-amber-700",
  VALIDATED: "bg-green-100 text-green-700",
}

export const ROLE_LABELS: Record<string, string> = {
  CLIENT: "Client",
  COMMERCIAL: "Commercial",
  ADMIN: "Administrateur",
}
