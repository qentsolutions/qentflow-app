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
};

export const dynamic = "force-dynamic";

export const BoardList = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

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
            All Boards{" "}
            {boards && (
              <span>
                ({boards?.length > 0 ? <>{boards.length}</> : <>0</>})
              </span>
            )}
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
                    onClick={() => {
                      const handleClick = (e: React.MouseEvent) => {
                        if (!board.isMember) {
                          e.preventDefault();
                          toast.error("You are not a member of this board.");
                          return;
                        }
                        router.push(`/${workspaceId}/boards/${board.id}`);
                      };

                      // Simuler un événement pour `handleClick`
                      const simulatedEvent = { preventDefault: () => {} } as React.MouseEvent;
                      handleClick(simulatedEvent);
                    }}
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
