
"use client";

import { Fragment, useRef, ElementRef, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, ServerCrash, X } from "lucide-react";

import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

import { ChatWelcome } from "@/app/(protected)/[workspaceId]/conversations/components/chat/chat-welcome";
import { ChatItem } from "@/app/(protected)/[workspaceId]/conversations/components/chat/chat-item";
import { ChatInput } from "@/app/(protected)/[workspaceId]/conversations/components/chat/chat-input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface ChatConversationProps {
    conversationId: string;
    otherUser: any;
    onClose: () => void;
}

export const ChatConversation = ({
    conversationId,
    otherUser,
    onClose
}: ChatConversationProps) => {
    const queryKey = `chat:${conversationId}`;
    const addKey = `chat:${conversationId}:messages`;
    const updateKey = `chat:${conversationId}:messages:update`;

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
        apiUrl: "/api/direct-messages",
        paramKey: "conversationId",
        paramValue: conversationId,
    });

    useChatSocket({ queryKey, addKey, updateKey });
    useChatScroll({
        chatRef,
        bottomRef,
        loadMore: fetchNextPage,
        shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
        count: data?.pages?.[0]?.items?.length ?? 0,
    });

    useEffect(() => {
        const scrollToBottom = () => {
            if (bottomRef.current) {
                bottomRef.current.scrollIntoView({ behavior: "smooth" });
            }
        };

        // Scroll au chargement initial et à chaque nouveau message
        scrollToBottom();

        // Observer les changements dans les données
        if (data?.pages) {
            scrollToBottom();
        }
    }, [data?.pages]);

    if (status === "error") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Something went wrong!
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#121621]">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src={otherUser.image} />
                        <AvatarFallback>{otherUser.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{otherUser.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X size={18} />
                </Button>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4">
                {!hasNextPage && <ChatWelcome name={otherUser.name} type="conversation" />}
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
                            {group.items.map((message: any) => (
                                <ChatItem
                                    key={message.id}
                                    id={message.id}
                                    currentMember={message.workspaceMembers}
                                    member={message.workspaceMembers}
                                    content={message.content}
                                    fileUrl={message.fileUrl}
                                    deleted={message.deleted}
                                    timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                                    isUpdated={message.updatedAt !== message.createdAt}
                                    socketUrl="/api/socket/direct-messages"
                                    socketQuery={{
                                        conversationId: conversationId,
                                    }}
                                />
                            ))}
                        </Fragment>
                    ))}
                </div>
                <div ref={bottomRef} />
            </div>
            <ChatInput
                name={otherUser.name}
                type="conversation"
                apiUrl="/api/socket/direct-messages"
                query={{ conversationId }}
            />
        </div>
    );
};
