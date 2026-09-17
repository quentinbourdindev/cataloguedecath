import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DemandesAccesClient } from "@/components/admin/demandes-acces-client"

export default async function DemandesAccesPage() {
  const session = await auth()
  if (!session?.user || session.user.role === "CLIENT") {
    redirect("/login")
  }

  const pendingUsers = await prisma.user.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "desc" },
  })

  return <DemandesAccesClient initialUsers={pendingUsers} />
}
