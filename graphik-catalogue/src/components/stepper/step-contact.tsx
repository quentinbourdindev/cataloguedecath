"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, Phone, User } from "lucide-react"
import { briefContactSchema, type BriefContactValues } from "@/lib/validations"

interface StepContactProps {
  initialData: BriefContactValues | null
  readonly?: boolean
  onValidate: (data: BriefContactValues) => void
  onValidityChange?: (isValid: boolean) => void
}

export function StepContact({ initialData, readonly, onValidate, onValidityChange }: StepContactProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BriefContactValues>({
    resolver: zodResolver(briefContactSchema),
    defaultValues: initialData ?? {},
    mode: "onChange",
  })

  // Notify parent of validity changes
  useEffect(() => {
    onValidityChange?.(isValid)
  }, [isValid, onValidityChange])

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-300 focus:ring-red-200 bg-red-50"
        : "border-neutral-200 focus:ring-neutral-200 bg-white"
    } ${readonly ? "bg-neutral-50 text-neutral-500 cursor-not-allowed" : ""}`

  return (
    <form id="step-form-2" onSubmit={handleSubmit(onValidate)}>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">Informations de contact</h2>
      <p className="text-neutral-500 text-sm mb-6">
        Ces informations permettront à l'équipe Graphik de vous recontacter.
      </p>

      <div className="space-y-5">
        {/* Nom du contact */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              Nom du contact <span className="text-red-500">*</span>
            </span>
          </label>
          <input
            {...register("contactName")}
            readOnly={readonly}
            placeholder="Prénom Nom"
            className={inputClass(!!errors.contactName)}
          />
          {errors.contactName && (
            <p className="text-red-500 text-xs mt-1.5">{errors.contactName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              Adresse email <span className="text-red-500">*</span>
            </span>
          </label>
          <input
            {...register("contactEmail")}
            readOnly={readonly}
            type="email"
            placeholder="contact@decathlon.fr"
            className={inputClass(!!errors.contactEmail)}
          />
          {errors.contactEmail && (
            <p className="text-red-500 text-xs mt-1.5">{errors.contactEmail.message}</p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              Téléphone <span className="text-red-500">*</span>
            </span>
          </label>
          <input
            {...register("contactPhone")}
            readOnly={readonly}
            type="tel"
            placeholder="06 12 34 56 78"
            className={inputClass(!!errors.contactPhone)}
          />
          {errors.contactPhone && (
            <p className="text-red-500 text-xs mt-1.5">{errors.contactPhone.message}</p>
          )}
        </div>
      </div>
    </form>
  )
}
