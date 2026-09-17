"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Truck, Wrench, Calendar, HardHat } from "lucide-react"
import { briefLogisticsSchema, type BriefLogisticsValues } from "@/lib/validations"

interface StepLogistiqueProps {
  initialData: BriefLogisticsValues | null
  readonly?: boolean
  onValidate: (data: BriefLogisticsValues) => void
  onValidityChange?: (isValid: boolean) => void
}

function ToggleField({
  label,
  description,
  icon: Icon,
  value,
  onChange,
  readonly,
}: {
  label: string
  description: string
  icon: React.ElementType
  value: boolean
  onChange: (v: boolean) => void
  readonly?: boolean
}) {
  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-start gap-4 flex-1">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-neutral-100">
          <Icon className="w-5 h-5 text-neutral-500" />
        </div>
        <div>
          <p className="font-semibold text-sm text-neutral-900">{label}</p>
          <p className="text-xs mt-0.5 text-neutral-500 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
        <button
          type="button"
          onClick={() => !readonly && onChange(true)}
          disabled={readonly}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            value === true
              ? "bg-neutral-950 text-white shadow-md"
              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
          } ${readonly ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
        >
          Oui
        </button>
        <button
          type="button"
          onClick={() => !readonly && onChange(false)}
          disabled={readonly}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            value === false
              ? "bg-white border-2 border-neutral-950 text-neutral-950 shadow-sm"
              : "bg-white border-2 border-neutral-100 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
          } ${readonly ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
        >
          Non
        </button>
      </div>
    </div>
  )
}

export function StepLogistique({ initialData, readonly, onValidate, onValidityChange }: StepLogistiqueProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm<BriefLogisticsValues>({
    resolver: zodResolver(briefLogisticsSchema),
    mode: "onChange",
    defaultValues: initialData ?? {
      unloadingDock: false,
      handlingEquipment: false,
      requestedDeliveryWeek: "",
      installationByGraphik: false,
      requestedInstallationDate: null,
    },
  })

  const installationByGraphik = watch("installationByGraphik")

  useEffect(() => {
    onValidityChange?.(isValid)
  }, [isValid, onValidityChange])

  const inputClass = (hasError?: boolean) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-300 focus:ring-red-200"
        : "border-neutral-200 focus:ring-neutral-200"
    } ${readonly ? "bg-neutral-50 cursor-not-allowed" : "bg-white"}`

  return (
    <form id="step-form-3" onSubmit={handleSubmit(onValidate)}>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">Logistique</h2>
      <p className="text-neutral-500 text-sm mb-6">
        Ces informations sont indispensables pour planifier la livraison et l'installation.
      </p>

      <div className="space-y-4">
        {/* Quai de déchargement */}
        <Controller
          name="unloadingDock"
          control={control}
          render={({ field }) => (
            <ToggleField
              label="Quai de déchargement disponible"
              description="Le magasin dispose d'un quai pour recevoir les livraisons en poids lourd"
              icon={Truck}
              value={field.value}
              onChange={field.onChange}
              readonly={readonly}
            />
          )}
        />

        {/* Matériel de manutention */}
        <Controller
          name="handlingEquipment"
          control={control}
          render={({ field }) => (
            <ToggleField
              label="Matériel de manutention disponible"
              description="Transpalette, chariot élévateur ou autre équipement disponible sur place"
              icon={Wrench}
              value={field.value}
              onChange={field.onChange}
              readonly={readonly}
            />
          )}
        />

        {/* Semaine de livraison */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-500" />
              Semaine de livraison souhaitée <span className="text-red-500">*</span>
            </span>
          </label>
          <input
            {...register("requestedDeliveryWeek")}
            readOnly={readonly}
            placeholder="ex: Semaine 15 (7-11 avril 2025)"
            className={inputClass(!!errors.requestedDeliveryWeek)}
          />
          {errors.requestedDeliveryWeek && (
            <p className="text-red-500 text-xs mt-1.5">{errors.requestedDeliveryWeek.message}</p>
          )}
        </div>

        {/* Pose par Graphik */}
        <Controller
          name="installationByGraphik"
          control={control}
          render={({ field }) => (
            <ToggleField
              label="Pose réalisée par Graphik"
              description="L'équipe Graphik se charge de l'installation sur site"
              icon={HardHat}
              value={field.value}
              onChange={field.onChange}
              readonly={readonly}
            />
          )}
        />

        {/* Date de pose (conditionnelle) */}
        {installationByGraphik && (
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Date de pose souhaitée
            </label>
            <input
              {...register("requestedInstallationDate")}
              readOnly={readonly}
              type="date"
              className={inputClass(!!errors.requestedInstallationDate)}
            />
            {errors.requestedInstallationDate && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.requestedInstallationDate.message}
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
