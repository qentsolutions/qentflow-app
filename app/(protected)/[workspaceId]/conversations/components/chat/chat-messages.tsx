"use client";

import { Fragment, useRef, useEffect, ElementRef } from "react";
import { format } from "date-fns";
import { WorkspaceMember, Message, User } from "@prisma/client";
import { Loader2, ServerCrash } from "lucide-react";

import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatWelcome } from "./chat-welcome";
import { ChatItem } from "./chat-item";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

type MessageWithMemberWithProfile = Message & {
  workspaceMembers: WorkspaceMember & {
    user: User;
  };
};

interface ChatMessagesProps {
  name: string;
  member: WorkspaceMember;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

export const ChatMessages = ({
  name,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  const currentUser = useCurrentUser();
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;

  const chatRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useChatQuery({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
  });

  useChatSocket({ queryKey, addKey, updateKey });

  // Effect to scroll to bottomRef when a new message is added
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  if (status === "error") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea>
      <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
        {!hasNextPage && <div className="flex-1" />}
        {!hasNextPage && (
          <ChatWelcome
            type={type}
            name={name}
          />
        )}
        {hasNextPage && (
          <div className="flex justify-center">
            {isFetchingNextPage ? (
              <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
            ) : (
              <button
                onClick={() => fetchNextPage()}
                className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
              >
                Load previous messages
              </button>
            )}
          </div>
        )}
        <div className="flex flex-col-reverse mt-auto">
          {data?.pages?.map((group, i) => (
            <Fragment key={i}>
              {group.items.map((message: MessageWithMemberWithProfile) => {
                return (
                  <ChatItem
                    key={message.id}
                    id={message.id}
                    currentMember={member}
                    member={message.workspaceMembers}
                    content={message.content}
                    fileUrl={message.fileUrl}
                    deleted={message.deleted}
                    timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                    isUpdated={message.updatedAt !== message.createdAt}
                    socketUrl={socketUrl}
                    socketQuery={socketQuery}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
