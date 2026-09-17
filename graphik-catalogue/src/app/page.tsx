import Link from "next/link"
import { ArrowRight, Package, Truck, LayoutDashboard, Plus, Clock } from "lucide-react"
import { auth } from "@/lib/auth"
import { PageWrapper } from "@/components/ui/page-wrapper"

export default async function HomePage() {
  const session = await auth()

  return (
    <PageWrapper className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-neutral-950 font-black text-sm">G</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">GRAPHIK</span>
        </div>
        
        {session ? (
          <Link
            href={session.user.role === "CLIENT" ? "/mes-demandes" : "/admin/dashboard"}
            className="text-sm font-medium hover:text-neutral-300 transition-colors"
          >
            Aller à mon tableau de bord →
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium bg-white text-neutral-950 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Se connecter
          </Link>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Cercles de décoration en fond */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-2xl -z-10" />

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Votre aménagement,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
            simplifié.
          </span>
        </h1>
        
        <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          Bienvenue sur le portail exclusif Graphik pour les magasins Decathlon. 
          Gérez vos projets d'aménagement sur-mesure en toute simplicité.
        </p>

        {/* PORTAIL : 2 CHOIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          {/* Choix 1 : Nouvelle demande */}
          <Link
            href={session ? (session.user.role === "CLIENT" ? "/catalogue" : "/admin/dashboard") : "/login?callbackUrl=/catalogue"}
            className="group relative bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold mb-2">Nouvelle demande</h2>
            <p className="text-sm text-neutral-400">
              Démarrez un nouveau devis via notre catalogue interactif.
            </p>
          </Link>

          {/* Choix 2 : Mes demandes */}
          <Link
            href={session ? (session.user.role === "CLIENT" ? "/mes-demandes" : "/admin/briefs") : "/login?callbackUrl=/mes-demandes"}
            className="group relative bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold mb-2">Accéder à mes demandes</h2>
            <p className="text-sm text-neutral-400">
              Retrouvez vos brouillons, devis en cours et validés.
            </p>
          </Link>
        </div>

      </main>
    </PageWrapper>
  )
}
