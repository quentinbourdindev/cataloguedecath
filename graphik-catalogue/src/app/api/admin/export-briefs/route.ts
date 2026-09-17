import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as xlsx from "xlsx"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  try {
    const briefs = await prisma.brief.findMany({
      where: {
        status: { not: "DRAFT" },
      },
      include: {
        store: true,
        user: true,
        lines: { include: { product: true } },
        logistics: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    const rows: any[] = []

    for (const brief of briefs) {
      const clientName = [brief.user.firstName, brief.user.lastName].filter(Boolean).join(" ") || brief.user.email
      const date = new Date(brief.updatedAt).toLocaleDateString("fr-FR")
      const statusLabel = brief.status

      if (brief.lines.length === 0) {
        // Devise vide mais on le met quand même
        rows.push({
          "ID Devis": brief.id,
          "Date": date,
          "Statut": statusLabel,
          "Magasin": brief.store.name,
          "Code Magasin": brief.store.id,
          "Contact Projet": brief.logistics?.contactName ?? clientName,
          "Email": brief.user.email,
          "Semaine Livraison": brief.logistics?.requestedDeliveryWeek ?? "",
          "Pose Graphik": brief.logistics?.installationByGraphik ? "Oui" : "Non",
          "Quai Déchargement": brief.logistics?.unloadingDock ? "Oui" : "Non",
          "Prestation": "Aucune ligne",
          "Largeur (m)": "",
          "Hauteur (m)": "",
          "Quantité": 0,
          "Total HT (Ligne)": 0,
        })
        continue
      }

      for (const line of brief.lines) {
        rows.push({
          "ID Devis": brief.id,
          "Date": date,
          "Statut": statusLabel,
          "Magasin": brief.store.name,
          "Code Magasin": brief.store.id,
          "Contact Projet": brief.logistics?.contactName ?? clientName,
          "Email": brief.user.email,
          "Semaine Livraison": brief.logistics?.requestedDeliveryWeek ?? "",
          "Pose Graphik": brief.logistics?.installationByGraphik ? "Oui" : "Non",
          "Quai Déchargement": brief.logistics?.unloadingDock ? "Oui" : "Non",
          "Prestation": line.customName || line.product?.name || "Prestation",
          "Option": line.selectedOption || "",
          "Largeur (m)": line.width ?? "",
          "Hauteur (m)": line.height ?? "",
          "Quantité": line.quantity,
          "Total HT (Ligne)": line.totalPriceHT,
        })
      }
    }

    const worksheet = xlsx.utils.json_to_sheet(rows)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Commandes")

    // Ajustement de la largeur des colonnes
    worksheet["!cols"] = [
      { wch: 30 }, // ID
      { wch: 12 }, // Date
      { wch: 15 }, // Statut
      { wch: 25 }, // Magasin
      { wch: 15 }, // Code Magasin
      { wch: 20 }, // Contact
      { wch: 25 }, // Email
      { wch: 20 }, // Semaine Livraison
      { wch: 15 }, // Pose Graphik
      { wch: 15 }, // Quai Déchargement
      { wch: 40 }, // Prestation
      { wch: 15 }, // Option
      { wch: 12 }, // Largeur
      { wch: 12 }, // Hauteur
      { wch: 10 }, // Quantité
      { wch: 15 }, // Total HT
    ]

    const buf = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="export-commandes.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Erreur Export Excel:", error)
    return new NextResponse("Erreur lors de l'export", { status: 500 })
  }
}
