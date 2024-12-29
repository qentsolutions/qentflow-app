// lib/s3.ts
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.NEXT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
});

// lib/s3.ts
export const uploadToS3 = async (file: any, key: string) => {
  // Convertir le File/Blob en Buffer
  let buffer;
  if (file instanceof Blob) {
    buffer = Buffer.from(await file.arrayBuffer());
  } else {
    buffer = file;
  }

  const params = {
    Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type || "application/octet-stream",
    ACL: "public-read",
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};
