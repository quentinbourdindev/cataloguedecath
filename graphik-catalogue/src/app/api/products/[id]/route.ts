import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { productSchema } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

// GET /api/products/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
  }

  return NextResponse.json(product)
}

// PATCH /api/products/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const result = productSchema.partial().safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten() },
      { status: 400 }
    )
  }

  const { options, ...data } = result.data
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      ...(options !== undefined ? { options } : {}),
    },
  })

  return NextResponse.json(product)
}

// DELETE /api/products/[id] — Soft delete (isActive = false)
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
