import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const { content, fileUrl } = body;
    const searchParams = req.nextUrl.searchParams;
    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID missing", { status: 400 });
    }

    if (!content) {
      return new NextResponse("Content missing", { status: 400 });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId,
        workspaceMembers: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        workspaceMembers: true,
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId,
        serverId,
      },
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    const member = server.workspaceMembers.find(
      (member) => member.userId === user.id
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId,
        workspaceMemberId: member.id,
      },
      include: {
        workspaceMembers: {
          include: {
            user: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`;

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.emit(channelKey, message);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
