import { z } from "zod"

// ─────────────────────────────────────────────
// SCHÉMAS AUTH
// ─────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
})

// ─────────────────────────────────────────────
// SCHÉMAS PRODUIT
// ─────────────────────────────────────────────

export const productSchema = z.object({
  category: z.enum([
    "VISUEL_EXTERIEUR",
    "BACHE_LAMELLES_PVC",
    "SIGNALETIQUES_SUSPENDUES",
    "PANNEAUX_IMPRIMES",
    "CLAUSTRAS_VERRIERES",
    "REBOARD",
  ]),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  description: z.string().optional(),
  defaultWidth: z.coerce.number().positive().optional().nullable(),
  defaultHeight: z.coerce.number().positive().optional().nullable(),
  options: z.array(z.any()).optional(),
  pricingType: z.enum(["UNIT", "SQM"]),
  unitPriceHT: z.coerce.number().positive("Le prix doit être positif"),
  sortOrder: z.coerce.number().int().default(0),
})

export type ProductFormValues = z.infer<typeof productSchema>

// ─────────────────────────────────────────────
// SCHÉMAS BRIEF
// ─────────────────────────────────────────────

export const briefLineSchema = z.object({
  productId: z.string().optional().nullable(),
  customName: z.string().optional().nullable(),
  quantity: z.coerce.number().int().positive("La quantité doit être positive"),
  width: z.coerce.number().positive().optional().nullable(),
  height: z.coerce.number().positive().optional().nullable(),
  selectedOption: z.string().optional().nullable(),
  unitPriceHT: z.coerce.number().positive(),
  isOutOfCatalogue: z.boolean().default(false),
})

// Étape 2 du stepper : informations générales
export const briefContactSchema = z.object({
  contactName: z
    .string()
    .min(2, "Le nom du contact est requis"),
  contactEmail: z
    .string()
    .email("Format d'email invalide"),
  contactPhone: z
    .string()
    .min(10, "Numéro de téléphone invalide")
    .regex(/^[\d\s\+\-\(\)\.]+$/, "Format de téléphone invalide"),
})

// Étape 3 du stepper : logistique
export const briefLogisticsSchema = z.object({
  unloadingDock: z.boolean(),
  handlingEquipment: z.boolean(),
  requestedDeliveryWeek: z
    .string()
    .min(1, "La semaine de livraison souhaitée est requise"),
  installationByGraphik: z.boolean(),
  requestedInstallationDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true
        return !isNaN(Date.parse(val))
      },
      { message: "Date invalide" }
    ),
})

// Étape 4 du stepper : upload plan
export const briefPlanSchema = z.object({
  uploadedPlanUrl: z
    .string()
    .min(1, "L'upload du plan de masse est obligatoire"),
  uploadedPlanName: z.string().optional(),
})

// Formulaire complet de logistique (étapes 2 + 3 + 4)
export const briefLogisticsFullSchema = briefContactSchema
  .merge(briefLogisticsSchema)
  .merge(briefPlanSchema)

export type BriefContactValues = z.infer<typeof briefContactSchema>
export type BriefLogisticsValues = z.infer<typeof briefLogisticsSchema>
export type BriefPlanValues = z.infer<typeof briefPlanSchema>
export type BriefLogisticsFullValues = z.infer<typeof briefLogisticsFullSchema>

// ─────────────────────────────────────────────
// SCHÉMAS STORE / USER
// ─────────────────────────────────────────────

export const storeSchema = z.object({
  name: z.string().min(2, "Le nom du magasin est requis"),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
})

export type StoreFormValues = z.infer<typeof storeSchema>

export const userSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["CLIENT", "COMMERCIAL", "ADMIN"]),
  storeIds: z.array(z.string()).optional(),
})

export type UserFormValues = z.infer<typeof userSchema>
