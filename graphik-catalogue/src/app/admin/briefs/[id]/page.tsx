import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { BriefEditor } from "@/components/admin/brief-editor"

type Params = { params: Promise<{ id: string }> }

export default async function BriefDetailPage({ params }: Params) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const brief = await prisma.brief.findUnique({
    where: { id },
    include: {
      store: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      lines: {
        include: { product: { select: { id: true, name: true, category: true, pricingType: true } } },
        orderBy: { createdAt: "asc" },
      },
      logistics: true,
    },
  })

  if (!brief) notFound()

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true, unitPriceHT: true, pricingType: true },
  })

  return <BriefEditor brief={brief} products={products} currentUserRole={session.user.role} />
}
