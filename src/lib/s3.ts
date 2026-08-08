import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3 = new S3Client({ region: process.env.S3_REGION })

export async function getPresignedUploadUrl(key: string, contentType: string, expiresSeconds = 900) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(s3, command, { expiresIn: expiresSeconds })
  return url
}

export function getS3Client() {
  return s3
}
