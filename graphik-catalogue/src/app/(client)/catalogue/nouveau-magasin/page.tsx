import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreateStoreForm } from "@/components/client/create-store-form"

export default async function NouveauMagasinPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Ajouter un nouveau magasin</h1>
        <p className="text-neutral-500 mt-1">
          Renseignez les informations de ce magasin pour l'associer à votre compte.
        </p>
      </div>
      <CreateStoreForm />
    </div>
  )
}
