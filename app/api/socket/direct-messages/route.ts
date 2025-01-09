import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const profile = await currentUser();
    const { content, fileUrl } = await req.json();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID missing", { status: 400 });
    }

    if (!content) {
      return new NextResponse("Content missing", { status: 400 });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOne: {
              userId: profile.id,
            },
          },
          {
            memberTwo: {
              userId: profile.id,
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
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const member =
      conversation.memberOne.userId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    const message = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        conversationId: conversationId,
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

    const channelKey = `chat:${conversationId}:messages`;

    const io = (global as any).io;
    if (io) {
      io.emit(channelKey, message);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { directMessageId: string } }
) {
  try {
    const user = await currentUser();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID missing", { status: 400 });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOne: {
              userId: user.id,
            },
          },
          {
            memberTwo: {
              userId: user.id,
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
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const member =
      conversation.memberOne.userId === user.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    const message = await db.directMessage.findFirst({
      where: {
        id: params.directMessageId,
        conversationId,
      },
      include: {
        workspaceMembers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = message.workspaceMemberId === member.id;
    const isAdmin = member.role === "ADMIN";
    const isOwner = member.role === "OWNER";
    const canModify = isMessageOwner || isAdmin || isOwner;

    if (!canModify) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deletedMessage = await db.directMessage.update({
      where: {
        id: params.directMessageId,
      },
      data: {
        fileUrl: null,
        content: "This message has been deleted.",
        deleted: true,
      },
      include: {
        workspaceMembers: {
          include: {
            user: true,
          },
        },
      },
    });

    const updateKey = `chat:${conversationId}:messages:update`;

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.emit(updateKey, deletedMessage);
    }

    return NextResponse.json(deletedMessage);
  } catch (error) {
    console.log("[MESSAGE_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { directMessageId: string } }
) {
  try {
    const user = await currentUser();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const { content } = await req.json();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!conversationId) {
      return new NextResponse("Conversation ID missing", { status: 400 });
    }

    if (!content) {
      return new NextResponse("Content missing", { status: 400 });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOne: {
              userId: user.id,
            },
          },
          {
            memberTwo: {
              userId: user.id,
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
      },
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const member =
      conversation.memberOne.userId === user.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    const message = await db.directMessage.findFirst({
      where: {
        id: params.directMessageId,
        conversationId,
      },
      include: {
        workspaceMembers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const isMessageOwner = message.workspaceMemberId === member.id;

    if (!isMessageOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedMessage = await db.directMessage.update({
      where: {
        id: params.directMessageId,
      },
      data: {
        content,
      },
      include: {
        workspaceMembers: {
          include: {
            user: true,
          },
        },
      },
    });

    const updateKey = `chat:${conversationId}:messages:update`;

    // Emit socket event
    const io = (global as any).io;
    if (io) {
      io.emit(updateKey, updatedMessage);
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.log("[MESSAGE_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
