"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ChatConversation } from "./chat-conversation";
import { cn } from "@/lib/utils";
import { useSocket } from "@/app/(protected)/[workspaceId]/conversations/components/providers/socket-provider";

export const PersistentChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    const { currentWorkspace } = useCurrentWorkspace();
    const currentUser = useCurrentUser();
    const { socket, isConnected } = useSocket();

    const { data: conversations } = useQuery({
        queryKey: ["conversations", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/conversations?workspaceId=${currentWorkspace?.id}`),
        enabled: !!currentWorkspace?.id,
    });

    // Gestion des nouveaux messages
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewMessage = (message: any) => {
            console.log("New message received:", message); // Debug log
            
            if (selectedConversation?.id !== message.conversationId) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [message.conversationId]: (prev[message.conversationId] || 0) + 1,
                }));
            }
        };

        // Écouter les événements de message pour chaque conversation
        conversations?.forEach((conversation: any) => {
            const channelKey = `chat:${conversation.id}:messages`;
            socket.on(channelKey, handleNewMessage);
        });

        return () => {
            // Nettoyer les écouteurs lors du démontage
            conversations?.forEach((conversation: any) => {
                const channelKey = `chat:${conversation.id}:messages`;
                socket.off(channelKey, handleNewMessage);
            });
        };
    }, [socket, isConnected, conversations, selectedConversation]);

    const handleSelectConversation = (conversation: any) => {
        setSelectedConversation(conversation);
        // Réinitialiser le compteur pour la conversation sélectionnée
        setUnreadCounts((prev) => ({
            ...prev,
            [conversation.id]: 0,
        }));
    };

    // Calculer le nombre total de conversations avec des messages non lus
    const totalUnreadConversations = Object.values(unreadCounts).filter(count => count > 0).length;

    return (
        <div className="fixed bottom-0 right-8 flex items-end space-x-2 z-50">
            <div
                className={cn(
                    "bg-background border rounded-t-lg shadow-lg transition-all duration-200 ease-in-out",
                    isOpen
                        ? isExpanded
                            ? "h-screen w-[600px]"
                            : "h-[500px] w-[400px]"
                        : "h-10 w-32"
                )}
            >
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between p-3 border-b cursor-pointer text-primary-foreground"
                >
                    <button className="flex items-center text-black">
                        <MessageCircle size={14} className="mr-2" />
                        <span className="text-sm font-medium">Messages</span>
                        {totalUnreadConversations > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {totalUnreadConversations}
                            </span>
                        )}
                    </button>
                    <div className="flex items-center space-x-2 text-black">
                        {isOpen && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(!isExpanded);
                                    }}
                                    className="hover:bg-primary-foreground/10 rounded p-1"
                                >
                                    {isExpanded ? (
                                        <Minimize2 className="h-4 w-4" />
                                    ) : (
                                        <Maximize2 className="h-4 w-4" />
                                    )}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        if (selectedConversation) setSelectedConversation(null);
                                    }}
                                    className="hover:bg-primary-foreground/10 rounded p-1"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[calc(100%-48px)]"
                        >
                            {selectedConversation ? (
                                <ChatConversation
                                    conversationId={selectedConversation.id}
                                    otherUser={selectedConversation.user}
                                    onClose={() => setSelectedConversation(null)}
                                />
                            ) : (
                                <ScrollArea className="h-full">
                                    {conversations?.map((conversation: any) => (
                                        <div
                                            key={conversation.id}
                                            onClick={() => handleSelectConversation(conversation)}
                                            className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer border-b"
                                        >
                                            <Avatar>
                                                <AvatarImage src={conversation.user.image} />
                                                <AvatarFallback>
                                                    {conversation.user.name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">
                                                    {conversation.user.name}
                                                    {unreadCounts[conversation.id] > 0 && (
                                                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                            {unreadCounts[conversation.id]}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conversation.lastMessage || "No messages yet"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </ScrollArea>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};