import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CatalogueClient } from "@/components/catalogue/catalogue-client"
import { CreateStoreForm } from "@/components/client/create-store-form"

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string; briefId?: string; new?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { storeId, briefId, new: isNew } = await searchParams

  // Récupérer les magasins du client
  const userStores = await prisma.userStore.findMany({
    where: { userId: session.user.id },
    include: { store: true },
  })

  if (userStores.length === 0) {
    return <CreateStoreForm />
  }

  // Si un briefId est passé, on charge ce brief spécifique et on force le store actif
  let activeBrief = null
  let activeStore = null

  if (briefId) {
    activeBrief = await prisma.brief.findUnique({
      where: { id: briefId, userId: session.user.id },
      include: {
        lines: { include: { product: true }, orderBy: { createdAt: "asc" } },
        logistics: true,
        store: true,
      },
    })
    if (activeBrief) {
      activeStore = activeBrief.store
    }
  }

  // Si pas de briefId (nouvelle demande ou reprise automatique)
  if (!activeStore) {
    activeStore = storeId
      ? userStores.find((us) => us.storeId === storeId)?.store
      : userStores.length === 1
      ? userStores[0].store
      : null

    if (activeStore && !isNew) {
      activeBrief = await prisma.brief.findFirst({
        where: {
          userId: session.user.id,
          storeId: activeStore.id,
          status: { in: ["DRAFT", "REVIEWING"] },
        },
        include: {
          lines: { include: { product: true }, orderBy: { createdAt: "asc" } },
          logistics: true,
        },
      })
    }
  }

  // Récupérer tous les produits actifs
  const rawProducts = activeStore
    ? await prisma.product.findMany({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      })
    : []

  // Cast the options JsonValue → string[] | null for the component
  const products = rawProducts.map((p) => ({
    ...p,
    options: Array.isArray(p.options) ? (p.options as string[]) : null,
  }))

  return (
    <CatalogueClient
      user={session.user}
      stores={userStores.map((us) => us.store)}
      activeStore={activeStore ?? null}
      products={products}
      initialBrief={activeBrief}
    />
  )
}
