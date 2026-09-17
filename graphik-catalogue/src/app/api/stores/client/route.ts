import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const storeSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  city: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await req.json()
    const result = storeSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }

    const { name, city } = result.data

    // Générer un ID unique basé sur le nom
    const storeId = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now()

    // Transaction : Créer le magasin ET le lier au client
    const newStore = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          id: storeId,
          name,
          city,
        },
      })

      await tx.userStore.create({
        data: {
          userId: session.user.id,
          storeId: store.id,
        },
      })

      return store
    })

    return NextResponse.json(newStore, { status: 201 })
  } catch (error) {
    console.error("Erreur création magasin client:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
