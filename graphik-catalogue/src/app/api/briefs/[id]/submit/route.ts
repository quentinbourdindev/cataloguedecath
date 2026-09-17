import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { briefLogisticsFullSchema } from "@/lib/validations"
import { sendBriefSubmittedEmail } from "@/lib/email"

type Params = { params: Promise<{ id: string }> }

// POST /api/briefs/[id]/submit — Soumet le brief (CLIENT seulement)
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const { id: briefId } = await params
  const body = await req.json()

  // Valider les données logistiques complètes
  const result = briefLogisticsFullSchema.safeParse(body.logistics)
  if (!result.success) {
    return NextResponse.json(
      { error: "Données logistiques incomplètes", details: result.error.flatten() },
      { status: 400 }
    )
  }

  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    include: {
      store: true,
      user: { select: { firstName: true, lastName: true, email: true } },
      lines: true,
    },
  })

  if (!brief) return NextResponse.json({ error: "Brief introuvable" }, { status: 404 })
  if (brief.userId !== session.user.id)
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
  if (brief.status !== "DRAFT" && brief.status !== "REVIEWING")
    return NextResponse.json({ error: "Ce brief ne peut pas être soumis" }, { status: 400 })
  if (brief.lines.length === 0)
    return NextResponse.json({ error: "Le panier est vide" }, { status: 400 })

  const {
    contactName,
    contactEmail,
    contactPhone,
    unloadingDock,
    handlingEquipment,
    requestedDeliveryWeek,
    installationByGraphik,
    requestedInstallationDate,
    uploadedPlanUrl,
    uploadedPlanName,
  } = result.data

  // Transaction : mettre à jour la logistique + passer en SUBMITTED
  await prisma.$transaction(async (tx) => {
    await tx.briefLogistics.upsert({
      where: { briefId },
      create: {
        briefId,
        contactName,
        contactEmail,
        contactPhone,
        unloadingDock,
        handlingEquipment,
        requestedDeliveryWeek,
        installationByGraphik,
        requestedInstallationDate: requestedInstallationDate
          ? new Date(requestedInstallationDate)
          : null,
        uploadedPlanUrl,
        uploadedPlanName: uploadedPlanName ?? null,
      },
      update: {
        contactName,
        contactEmail,
        contactPhone,
        unloadingDock,
        handlingEquipment,
        requestedDeliveryWeek,
        installationByGraphik,
        requestedInstallationDate: requestedInstallationDate
          ? new Date(requestedInstallationDate)
          : null,
        uploadedPlanUrl,
        uploadedPlanName: uploadedPlanName ?? null,
      },
    })

    await tx.brief.update({
      where: { id: briefId },
      data: { status: "SUBMITTED" },
    })
  })

  // Envoi de l'email à l'équipe Graphik
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/admin/briefs/${briefId}`
  const clientName =
    [brief.user.firstName, brief.user.lastName].filter(Boolean).join(" ") || brief.user.email

  await sendBriefSubmittedEmail({
    briefId,
    storeName: brief.store.name,
    clientName,
    clientEmail: brief.user.email,
    totalHT: brief.totalHT,
    requestedDeliveryWeek,
    dashboardUrl,
  }).catch(console.error) // Ne pas bloquer si l'email échoue

  return NextResponse.json({ success: true, status: "SUBMITTED" })
}
