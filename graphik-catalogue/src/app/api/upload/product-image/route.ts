import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateUploadPresignedUrl, buildProductImageKey } from "@/lib/s3"
import { z } from "zod"

const schema = z.object({
  productId: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/, {
    message: "Seules les images sont acceptées (JPG, PNG, WebP)",
  }),
  fileSize: z.number().max(10 * 1024 * 1024, "Max 10 Mo"),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL")
  ) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten() },
      { status: 400 }
    )
  }

  const { productId, fileName, contentType } = result.data

  try {
    const key = buildProductImageKey(productId, fileName)
    const uploadUrl = await generateUploadPresignedUrl(key, contentType, 3600)
    const fileUrl = `${process.env.MINIO_PUBLIC_ENDPOINT}/${process.env.MINIO_BUCKET_NAME}/${key}`

    return NextResponse.json({ uploadUrl, fileUrl, key })
  } catch (error) {
    console.error("Erreur presigned URL image produit:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
