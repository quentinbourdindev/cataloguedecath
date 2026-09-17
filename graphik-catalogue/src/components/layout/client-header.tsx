"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LogOut, ShoppingBag, ChevronDown, Store } from "lucide-react"
import type { Store as StoreType } from "@prisma/client"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ClientHeaderProps {
  user: {
    email: string
    firstName?: string | null
    lastName?: string | null
  }
  stores: StoreType[]
}

export function ClientHeader({ user, stores }: ClientHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStoreId = searchParams.get("storeId")
  const [storeOpen, setStoreOpen] = useState(false)

  const currentStore = stores.find((s) => s.id === currentStoreId) ?? stores[0]
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email

  const handleStoreSelect = (storeId: string) => {
    router.push(`/catalogue?storeId=${storeId}`)
    setStoreOpen(false)
  }

  const isDevis = pathname.includes("/devis")

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-neutral-950 rounded flex items-center justify-center">
                <span className="text-white font-black text-xs">G</span>
              </div>
              <span className="font-semibold text-neutral-900 tracking-tight">Graphik</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/catalogue"
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith("/catalogue")
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                )}
              >
                Catalogue
              </Link>
              <Link
                href="/mes-demandes"
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith("/mes-demandes")
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                )}
              >
                Mes demandes
              </Link>
            </nav>
          </div>

          {/* Centre : sélecteur de magasin (si plusieurs) et si on est sur le catalogue */}
          <div className="hidden sm:flex items-center">
            {pathname.startsWith("/catalogue") || pathname.startsWith("/devis") ? (
              stores.length > 1 ? (
                <div className="relative">
                  <button
                    onClick={() => setStoreOpen(!storeOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    {currentStore?.name ?? "Sélectionner un magasin"}
                    <ChevronDown className={cn("w-4 h-4 transition-transform", storeOpen && "rotate-180")} />
                  </button>
                  {storeOpen && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50">
                      {stores.map((store) => (
                        <button
                          key={store.id}
                          onClick={() => handleStoreSelect(store.id)}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors",
                            store.id === currentStoreId
                              ? "text-neutral-900 font-medium"
                              : "text-neutral-600"
                          )}
                        >
                          {store.name}
                          {store.city && (
                            <span className="ml-1 text-neutral-400">— {store.city}</span>
                          )}
                        </button>
                      ))}
                      <div className="border-t border-neutral-100 my-1"></div>
                      <button
                        onClick={() => {
                          setStoreOpen(false)
                          router.push("/catalogue/nouveau-magasin")
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-900 font-medium hover:bg-neutral-50 transition-colors"
                      >
                        <Store className="w-4 h-4" />
                        + Ajouter un magasin
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-neutral-500 font-medium flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  {currentStore?.name}
                </span>
              )
            ) : null}
          </div>

          {/* Droite : nav + utilisateur */}
          <div className="flex items-center gap-3">
            {!isDevis && currentStore && pathname.startsWith("/catalogue") && (
              <Link
                href={`/devis?storeId=${currentStore.id}`}
                className="flex items-center gap-2 bg-neutral-950 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:block">Mon devis</span>
              </Link>
            )}

            <div className="flex items-center gap-2 text-sm text-neutral-600 ml-2 border-l border-neutral-200 pl-4">
              <span className="hidden md:block font-medium">{displayName}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
