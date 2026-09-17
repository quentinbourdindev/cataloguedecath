import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ClientHeader } from "@/components/layout/client-header"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role !== "CLIENT") redirect("/admin/dashboard")

  const stores = await prisma.userStore.findMany({
    where: { userId: session.user.id },
    include: { store: true },
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      <ClientHeader
        user={{
          email: session.user.email,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
        }}
        stores={stores.map((us) => us.store)}
      />
      <main className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
