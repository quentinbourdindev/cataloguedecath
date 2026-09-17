import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { renderToStream } from "@react-pdf/renderer"
import { BriefPDF } from "@/components/pdf/brief-pdf"
import React from "react"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const { id } = await params

  const brief = await prisma.brief.findUnique({
    where: { id },
    include: {
      store: true,
      user: true,
      lines: { include: { product: true }, orderBy: { createdAt: "asc" } },
      logistics: true,
    },
  })

  if (!brief) {
    return new NextResponse("Brief introuvable", { status: 404 })
  }

  // Vérification des droits d'accès
  if (session.user.role === "CLIENT" && brief.userId !== session.user.id) {
    return new NextResponse("Accès refusé", { status: 403 })
  }

  try {
    const pdfElement = React.createElement(BriefPDF, { brief }) as React.ReactElement<any>
    const stream = await renderToStream(pdfElement)
    const filename = `devis-${brief.store.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Erreur génération PDF:", error)
    return new NextResponse("Erreur lors de la génération du PDF", { status: 500 })
  }
}
