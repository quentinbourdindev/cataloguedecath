import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateLinePrice } from "@/lib/utils"
import { z } from "zod"

type Params = { params: Promise<{ id: string }> }

const lineSchema = z.object({
  productId: z.string().optional().nullable(),
  customName: z.string().optional().nullable(),
  quantity: z.number().int().positive(),
  width: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  selectedOption: z.string().optional().nullable(),
  unitPriceHT: z.number().positive(),
  isOutOfCatalogue: z.boolean().default(false),
  attachmentUrl: z.string().optional().nullable(),
})

// GET /api/briefs/[id]/lines
export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { id } = await params
  const lines = await prisma.briefLine.findMany({
    where: { briefId: id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(lines)
}

// POST /api/briefs/[id]/lines — Ajoute une ligne et recalcule le total
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { id: briefId } = await params

  // Vérifier accès au brief
  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    select: { userId: true, status: true },
  })

  if (!brief) return NextResponse.json({ error: "Brief introuvable" }, { status: 404 })

  if (session.user.role === "CLIENT") {
    if (brief.userId !== session.user.id)
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    if (brief.status !== "DRAFT" && brief.status !== "REVIEWING")
      return NextResponse.json({ error: "Brief non modifiable" }, { status: 400 })
  }

  const body = await req.json()
  const result = lineSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides", details: result.error.flatten() }, { status: 400 })
  }

  const lineData = result.data

  // Récupérer le pricingType du produit si c'est un produit catalogue
  let pricingType: "UNIT" | "SQM" = "UNIT"
  if (lineData.productId) {
    const product = await prisma.product.findUnique({
      where: { id: lineData.productId },
      select: { pricingType: true },
    })
    if (product) pricingType = product.pricingType
  }

  const totalPriceHT = calculateLinePrice({
    pricingType,
    unitPriceHT: lineData.unitPriceHT,
    quantity: lineData.quantity,
    width: lineData.width,
    height: lineData.height,
  })

  // Transaction : créer la ligne + recalculer le total du brief
  const [line] = await prisma.$transaction(async (tx) => {
    const newLine = await tx.briefLine.create({
      data: {
        briefId,
        ...lineData,
        totalPriceHT,
      },
      include: { product: true },
    })

    const allLines = await tx.briefLine.findMany({
      where: { briefId },
      select: { totalPriceHT: true },
    })

    const newTotal = allLines.reduce((sum, l) => sum + l.totalPriceHT, 0)

    await tx.brief.update({
      where: { id: briefId },
      data: { totalHT: newTotal },
    })

    return [newLine]
  })

  return NextResponse.json(line, { status: 201 })
}

// PUT /api/briefs/[id]/lines — Met à jour toutes les lignes d'un coup (autosave complet)
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { id: briefId } = await params
  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    select: { userId: true, status: true },
  })

  if (!brief) return NextResponse.json({ error: "Brief introuvable" }, { status: 404 })

  if (session.user.role === "CLIENT") {
    if (brief.userId !== session.user.id)
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    if (brief.status !== "DRAFT" && brief.status !== "REVIEWING")
      return NextResponse.json({ error: "Brief non modifiable" }, { status: 400 })
  }

  const body = await req.json()
  const linesSchema = z.array(
    lineSchema.extend({
      id: z.string().optional(), // existant si fourni
      pricingType: z.enum(["UNIT", "SQM"]).optional(),
    })
  )
  
  const result = linesSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  }

  const lines = result.data

  await prisma.$transaction(async (tx) => {
    // Supprimer toutes les lignes existantes
    await tx.briefLine.deleteMany({ where: { briefId } })

    // Recréer toutes les lignes
    let totalHT = 0
    for (const line of lines) {
      const pricingType = line.pricingType ?? "UNIT"
      const totalPriceHT = calculateLinePrice({
        pricingType,
        unitPriceHT: line.unitPriceHT,
        quantity: line.quantity,
        width: line.width,
        height: line.height,
      })
      totalHT += totalPriceHT

      const { id, pricingType: _pt, ...lineData } = line
      await tx.briefLine.create({
        data: { briefId, ...lineData, totalPriceHT },
      })
    }

    await tx.brief.update({
      where: { id: briefId },
      data: { totalHT },
    })
  })

  const updated = await prisma.brief.findUnique({
    where: { id: briefId },
    include: { lines: { include: { product: true } } },
  })

  return NextResponse.json(updated)
}

// DELETE /api/briefs/[id]/lines?lineId=xxx — Supprime une ligne
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { id: briefId } = await params
  const { searchParams } = new URL(req.url)
  const lineId = searchParams.get("lineId")

  if (!lineId) return NextResponse.json({ error: "lineId requis" }, { status: 400 })

  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    select: { userId: true, status: true },
  })

  if (!brief) return NextResponse.json({ error: "Brief introuvable" }, { status: 404 })

  if (session.user.role === "CLIENT" && brief.userId !== session.user.id) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.briefLine.delete({ where: { id: lineId } })

    const remaining = await tx.briefLine.findMany({
      where: { briefId },
      select: { totalPriceHT: true },
    })
    const newTotal = remaining.reduce((s, l) => s + l.totalPriceHT, 0)
    await tx.brief.update({ where: { id: briefId }, data: { totalHT: newTotal } })
  })

  return NextResponse.json({ success: true })
}
