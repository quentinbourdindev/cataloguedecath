"use client"

import { useState, useRef, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Mail, Lock, Loader2, Store, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { gsap } from "gsap"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/catalogue"

  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN")
  const [isLoading, setIsLoading] = useState(false)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
  }, [mode])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast.error(res.error === "CredentialsSignin" ? "Identifiants incorrects" : res.error)
      } else {
        toast.success("Connexion réussie !")
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'inscription")
        setIsLoading(false)
        return
      }

      if (!data.isApproved) {
        toast.success("Demande envoyée ! Un administrateur doit valider votre compte avant que vous puissiez vous connecter.", { duration: 6000 })
        setMode("LOGIN")
        setIsLoading(false)
        return
      }

      toast.success("Compte créé ! Connexion en cours...")
      
      // Auto-login for approved accounts
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (loginRes?.error) {
        toast.error("Veuillez vous connecter manuellement")
        setMode("LOGIN")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast.error("Erreur serveur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-12">
      <div
        ref={containerRef}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl opacity-0"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4">
            <span className="text-neutral-950 font-black text-xl">G</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === "LOGIN" ? "Bon retour" : "Créer un compte"}
          </h1>
          <p className="text-neutral-500 text-sm mt-1 text-center">
            {mode === "LOGIN" 
              ? "Entrez vos identifiants pour accéder à votre espace." 
              : "Créez votre compte pour démarrer une nouvelle demande."}
          </p>
        </div>

        {mode === "LOGIN" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-300 block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="directeur@decathlon.fr"
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300 block mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-white text-neutral-950 font-semibold py-3 rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Se connecter"}
            </button>

            <p className="text-center text-sm text-neutral-500 mt-6">
              Première connexion ?{" "}
              <button type="button" onClick={() => setMode("REGISTER")} className="text-white font-medium hover:underline">
                Créer un compte
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1.5">Prénom</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1.5">Nom</label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300 block mb-1.5">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300 block mb-1.5">Créer un mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password || !firstName || !lastName}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer mon compte"}
            </button>

            <p className="text-center text-sm text-neutral-500 mt-6">
              Déjà un compte ?{" "}
              <button type="button" onClick={() => setMode("LOGIN")} className="text-white font-medium hover:underline">
                Se connecter
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
