import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { ChatHeader } from "../../../components/chat/chat-header";
import { MediaRoom } from "../../../components/media-room";
import { ChatMessages } from "../../../components/chat/chat-messages";
import { ChatInput } from "../../../components/chat/chat-input";

interface MemberIdPageProps {
  params: {
    memberId: string;
    serverId: string;
  },
  searchParams: {
    video?: boolean;
  }
}

const MemberIdPage = async ({
  params,
  searchParams,
}: MemberIdPageProps) => {
  const user = await currentProfile();


  const currentMember = await db.workspaceMember.findFirst({
    where: {
      serverId: params.serverId,
      userId: user?.id,
    },
    include: {
      user: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(currentMember.id, params.memberId);

  if (!conversation) {
    return redirect(`/conversations/${params.serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.userId === user?.id ? memberTwo : memberOne;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121621]">
      <ChatHeader
        imageUrl={otherMember.user.image || ""}
        name={otherMember.user.name || ""}
        serverId={params.serverId}
        type="conversation"
      />
      {searchParams.video && (
        <MediaRoom
          chatId={conversation.id}
          video={true}
          audio={true}
        />
      )}
      {!searchParams.video && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.user.name || ""}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{
              conversationId: conversation.id,
            }}
          />
          <div className="sticky bottom-4 bg-white dark:bg-[#121621] z-10">
            <ChatInput
              name={otherMember.user.name || ""}
              type="conversation"
              apiUrl="/api/socket/direct-messages"
              query={{
                conversationId: conversation.id,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default MemberIdPage;