import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendBriefReviewingEmail } from "@/lib/email"

type Params = { params: Promise<{ id: string }> }

// POST /api/briefs/[id]/review — Renvoie le brief pour correction (COMMERCIAL/ADMIN)
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "COMMERCIAL" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id: briefId } = await params

  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    include: {
      store: true,
      user: { select: { email: true, firstName: true, lastName: true } },
    },
  })

  if (!brief) return NextResponse.json({ error: "Brief introuvable" }, { status: 404 })

  await prisma.brief.update({
    where: { id: briefId },
    data: { status: "REVIEWING" },
  })

  // Notifier le client
  const clientName =
    [brief.user.firstName, brief.user.lastName].filter(Boolean).join(" ") || brief.user.email

  const catalogueUrl = `${process.env.NEXTAUTH_URL}/catalogue`
  await sendBriefReviewingEmail({
    clientEmail: brief.user.email,
    clientName,
    storeName: brief.store.name,
    catalogueUrl,
  }).catch(console.error)

  return NextResponse.json({ success: true, status: "REVIEWING" })
}
