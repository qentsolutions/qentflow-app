"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { FormPopover } from "@/components/form/form-popover";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

type Board = {
  id: string;
  title: string;
  updatedAt: string;
  isMember: boolean; // Ajout de la propriété isMember
};

export const dynamic = "force-dynamic";

export const BoardList = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;

  const [searchTerm, setSearchTerm] = useState("");

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

  if (error) {
    return <div>Error loading boards. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-sm rounded-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">All Boards {boards && (<span>({boards?.length})</span>)}</CardTitle>
          {workspaceId && (
            <FormPopover sideOffset={10} side="right" workspaceId={String(workspaceId)}>
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
          <div className="space-y-4">
            {isLoading ? (
              <p>Loading boards...</p>
            ) : filteredBoards.length > 0 ? (
              filteredBoards.map((board: Board) => (
                <Link
                  key={board.id}
                  href={`/${workspaceId}/boards/${board.id}`}
                  className={`block ${!board.isMember ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  onClick={(e) => {
                    if (!board.isMember) {
                      e.preventDefault(); // Empêche la navigation si l'utilisateur n'est pas membre
                    }
                  }}
                >
                  <Card className="hover:bg-gray-50 dark:hover:bg-transparent transition duration-300">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${board.id}.png`}
                            alt={board.title}
                          />
                          <AvatarFallback>{board.title.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg text-gray-800 dark:text-white font-semibold">{board.title}</h3>
                        </div>
                      </div>
                      <Button variant="ghost">View Board</Button>
                    </CardContent>
                  </Card>

                </Link>
              ))
            ) : (
              <p>No boards available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
