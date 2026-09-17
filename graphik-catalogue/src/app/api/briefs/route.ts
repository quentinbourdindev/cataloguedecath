import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/briefs — Liste des briefs
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { role, id: userId } = session.user

  // Les clients ne voient que leurs propres briefs
  const whereClause =
    role === "CLIENT"
      ? { userId }
      : {} // COMMERCIAL et ADMIN voient tout

  const briefs = await prisma.brief.findMany({
    where: whereClause,
    include: {
      store: { select: { id: true, name: true, city: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      logistics: {
        select: {
          requestedInstallationDate: true,
          requestedDeliveryWeek: true,
          contactName: true,
        },
      },
      _count: { select: { lines: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(briefs)
}

// POST /api/briefs — Crée un nouveau brief (DRAFT)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const body = await req.json()
  const { storeId } = body

  if (!storeId) {
    return NextResponse.json({ error: "storeId requis" }, { status: 400 })
  }

  // Vérifier que le client est bien lié à ce store
  if (session.user.role === "CLIENT") {
    const userStore = await prisma.userStore.findUnique({
      where: {
        userId_storeId: {
          userId: session.user.id,
          storeId,
        },
      },
    })
    if (!userStore) {
      return NextResponse.json({ error: "Accès non autorisé à ce magasin" }, { status: 403 })
    }
  }

  // Vérifier s'il existe déjà un draft pour ce store/user
  const existingDraft = await prisma.brief.findFirst({
    where: {
      storeId,
      userId: session.user.id,
      status: "DRAFT",
    },
    include: { lines: true, logistics: true },
  })

  if (existingDraft) {
    return NextResponse.json(existingDraft)
  }

  const brief = await prisma.brief.create({
    data: {
      storeId,
      userId: session.user.id,
      status: "DRAFT",
      totalHT: 0,
    },
    include: { lines: true, logistics: true },
  })

  return NextResponse.json(brief, { status: 201 })
}
