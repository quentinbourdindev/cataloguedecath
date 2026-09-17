import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatPrice, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils"
import { Eye } from "lucide-react"

export default async function BriefsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; storeId?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { status, storeId } = await searchParams

  const briefs = await prisma.brief.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(storeId ? { storeId } : {}),
    },
    include: {
      store: { select: { id: true, name: true, city: true } },
      user: { select: { firstName: true, lastName: true, email: true } },
      logistics: {
        select: {
          requestedDeliveryWeek: true,
          requestedInstallationDate: true,
          contactName: true,
          installationByGraphik: true,
        },
      },
      _count: { select: { lines: true } },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  })

  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } })

  const STATUSES = ["DRAFT", "SUBMITTED", "REVIEWING", "VALIDATED"]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pipeline Briefs</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {briefs.length} brief{briefs.length > 1 ? "s" : ""}
            {status ? ` — ${STATUS_LABELS[status as keyof typeof STATUS_LABELS]}` : ""}
          </p>
        </div>
        <a
          href="/api/admin/export-briefs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
          title="Exporter toutes les commandes au format Excel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </a>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/briefs"
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !status ? "bg-neutral-950 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"
          }`}
        >
          Tous
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/briefs?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === s ? "bg-neutral-950 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {["Magasin", "Contact", "Semaine liv.", "Lignes", "Total HT", "Statut", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3 first:pl-5 last:pr-5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {briefs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400 text-sm">
                    Aucun brief trouvé
                  </td>
                </tr>
              ) : (
                briefs.map((brief) => {
                  const clientName =
                    [brief.user.firstName, brief.user.lastName].filter(Boolean).join(" ") ||
                    brief.user.email

                  return (
                    <tr key={brief.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 pl-5">
                        <p className="font-medium text-neutral-900 text-sm">{brief.store.name}</p>
                        {brief.store.city && (
                          <p className="text-xs text-neutral-400">{brief.store.city}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-neutral-700">{brief.logistics?.contactName ?? clientName}</p>
                        <p className="text-xs text-neutral-400">{brief.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-neutral-600">
                          {brief.logistics?.requestedDeliveryWeek ?? "—"}
                        </p>
                        {brief.logistics?.requestedInstallationDate && (
                          <p className="text-xs text-neutral-400">
                            Pose:{" "}
                            {new Date(brief.logistics.requestedInstallationDate).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-600">{brief._count.lines}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-neutral-900">
                          {formatPrice(brief.totalHT)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[brief.status]}`}
                        >
                          {STATUS_LABELS[brief.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 pr-5">
                        <Link
                          href={`/admin/briefs/${brief.id}`}
                          className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Voir
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
