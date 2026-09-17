"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Store, MapPin, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { PageWrapper } from "@/components/ui/page-wrapper"

export function CreateStoreForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [city, setCity] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/stores/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la création du magasin")
      }

      toast.success("Magasin créé avec succès !")
      router.push("/catalogue")
      router.refresh()
    } catch (error) {
      toast.error("Erreur serveur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
        <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-5 mx-auto">
          <Store className="w-6 h-6 text-neutral-600" />
        </div>
        <h2 className="text-xl font-bold text-center text-neutral-900 mb-2">
          Quel magasin représentez-vous ?
        </h2>
        <p className="text-sm text-neutral-500 text-center mb-8">
          Pour démarrer une nouvelle demande, veuillez d'abord renseigner les informations de votre magasin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1.5">
              Nom complet du magasin
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Decathlon Nancy Centre"
                className="w-full bg-white border border-neutral-300 text-neutral-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1.5">
              Ville (Optionnel)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Nancy"
                className="w-full bg-white border border-neutral-300 text-neutral-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name}
            className="w-full bg-neutral-950 text-white font-semibold py-3 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Créer et continuer
              </>
            )}
          </button>
        </form>
      </div>
    </PageWrapper>
  )
}
