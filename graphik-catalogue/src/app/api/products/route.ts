import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { productSchema } from "@/lib/validations"

// GET /api/products — Liste des produits (public pour les clients connectés)
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category: category as any } : {}),
    },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  })

  return NextResponse.json(products)
}

// POST /api/products — Création d'un produit (ADMIN/COMMERCIAL seulement)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const body = await req.json()
  const result = productSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten() },
      { status: 400 }
    )
  }

  const { options, ...data } = result.data
  const product = await prisma.product.create({
    data: {
      ...data,
      options: options ?? [],
    },
  })

  return NextResponse.json(product, { status: 201 })
}
