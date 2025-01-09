import { redirect } from "next/navigation";
import { ChannelType } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";

import { db } from "@/lib/db";
import { ChatHeader } from "../../../components/chat/chat-header";
import { ChatMessages } from "../../../components/chat/chat-messages";
import { MediaRoom } from "../../../components/media-room";
import { ChatInput } from "../../../components/chat/chat-input";

interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  }
}

const ChannelIdPage = async ({
  params
}: ChannelIdPageProps) => {
  const profile = await currentProfile();

  const channel = await db.channel.findUnique({
    where: {
      id: params.channelId,
    },
  });

  const member = await db.workspaceMember.findFirst({
    where: {
      serverId: params.serverId,
      userId: profile?.id,
    },
    include: {
      user: true, // Récupère les informations utilisateur liées
    },
  });



  if (!channel || !member) {
    redirect("/");
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121621]">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <div className="flex-1 overflow-y-auto">
            <ChatMessages
              member={member}
              name={channel.name}
              chatId={channel.id}
              type="channel"
              apiUrl="/api/messages"
              socketUrl="/api/socket/messages"
              socketQuery={{
                channelId: channel.id,
                serverId: channel.serverId,
              }}
              paramKey="channelId"
              paramValue={channel.id}
            />
          </div>
          <div className="sticky bottom-4 bg-white dark:bg-[#121621] z-10">
            <ChatInput
              name={channel.name}
              type="channel"
              apiUrl="/api/socket/messages"
              query={{
                channelId: channel.id,
                serverId: channel.serverId,
              }}
            />
          </div>
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom
          chatId={channel.id}
          video={false}
          audio={true}
        />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom
          chatId={channel.id}
          video={true}
          audio={true}
        />
      )}
    </div>
  );
  
}

export default ChannelIdPage;