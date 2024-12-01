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
};

export const dynamic = "force-dynamic";

export const BoardList = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;

  // State pour l'input de recherche
  const [searchTerm, setSearchTerm] = useState("");

  // Utilisation de React Query pour gérer les données
  const { data: boards, isLoading, error } = useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () =>
      workspaceId
        ? fetcher(`/api/boards?workspaceId=${workspaceId}`)
        : Promise.resolve([]),
    enabled: !!workspaceId, // Ne pas exécuter tant que workspaceId n'est pas défini
  });

  // Filtrer les boards en fonction de la recherche, en vérifiant que `boards` est bien un tableau
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
      <Card className="bg-white shadow-sm rounded-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Boards</CardTitle>
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
              className="pl-10"
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
                  href={`/${workspaceId}/board/${board.id}`}
                  className="block"
                >
                  <Card className="hover:bg-gray-50 transition duration-300">
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
                          <h3 className="text-lg font-semibold text-gray-800">{board.title}</h3>
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
