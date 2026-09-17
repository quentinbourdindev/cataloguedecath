import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatPrice, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils"
import { FileText, Package, Store, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // Statistiques globales
  const [totalBriefs, briefsByStatus, recentBriefs, totalProducts, totalStores, totalUsers] =
    await Promise.all([
      prisma.brief.count(),
      prisma.brief.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.brief.findMany({
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: {
          store: { select: { name: true } },
          user: { select: { firstName: true, lastName: true, email: true } },
          logistics: { select: { requestedInstallationDate: true, requestedDeliveryWeek: true } },
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.store.count(),
      prisma.user.count({ where: { role: "CLIENT" } }),
    ])

  const statusCount = Object.fromEntries(
    briefsByStatus.map((b) => [b.status, b._count.status])
  )

  const stats = [
    {
      label: "Briefs soumis",
      value: statusCount["SUBMITTED"] ?? 0,
      icon: Clock,
      color: "text-blue-600 bg-blue-50",
      href: "/admin/briefs?status=SUBMITTED",
    },
    {
      label: "En révision",
      value: statusCount["REVIEWING"] ?? 0,
      icon: AlertCircle,
      color: "text-amber-600 bg-amber-50",
      href: "/admin/briefs?status=REVIEWING",
    },
    {
      label: "Validés",
      value: statusCount["VALIDATED"] ?? 0,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
      href: "/admin/briefs?status=VALIDATED",
    },
    {
      label: "Total briefs",
      value: totalBriefs,
      icon: TrendingUp,
      color: "text-neutral-600 bg-neutral-100",
      href: "/admin/briefs",
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Vue d&apos;ensemble des activités Graphik</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-sm text-neutral-500 mt-0.5">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Ressources secondaires */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Produits actifs", value: totalProducts, icon: Package, href: "/admin/produits" },
          { label: "Magasins", value: totalStores, icon: Store, href: "/admin/stores" },
          { label: "Clients", value: totalUsers, icon: Users, href: "/admin/stores" },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
            >
              <Icon className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="font-semibold text-neutral-900">{item.value}</p>
                <p className="text-xs text-neutral-400">{item.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Briefs récents */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 text-sm">Activité récente</h2>
          <Link href="/admin/briefs" className="text-xs text-neutral-400 hover:text-neutral-700">
            Tout voir →
          </Link>
        </div>
        <div className="divide-y divide-neutral-50">
          {recentBriefs.map((brief) => {
            const clientName =
              [brief.user.firstName, brief.user.lastName].filter(Boolean).join(" ") ||
              brief.user.email
            return (
              <Link
                key={brief.id}
                href={`/admin/briefs/${brief.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">{brief.store.name}</p>
                  <p className="text-xs text-neutral-400">{clientName}</p>
                </div>
                <div className="flex items-center gap-3">
                  {brief.logistics?.requestedDeliveryWeek && (
                    <span className="text-xs text-neutral-400 hidden sm:block">
                      {brief.logistics.requestedDeliveryWeek}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[brief.status]}`}
                  >
                    {STATUS_LABELS[brief.status]}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
