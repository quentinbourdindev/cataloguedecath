import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id } = await params
  
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: true }
    })
    return NextResponse.json(user)
  } catch(e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
