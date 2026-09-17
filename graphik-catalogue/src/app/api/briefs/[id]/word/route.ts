import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType } from "docx"

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

  const clientName = [brief.user.firstName, brief.user.lastName].filter(Boolean).join(" ") || brief.user.email

  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "GRAPHIK", bold: true, size: 32 }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: new Date(brief.updatedAt).toLocaleDateString("fr-FR"), color: "737373", size: 24 }),
              ],
            }),
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200, before: 400 },
              children: [
                new TextRun({ text: `Devis ${brief.store.name}`, size: 48 }),
              ],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun({ text: `Réf: ${brief.id.slice(-8).toUpperCase()}`, color: "737373", size: 24 }),
              ],
            }),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200, before: 200 },
              children: [
                new TextRun({ text: "Informations Client", size: 28 }),
              ],
            }),
            new Paragraph({ children: [new TextRun({ text: brief.store.name })] }),
            new Paragraph({ children: [new TextRun({ text: `${clientName} (${brief.user.email})` })] }),
            ...(brief.logistics?.contactPhone ? [new Paragraph({ children: [new TextRun({ text: `Tél: ${brief.logistics.contactPhone}` })] })] : []),
            ...(brief.logistics?.requestedDeliveryWeek ? [new Paragraph({ children: [new TextRun({ text: `Livraison: ${brief.logistics.requestedDeliveryWeek}` })] })] : []),

            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200, before: 400 },
              children: [
                new TextRun({ text: "Prestations", size: 28 }),
              ],
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "Désignation", alignment: AlignmentType.LEFT })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                    new TableCell({ children: [new Paragraph({ text: "Dimensions", alignment: AlignmentType.CENTER })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                    new TableCell({ children: [new Paragraph({ text: "Quantité", alignment: AlignmentType.CENTER })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                    new TableCell({ children: [new Paragraph({ text: "Total HT", alignment: AlignmentType.RIGHT })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  ],
                  tableHeader: true,
                }),
                ...brief.lines.map((line: any) => 
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: line.customName || line.product?.name || "Prestation", alignment: AlignmentType.LEFT })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                      new TableCell({ children: [new Paragraph({ text: line.width && line.height ? `${line.width}m x ${line.height}m` : "—", alignment: AlignmentType.CENTER })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                      new TableCell({ children: [new Paragraph({ text: String(line.quantity), alignment: AlignmentType.CENTER })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                      new TableCell({ children: [new Paragraph({ text: `${line.totalPriceHT.toFixed(2)} €`, alignment: AlignmentType.RIGHT })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                    ],
                  })
                ),
              ],
            }),

            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 400 },
              children: [
                new TextRun({ text: "Total HT Estimé : ", size: 28, bold: true }),
                new TextRun({ text: `${brief.totalHT.toFixed(2)} €`, size: 32, bold: true }),
              ],
            }),
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)
    const filename = `devis-${brief.store.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Erreur génération Word:", error)
    return new NextResponse("Erreur lors de la génération du Word", { status: 500 })
  }
}
