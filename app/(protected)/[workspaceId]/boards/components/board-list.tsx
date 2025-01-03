"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { FormPopover } from "@/components/form/form-popover";
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

type Board = {
  id: string;
  title: string;
  updatedAt: string;
  isMember: boolean;
  creator: {
    id: string;
    name: string;
    imageUrl: string;
  };
  memberCount: number;
  createdAt: string;
  image: string;
};

export const dynamic = "force-dynamic";

export const BoardList = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [recentlyOpened, setRecentlyOpened] = useState<Board[]>([]);

  const { data: boards, isLoading, error } = useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () =>
      workspaceId
        ? fetcher(`/api/boards?workspaceId=${workspaceId}`)
        : Promise.resolve([]),
    enabled: !!workspaceId,
  });

  const filteredBoards = Array.isArray(boards)
    ? boards.filter((board: Board) =>
      board.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // Gestion des boards récemment ouverts dans localStorage, spécifique à un workspace
  useEffect(() => {
    if (workspaceId) {
      const storedBoards = localStorage.getItem(`recentlyOpenedBoards_${workspaceId}`);
      if (storedBoards) {
        setRecentlyOpened(JSON.parse(storedBoards));
      }
    }
  }, [workspaceId]);

  // Mettre à jour localStorage quand un board est ouvert
  const handleBoardClick = (board: Board) => {
    if (!board.isMember) {
      toast.error("You are not a member of this board.");
      return;
    }

    // Mettre à jour les boards récemment ouverts dans localStorage
    const updatedRecentlyOpened = [board, ...recentlyOpened.filter(b => b.id !== board.id)].slice(0, 2); // Limiter à 5 boards
    setRecentlyOpened(updatedRecentlyOpened);
    if (workspaceId) {
      localStorage.setItem(`recentlyOpenedBoards_${workspaceId}`, JSON.stringify(updatedRecentlyOpened));
    }

    router.push(`/${workspaceId}/boards/${board.id}`);
  };

  // Introduire un délai avant d'afficher "No boards available"
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsFirstLoad(false), 500); // 500 ms de délai
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (error) {
    return <div>Error loading boards. Please try again later.</div>;
  }

  return (
    <div className="py-8 h-screen">
      <Card className="shadow-sm rounded-md w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            <div className="flex items-center mb-4 gap-x-2">
              Boards
              <span
                className={`flex items-center justify-center text-base font-semibold bg-blue-500 text-white rounded-full ${(boards?.length || 0) > 99
                  ? "w-12 h-12 text-sm" // Pour les nombres à 3 chiffres ou plus
                  : (boards?.length || 0) > 9
                    ? "w-10 h-10 text-sm" // Pour les nombres à 2 chiffres
                    : "w-6 h-6 text-base" // Pour les nombres à 1 chiffre
                  }`}
              >
                {boards?.length || 0}
              </span>
            </div>
          </CardTitle>
          {workspaceId && (
            <FormPopover
              sideOffset={10}
              side="right"
              workspaceId={String(workspaceId)}
            >
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create New Board
              </Button>
            </FormPopover>
          )}
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10 mt-4"
              placeholder="Search boards"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Recently Opened Section */}
          {recentlyOpened.length > 0 ? (
            <div className="mb-6">
              <p className="text-lg font-semibold mb-4">Recently Opened</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentlyOpened.length > 0
                  ? recentlyOpened.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onClick={() => handleBoardClick(board)}
                    />
                  ))
                  : <p>No recently opened boards.</p>}
              </div>
            </div>
          ) : (
            <></>
          )}

          <p className="text-lg font-semibold mb-4">All Boards</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading || isFirstLoad
              ? Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-56 rounded-md bg-gray-200 dark:bg-gray-700"
                />
              ))
              : filteredBoards.length > 0
                ? filteredBoards.map((board: any) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onClick={() => handleBoardClick(board)}
                  />
                ))
                : (
                  <p>No boards available</p>
                )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
