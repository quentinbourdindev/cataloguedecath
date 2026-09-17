"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Store, Users, X, Pencil, MapPin, Briefcase } from "lucide-react"
import { ROLE_LABELS } from "@/lib/utils"

interface StoresManagerProps {
  initialStores: any[]
  allUsers: any[]
}

export function StoresManager({ initialStores, allUsers }: StoresManagerProps) {
  const router = useRouter()
  const [stores, setStores] = useState(initialStores)
  const [showStoreForm, setShowStoreForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingStore, setEditingStore] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State formulaire store
  const [storeName, setStoreName] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [storeCity, setStoreCity] = useState("")
  const [storeZip, setStoreZip] = useState("")
  const [storePhone, setStorePhone] = useState("")

  // State formulaire user
  const [userEmail, setUserEmail] = useState("")
  const [userFirstName, setUserFirstName] = useState("")
  const [userLastName, setUserLastName] = useState("")
  const [userRole, setUserRole] = useState<"CLIENT" | "COMMERCIAL" | "ADMIN">("CLIENT")
  const [userStoreIds, setUserStoreIds] = useState<string[]>([])

  const openStoreCreate = () => {
    setEditingStore(null)
    setStoreName(""); setStoreAddress(""); setStoreCity(""); setStoreZip(""); setStorePhone("")
    setShowStoreForm(true)
  }

  const openStoreEdit = (store: any) => {
    setEditingStore(store)
    setStoreName(store.name ?? ""); setStoreAddress(store.address ?? "")
    setStoreCity(store.city ?? ""); setStoreZip(store.zipCode ?? ""); setStorePhone(store.phone ?? "")
    setShowStoreForm(true)
  }

  const handleSaveStore = async () => {
    if (!storeName.trim()) { toast.error("Le nom est requis"); return }
    setIsSubmitting(true)
    try {
      const url = editingStore ? `/api/stores/${editingStore.id}` : "/api/stores"
      const method = editingStore ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: storeName, address: storeAddress, city: storeCity, zipCode: storeZip, phone: storePhone }),
      })
      if (!res.ok) throw new Error()
      toast.success(editingStore ? "Magasin mis à jour" : "Magasin créé")
      router.refresh()
      setShowStoreForm(false)
    } catch {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveUser = async () => {
    if (!userEmail.trim()) { toast.error("L'email est requis"); return }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          firstName: userFirstName,
          lastName: userLastName,
          role: userRole,
          storeIds: userStoreIds,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Utilisateur créé et accès configuré")
      router.refresh()
      setShowUserForm(false)
    } catch {
      toast.error("Erreur lors de la création")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Magasins & Clients</h1>
          <p className="text-neutral-500 text-sm mt-1">{stores.length} magasin{stores.length > 1 ? "s" : ""} · {allUsers.filter((u: any) => u.role === "CLIENT").length} clients</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUserForm(true)} className="flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors">
            <Users className="w-4 h-4" />
            Nouvel utilisateur
          </button>
          <button onClick={openStoreCreate} className="flex items-center gap-2 bg-neutral-950 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors">
            <Plus className="w-4 h-4" />
            Nouveau magasin
          </button>
        </div>
      </div>

      {/* Liste des magasins */}
      <div className="grid gap-4">
        {stores.map((store: any) => (
          <div key={store.id} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-neutral-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{store.name}</h3>
                  {store.city && (
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {store.city} {store.zipCode}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {store._count.briefs} brief{store._count.briefs > 1 ? "s" : ""}
                </span>
                <button onClick={() => openStoreEdit(store)} className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Utilisateurs liés */}
            {store.users.length > 0 && (
              <div className="border-t border-neutral-100 pt-3 mt-3">
                <p className="text-xs text-neutral-400 mb-2 font-medium uppercase tracking-wide">Contacts</p>
                <div className="flex flex-wrap gap-2">
                  {store.users.map((us: any) => {
                    const name = [us.user.firstName, us.user.lastName].filter(Boolean).join(" ") || us.user.email
                    return (
                      <div key={us.user.id} className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-full px-3 py-1">
                        <div className="w-4 h-4 rounded-full bg-neutral-300 flex items-center justify-center text-white text-[9px] font-bold">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-neutral-700">{name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tableau utilisateurs */}
      <div className="mt-8 bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 text-sm">Tous les utilisateurs</h2>
        </div>
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {["Email", "Nom", "Rôle", "Magasins"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {allUsers.map((user: any) => {
              const linkedStores = stores.filter((s: any) => s.users.some((us: any) => us.user.id === user.id))
              const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "—"
              return (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm text-neutral-900">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full">
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    {linkedStores.map((s: any) => s.name).join(", ") || "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Store */}
      {showStoreForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900">{editingStore ? "Modifier le magasin" : "Nouveau magasin"}</h2>
              <button onClick={() => setShowStoreForm(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Nom *", value: storeName, set: setStoreName, placeholder: "Decathlon Nancy" },
                { label: "Adresse", value: storeAddress, set: setStoreAddress, placeholder: "1 rue du Commerce" },
                { label: "Ville", value: storeCity, set: setStoreCity, placeholder: "Nancy" },
                { label: "Code postal", value: storeZip, set: setStoreZip, placeholder: "54000" },
                { label: "Téléphone", value: storePhone, set: setStorePhone, placeholder: "03 83 12 34 56" },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">{label}</label>
                  <input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200" />
                </div>
              ))}
              <button onClick={handleSaveStore} disabled={isSubmitting} className="w-full bg-neutral-950 text-white font-semibold py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 text-sm">
                {isSubmitting ? "Sauvegarde…" : editingStore ? "Mettre à jour" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal User */}
      {showUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900">Nouvel utilisateur</h2>
              <button onClick={() => setShowUserForm(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">Email *</label>
                <input value={userEmail} onChange={(e) => setUserEmail(e.target.value)} type="email" placeholder="directeur@decathlon.fr" className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Prénom</label>
                  <input value={userFirstName} onChange={(e) => setUserFirstName(e.target.value)} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Nom</label>
                  <input value={userLastName} onChange={(e) => setUserLastName(e.target.value)} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">Rôle</label>
                <select value={userRole} onChange={(e) => setUserRole(e.target.value as any)} className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200">
                  <option value="CLIENT">Client</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
              {userRole === "CLIENT" && (
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Magasins associés</label>
                  <div className="space-y-1 max-h-40 overflow-y-auto border border-neutral-200 rounded-xl p-2">
                    {stores.map((store: any) => (
                      <label key={store.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userStoreIds.includes(store.id)}
                          onChange={(e) => {
                            setUserStoreIds((prev) =>
                              e.target.checked ? [...prev, store.id] : prev.filter((id) => id !== store.id)
                            )
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-neutral-700">{store.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={handleSaveUser} disabled={isSubmitting} className="w-full bg-neutral-950 text-white font-semibold py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 text-sm">
                {isSubmitting ? "Création…" : "Créer l'utilisateur"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
