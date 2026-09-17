import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateUploadPresignedUrl, buildPlanKey } from "@/lib/s3"
import { z } from "zod"

const presignSchema = z.object({
  briefId: z.string().optional(),
  fileName: z.string().min(1),
  contentType: z.string().regex(/^(application\/pdf|image\/.+|application\/octet-stream)$/, {
    message: "Type de fichier non autorisé. PDF et images uniquement.",
  }),
  fileSize: z.number().max(50 * 1024 * 1024, "Le fichier ne peut pas dépasser 50 Mo"),
})

// POST /api/upload/presign — Génère une URL présignée pour upload direct vers MinIO
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const body = await req.json()
  const result = presignSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten() },
      { status: 400 }
    )
  }

  const { briefId, fileName, contentType } = result.data

  try {
    const key = briefId ? buildPlanKey(briefId, fileName) : `attachments/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase()}`
    const uploadUrl = await generateUploadPresignedUrl(key, contentType, 3600)

    // L'URL publique pour récupérer le fichier après upload
    const fileUrl = `${process.env.MINIO_PUBLIC_ENDPOINT}/${process.env.MINIO_BUCKET_NAME}/${key}`

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key,
      expiresIn: 3600,
    })
  } catch (error) {
    console.error("Erreur génération presigned URL:", error)
    return NextResponse.json({ error: "Impossible de générer l'URL d'upload" }, { status: 500 })
  }
}
