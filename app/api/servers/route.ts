import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db.server.create({
      data: {
        userId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: "general", userId: profile.id }],
        },
        workspaceMembers: {
          create: [
            { userId: profile.id, role: UserRole.OWNER, workspaceId: "cm5ojiadz0003879nrkws7pnd" },
          ],
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
