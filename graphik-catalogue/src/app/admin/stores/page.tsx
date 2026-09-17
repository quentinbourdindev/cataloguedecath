import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StoresManager } from "@/components/admin/stores-manager"

export default async function StoresPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [stores, users] = await Promise.all([
    prisma.store.findMany({
      include: {
        users: {
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } } },
        },
        _count: { select: { briefs: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      orderBy: { email: "asc" },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    }),
  ])

  return <StoresManager initialStores={stores} allUsers={users} />
}
