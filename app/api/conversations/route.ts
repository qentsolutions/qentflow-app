import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return new NextResponse("Workspace ID is required", { status: 400 });
    }

    // Fetch all conversations for the current user in the workspace
    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          {
            memberOne: {
              userId: user.id,
              workspaceId: workspaceId,
            },
          },
          {
            memberTwo: {
              userId: user.id,
              workspaceId: workspaceId,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            user: true,
          },
        },
        memberTwo: {
          include: {
            user: true,
          },
        },
        directMessages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    // Format conversations for the response
    const formattedConversations = conversations.map((conversation) => {
      const otherMember = 
        conversation.memberOne.userId === user.id
          ? conversation.memberTwo
          : conversation.memberOne;

      return {
        id: conversation.id,
        user: otherMember.user,
        lastMessage: conversation.directMessages[0]?.content || "",
        lastMessageAt: conversation.directMessages[0]?.createdAt || null,
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("[CONVERSATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}