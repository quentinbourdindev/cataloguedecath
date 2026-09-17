import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

type Params = { params: Promise<{ id: string }> }

// GET /api/briefs/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { id } = await params
  const brief = await prisma.brief.findUnique({
    where: { id },
    include: {
      store: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      lines: {
        include: {
          product: {
            select: { id: true, name: true, category: true, pricingType: true, imageUrl: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      logistics: true,
    },
  })

  if (!brief) {
    return NextResponse.json({ error: "Brief introuvable" }, { status: 404 })
  }

  // Les clients ne peuvent voir que leurs propres briefs
  if (session.user.role === "CLIENT" && brief.userId !== session.user.id) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
  }

  return NextResponse.json(brief)
}

// PATCH /api/briefs/[id] — Autosave du panier ou mise à jour admin
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const brief = await prisma.brief.findUnique({
    where: { id },
    select: { userId: true, status: true },
  })

  if (!brief) {
    return NextResponse.json({ error: "Brief introuvable" }, { status: 404 })
  }

  // Client ne peut modifier que ses propres briefs en DRAFT ou REVIEWING
  if (session.user.role === "CLIENT") {
    if (brief.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }
    if (brief.status !== "DRAFT" && brief.status !== "REVIEWING") {
      return NextResponse.json({ error: "Ce brief ne peut plus être modifié" }, { status: 400 })
    }
  }

  const updateSchema = z.object({
    notes: z.string().optional(),
    totalHT: z.number().optional(),
  })

  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  }

  const updated = await prisma.brief.update({
    where: { id },
    data: result.data,
  })

  return NextResponse.json(updated)
}
