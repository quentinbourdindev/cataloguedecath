import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProductsManager } from "@/components/admin/products-manager"

export default async function ProduitsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  })

  return <ProductsManager initialProducts={products} />
}
