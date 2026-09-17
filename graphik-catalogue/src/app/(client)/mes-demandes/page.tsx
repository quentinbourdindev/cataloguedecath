import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, ArrowRight, Package, Clock, CheckCircle, FileText, AlertCircle, ShoppingCart } from "lucide-react"
import { formatPrice, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils"
import { PageWrapper } from "@/components/ui/page-wrapper"

export default async function MesDemandesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login")
  }

  // Fetch all briefs for this client, sorted by newest first
  const briefs = await prisma.brief.findMany({
    where: { userId: session.user.id },
    include: {
      store: true,
      _count: { select: { lines: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Sépare les brouillons des demandes soumises/validées
  const activeDrafts = briefs.filter(b => b.status === "DRAFT" || b.status === "REVIEWING")
  const historyBriefs = briefs.filter(b => b.status === "SUBMITTED" || b.status === "VALIDATED")

  return (
    <PageWrapper className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Mes demandes</h1>
          <p className="text-sm text-neutral-500">
            Retrouvez ici tous vos paniers en cours et devis historiques.
          </p>
        </div>
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </Link>
      </div>

      <div className="space-y-12">
        {/* SECTION: Biefs en cours (Brouillons & À Réviser) */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-neutral-400" />
            Paniers en cours
          </h2>
          
          {activeDrafts.length === 0 ? (
            <div className="bg-white border border-neutral-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-1">Aucun panier en cours</h3>
              <p className="text-sm text-neutral-500 mb-4 max-w-sm">
                Vous n'avez pas de demande d'aménagement en cours de construction.
              </p>
              <Link
                href="/catalogue"
                className="text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-lg transition-colors"
              >
                Commencer mon devis
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDrafts.map((brief) => (
                <BriefCard key={brief.id} brief={brief} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION: Historique (Soumis & Validés) */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-neutral-400" />
            Historique des demandes
          </h2>
          
          {historyBriefs.length === 0 ? (
            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <Clock className="w-8 h-8 text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-500">Aucun historique disponible.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyBriefs.map((brief) => (
                <BriefCard key={brief.id} brief={brief} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  )
}

function BriefCard({ brief }: { brief: any }) {
  const isActionNeeded = brief.status === "REVIEWING"
  const isDraft = brief.status === "DRAFT"
  
  return (
    <Link
      href={`/catalogue?briefId=${brief.id}`}
      className="group block bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[brief.status as keyof typeof STATUS_COLORS]}`}>
            {brief.status === "REVIEWING" && <AlertCircle className="w-3.5 h-3.5" />}
            {brief.status === "VALIDATED" && <CheckCircle className="w-3.5 h-3.5" />}
            {brief.status === "SUBMITTED" && <Clock className="w-3.5 h-3.5" />}
            {STATUS_LABELS[brief.status as keyof typeof STATUS_LABELS]}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white text-neutral-400 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
      
      <h3 className="font-semibold text-neutral-900 text-lg line-clamp-1 mb-1">
        {brief.store.name}
      </h3>
      <p className="text-sm text-neutral-500 mb-4 flex items-center gap-2">
        <span>{new Date(brief.updatedAt).toLocaleDateString('fr-FR')}</span>
        <span>•</span>
        <span>{brief._count.lines} prestation{brief._count.lines > 1 ? "s" : ""}</span>
      </p>
      
      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          {isDraft || isActionNeeded ? "Total estimé" : "Total validé"}
        </span>
        <span className="font-bold text-neutral-900">
          {formatPrice(brief.totalHT)}
        </span>
      </div>
    </Link>
  )
}
