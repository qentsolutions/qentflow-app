// lib/s3.ts
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  region: process.env.NEXT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (file: File, key: string) => {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  
  const params = {
    Bucket: process.env.NEXT_AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: fileBuffer,
    ContentType: file.type,
    ACL: 'public-read',
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
