import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { userSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { email: "asc" },
    include: {
      stores: { include: { store: { select: { id: true, name: true } } } },
    },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const body = await req.json()
  const result = userSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides", details: result.error.flatten() }, { status: 400 })
  }

  const { email, firstName, lastName, role, storeIds } = result.data

  // Créer ou mettre à jour l'utilisateur
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, firstName, lastName, role },
    update: { firstName, lastName, role },
  })

  // Associer les stores (pour les clients)
  if (storeIds && storeIds.length > 0 && role === "CLIENT") {
    // Supprimer les associations existantes
    await prisma.userStore.deleteMany({ where: { userId: user.id } })

    // Recréer les associations
    await prisma.userStore.createMany({
      data: storeIds.map((storeId) => ({ userId: user.id, storeId })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json(user, { status: 201 })
}
