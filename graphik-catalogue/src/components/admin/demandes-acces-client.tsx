"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { User as UserIcon, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { User } from "@prisma/client"

export function DemandesAccesClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/users/${id}/approve`, { method: "PATCH" })
      if (!res.ok) throw new Error()
      
      toast.success("Utilisateur approuvé avec succès !")
      setUsers(users.filter(u => u.id !== id))
      router.refresh()
    } catch(e) {
      toast.error("Erreur lors de l'approbation")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Demandes d'accès</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Comptes créés avec une adresse email externe (hors @decathlon.fr ou @graphik.fr) en attente de validation.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-neutral-500">
              <th className="px-5 py-3.5 font-medium w-1/4">Date de demande</th>
              <th className="px-5 py-3.5 font-medium">Utilisateur</th>
              <th className="px-5 py-3.5 font-medium w-32 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-neutral-400">
                  Aucune demande en attente.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-5 py-3 text-neutral-600">
                    {format(new Date(user.createdAt), "dd MMM yyyy, HH:mm", { locale: fr })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={loadingId === user.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                    >
                      {loadingId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approuver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
