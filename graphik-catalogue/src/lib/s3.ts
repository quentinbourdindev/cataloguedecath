import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT!,
  region: process.env.MINIO_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true, // Requis pour MinIO
})

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME ?? "graphik-plans"

/**
 * Génère une URL présignée pour upload direct depuis le navigateur
 */
export async function generateUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Génère une URL présignée pour téléchargement sécurisé
 */
export async function generateDownloadPresignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })
  return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Supprime un fichier du bucket
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })
  await s3Client.send(command)
}

/**
 * Construit la clé S3 pour un plan de brief
 */
export function buildPlanKey(briefId: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `briefs/${briefId}/plans/${timestamp}_${sanitized}`
}

/**
 * Construit la clé S3 pour une image de produit
 */
export function buildProductImageKey(productId: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
  return `products/${productId}/images/${timestamp}_${sanitized}`
}

export { BUCKET_NAME }
