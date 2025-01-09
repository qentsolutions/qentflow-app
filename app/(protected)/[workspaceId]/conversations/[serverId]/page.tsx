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
    },
    include: {
      workspace: true, // Inclure le workspace pour obtenir workspaceId
      channels: {
        where: {
          name: "general",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!server) {
    return new NextResponse("Server not found", { status: 404 });
  }

  // Récupérer le workspaceId du serveur
  const workspaceId = server.workspace.id;

  const initialChannel = server.channels[0];

  if (initialChannel?.name !== "general") {
    return null;
  }

  // Rediriger vers la page des conversations en utilisant le workspaceId et le serverId
  return redirect(`/${workspaceId}/conversations/${params.serverId}/channels/${initialChannel.id}`);
};

export default ServerIdPage;
