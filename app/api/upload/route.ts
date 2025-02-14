import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { uploadToS3 } from "@/lib/s3";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const workspaceId = formData.get("workspaceId") as string;
    const documentId = formData.get("documentId") as string;

    if (!file || !workspaceId || !documentId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new NextResponse("Only image files are allowed", { status: 400 });
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return new NextResponse("File size too large", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `documents/${workspaceId}/${documentId}/${Date.now()}-${
      file.name
    }`;

    const url = await uploadToS3({
      buffer,
      key,
      contentType: file.type,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
