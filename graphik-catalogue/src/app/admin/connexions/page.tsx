import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, User as UserIcon } from "lucide-react"

export default async function ConnexionsPage() {
  const session = await auth()
  if (!session?.user || session.user.role === "CLIENT") {
    redirect("/login")
  }

  const logs = await prisma.connectionLog.findMany({
    where: {
      user: {
        role: {
          notIn: ["ADMIN", "SUPER_ADMIN"],
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Journal de connexion</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Historique des 100 dernières connexions à l'application.
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-neutral-500">
              <th className="px-5 py-3.5 font-medium w-1/4">Date et heure</th>
              <th className="px-5 py-3.5 font-medium">Utilisateur</th>
              <th className="px-5 py-3.5 font-medium w-1/5">Rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-neutral-400">
                  Aucune connexion enregistrée.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: fr })}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {log.user.firstName} {log.user.lastName}
                        </p>
                        <p className="text-xs text-neutral-500">{log.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600">
                      {log.user.role}
                    </span>
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
