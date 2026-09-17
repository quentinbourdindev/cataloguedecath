import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DevisStepper } from "@/components/stepper/devis-stepper"

export default async function DevisPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string; briefId?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { storeId, briefId } = await searchParams

  if (!storeId || !briefId) redirect("/catalogue")

  const brief = await prisma.brief.findUnique({
    where: { id: briefId, userId: session.user.id },
    include: {
      store: true,
      lines: {
        include: { product: true },
        orderBy: { createdAt: "asc" },
      },
      logistics: true,
    },
  })

  if (!brief) redirect("/catalogue")

  // Briefs soumis et validés → en lecture seule dans le stepper
  const isReadonly = brief.status === "SUBMITTED" || brief.status === "VALIDATED"

  return (
    <DevisStepper
      brief={brief}
      storeName={brief.store.name}
      isReadonly={isReadonly}
    />
  )
}
