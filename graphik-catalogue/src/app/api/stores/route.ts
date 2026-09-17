import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { storeSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const stores = await prisma.store.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(stores)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const body = await req.json()
  const result = storeSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const store = await prisma.store.create({ data: result.data })
  return NextResponse.json(store, { status: 201 })
}
