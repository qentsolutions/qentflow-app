"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, KanbanSquare } from "lucide-react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { BoardCard } from "./board-card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { boardTemplates } from "@/constants/board-templates";
import { CreateBoardModal } from "@/components/modals/create-board-modal";

export const dynamic = "force-dynamic";

export const BoardList = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  useEffect(() => {
    document.title = "Boards - QentFlow";
  }, []);

  const { data: boards, isLoading, error } = useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () =>
      workspaceId
        ? fetcher(`/api/boards?workspaceId=${workspaceId}`)
        : Promise.resolve([]),
    enabled: !!workspaceId,
  });

  const filteredBoards = Array.isArray(boards)
    ? boards.filter((board: any) =>
      board.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // Tri des boards ouverts en fonction de `isMember`
  const openBoards = filteredBoards.filter(board => board.isMember);

  // Gérer les clics sur les boards
  const handleBoardClick = (board: any) => {
    if (!board.isMember) {
      toast.error("You are not a member of this board.");
      return;
    }
    router.push(`/${workspaceId}/boards/${board.id}`);
  };

  // Introduire un délai avant d'afficher "No boards available"
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsFirstLoad(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (error) {
    return <div>Error loading boards. Please try again later.</div>;
  }

  return (
    <div className="py-4 bg-gray-50 h-screen">
      <Card className="shadow-sm rounded-md w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            <div className="flex items-center mb-4 gap-x-2">
              Boards
              <span
                className={`flex items-center justify-center text-base font-semibold bg-blue-500 text-white rounded-full ${(openBoards?.length || 0) > 99
                  ? "w-12 h-12 text-sm" // Pour les nombres à 3 chiffres ou plus
                  : (openBoards?.length || 0) > 9
                    ? "w-10 h-10 text-sm" // Pour les nombres à 2 chiffres
                    : "w-6 h-6 text-base" // Pour les nombres à 1 chiffre
                  }`}
              >
                {openBoards?.length || 0}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {boardTemplates.map((template) => (
                  <CarouselItem key={template.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5">
                    <div
                      className={`
                          aspect-[16/10] relative group
                          ${template.id === "blank"
                          ? "bg-white"
                          : "bg-gradient-to-br from-blue-50 to-indigo-50"} 
                          rounded-lg border-2 border-dashed border-gray-200 
                          hover:border-blue-500 transition-all duration-200
                          flex flex-col items-center justify-center cursor-pointer
                          p-4 overflow-hidden
                        `}
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        setIsCreateBoardModalOpen(true);
                      }}
                    >
                      <div className="text-2xl mb-2">
                        {template.icon}
                      </div>
                      <p className="text-sm text-center font-medium text-gray-600 group-hover:text-gray-900">
                        {template.title}
                      </p>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute top-1/2 -left-2 transform -translate-y-1/2 bg-white hover:bg-gray-300 rounded-full p-2 shadow-md" />
              <CarouselNext className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-white hover:bg-gray-300 rounded-full p-2 shadow-md" />
            </Carousel>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10 mt-4"
              placeholder="Search boards"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading || isFirstLoad
            ? Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-56 rounded-md bg-gray-200 dark:bg-gray-700"
              />
            ))
            : openBoards.length > 0
              ? openBoards.map((board: any) => (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                  <BoardCard
                    key={board.id}
                    board={board}
                    onClick={() => handleBoardClick(board)}
                  />
                </div>
              ))
              : (
                <div className="text-center py-10 w-full bg-gray-50">
                  <KanbanSquare className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-muted-foreground">No boards found</p>
                </div>
              )}
        </CardContent>
      </Card>

      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        workspaceId={workspaceId || ""}
        templateId={selectedTemplateId}
      />
    </div >
  );
};