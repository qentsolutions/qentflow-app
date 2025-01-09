import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface ServerIdPageProps {
  params: {
    serverId: string;
  }
};

const ServerIdPage = async ({
  params
}: ServerIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      workspaceMembers: {
        some: {
          userId: profile.id,
        }
      }
    },
    include: {
      channels: {
        where: {
          name: "general"
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  })

  const initialChannel = server?.channels[0];

  if (initialChannel?.name !== "general") {
    return null;
  }

  return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`)
}

export default ServerIdPage;