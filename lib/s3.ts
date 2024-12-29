// lib/s3.ts
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.NEXT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
});

interface UploadParams {
  buffer: Buffer;
  key: string;
  contentType: string;
}

export const uploadToS3 = async ({
  buffer,
  key,
  contentType,
}: UploadParams) => {
  const bucketName = process.env.NEXT_AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("NEXT_AWS_S3_BUCKET_NAME is not defined.");
  }

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

export const deleteFromS3 = async (key: string) => {
  const params = {
    Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME!,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};
