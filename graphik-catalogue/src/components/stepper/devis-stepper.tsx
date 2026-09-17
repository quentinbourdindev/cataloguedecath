"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { toast } from "sonner"
import { Check, ChevronLeft, ChevronRight, ShoppingCart, Info, Truck, Upload, CheckCircle } from "lucide-react"
import { formatPrice, CATEGORY_LABELS } from "@/lib/utils"
import { StepRecap } from "./step-recap"
import { StepContact } from "./step-contact"
import { StepLogistique } from "./step-logistique"
import { StepUpload } from "./step-upload"

interface DevisStepperProps {
  brief: any
  storeName: string
  isReadonly: boolean
}

const STEPS = [
  { id: 1, label: "Récapitulatif", icon: ShoppingCart },
  { id: 2, label: "Contact", icon: Info },
  { id: 3, label: "Logistique", icon: Truck },
  { id: 4, label: "Plan", icon: Upload },
]

export function DevisStepper({ brief, storeName, isReadonly }: DevisStepperProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValidity, setFormValidity] = useState({ 2: false, 3: false })
  const [isSubmitted, setIsSubmitted] = useState(
    brief.status === "SUBMITTED" || brief.status === "VALIDATED"
  )
  const contentRef = useRef<HTMLDivElement>(null)

  // État accumulé des formulaires
  const [contactData, setContactData] = useState<any>(
    brief.logistics
      ? {
          contactName: brief.logistics.contactName,
          contactEmail: brief.logistics.contactEmail,
          contactPhone: brief.logistics.contactPhone,
        }
      : null
  )
  const [logisticsData, setLogisticsData] = useState<any>(
    brief.logistics
      ? {
          unloadingDock: brief.logistics.unloadingDock,
          handlingEquipment: brief.logistics.handlingEquipment,
          requestedDeliveryWeek: brief.logistics.requestedDeliveryWeek,
          installationByGraphik: brief.logistics.installationByGraphik,
          requestedInstallationDate: brief.logistics.requestedInstallationDate
            ? new Date(brief.logistics.requestedInstallationDate)
                .toISOString()
                .split("T")[0]
            : null,
        }
      : null
  )
  const [planData, setPlanData] = useState<any>(
    brief.logistics?.uploadedPlanUrl
      ? {
          uploadedPlanUrl: brief.logistics.uploadedPlanUrl,
          uploadedPlanName: brief.logistics.uploadedPlanName,
        }
      : null
  )

  // Animation de transition d'étape
  const animateStep = () => {
    if (!contentRef.current) return
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
    )
  }

  useEffect(() => {
    animateStep()
  }, [currentStep])

  const goNext = () => {
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1)
    }
  }

  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleSubmit = async () => {
    if (!contactData || !logisticsData || !planData) {
      toast.error("Veuillez compléter toutes les étapes avant de soumettre")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/briefs/${brief.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logistics: {
            ...contactData,
            ...logisticsData,
            ...planData,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de la soumission")
      }

      setIsSubmitted(true)
      toast.success("Votre devis a été soumis avec succès !")
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Écran de confirmation post-soumission
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">
          Devis soumis !
        </h1>
        <p className="text-neutral-500 leading-relaxed mb-2">
          Votre demande pour <strong>{storeName}</strong> a bien été transmise à l&apos;équipe Graphik.
        </p>
        <p className="text-neutral-400 text-sm mb-8">
          Vous recevrez un email de confirmation. L&apos;équipe vous contactera prochainement.
        </p>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-left mb-8">
          <p className="text-sm font-medium text-neutral-700 mb-3">Récapitulatif :</p>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Nombre de lignes</span>
            <span className="font-medium">{brief.lines.length}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-neutral-500">Total HT estimé</span>
            <span className="font-bold">{formatPrice(brief.totalHT)}</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/catalogue")}
          className="bg-neutral-950 text-white px-6 py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors"
        >
          Retour au catalogue
        </button>
      </div>
    )
  }

  // Vérifier quelles étapes sont complétées
  const stepCompleted = [
    true, // Récap : toujours valide si on a des lignes
    !!contactData,
    !!logisticsData,
    !!planData,
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/catalogue?storeId=${brief.storeId}`)}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour au catalogue
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">
          Validation du devis — {storeName}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Complétez les 4 étapes pour soumettre votre demande
        </p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center mb-10">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isDone = stepCompleted[step.id - 1] && currentStep > step.id

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => {
                  // On peut naviguer librement en arrière, ou en avant si l'étape précédente est validée
                  if (step.id < currentStep || (step.id === currentStep + 1 && stepCompleted[currentStep - 1])) {
                    setCurrentStep(step.id)
                  }
                }}
                className={`flex flex-col items-center gap-1.5 group ${
                  step.id <= currentStep || isDone ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all font-medium text-sm ${
                    isDone
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-neutral-950 text-white ring-4 ring-neutral-950/20"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                    stepCompleted[step.id - 1] && currentStep > step.id
                      ? "bg-green-400"
                      : currentStep > step.id
                      ? "bg-neutral-300"
                      : "bg-neutral-100"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenu de l'étape */}
      <div ref={contentRef} className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8">
        {currentStep === 1 && (
          <StepRecap
            lines={brief.lines}
            totalHT={brief.totalHT}
            storeName={storeName}
            readonly={isReadonly}
          />
        )}
        {currentStep === 2 && (
          <StepContact
            initialData={contactData}
            readonly={isReadonly}
            onValidityChange={(v) => setFormValidity(p => ({ ...p, 2: v }))}
            onValidate={(data) => {
              setContactData(data)
              goNext()
            }}
          />
        )}
        {currentStep === 3 && (
          <StepLogistique
            initialData={logisticsData}
            readonly={isReadonly}
            onValidityChange={(v) => setFormValidity(p => ({ ...p, 3: v }))}
            onValidate={(data) => {
              setLogisticsData(data)
              goNext()
            }}
          />
        )}
        {currentStep === 4 && (
          <StepUpload
            briefId={brief.id}
            initialData={planData}
            readonly={isReadonly}
            onValidate={(data) => {
              setPlanData(data)
            }}
          />
        )}
      </div>

      {/* Boutons de navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </button>

        {currentStep < 4 ? (
          <button
            type={currentStep === 2 || currentStep === 3 ? "submit" : "button"}
            form={currentStep === 2 || currentStep === 3 ? `step-form-${currentStep}` : undefined}
            onClick={currentStep === 2 || currentStep === 3 ? undefined : goNext}
            disabled={
              (currentStep === 2 && !formValidity[2]) ||
              (currentStep === 3 && !formValidity[3])
            }
            className="flex items-center gap-2 bg-neutral-950 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Étape suivante
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          !isReadonly && (
            <button
              onClick={handleSubmit}
              disabled={!planData || isSubmitting}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Soumission…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Soumettre le devis
                </>
              )}
            </button>
          )
        )}
      </div>
    </div>
  )
}
