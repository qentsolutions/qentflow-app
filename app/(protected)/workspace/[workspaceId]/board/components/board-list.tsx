"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, Clock } from 'lucide-react';
import { FormPopover } from "@/components/form/form-popover";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Board = {
  id: string;
  title: string;
  updatedAt: string;
};

export const dynamic = 'force-dynamic';


export const BoardList = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;

  useEffect(() => {
    if (!workspaceId) return;

    const fetchBoards = async () => {
      try {
        const response = await fetch(`/api/boards?workspaceId=${workspaceId}`, {
          method: "GET",
        });
        if (!response.ok) throw new Error("Failed to fetch boards");
        const data = await response.json();
        const sortedBoards = data.sort((a: Board, b: Board) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setBoards(sortedBoards);
      
      } catch (error) {
        console.error("Error fetching boards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [workspaceId]);

  const isToday = (date: string) => {
    const today = new Date();
    const givenDate = new Date(date);
    return (
      today.getDate() === givenDate.getDate() &&
      today.getMonth() === givenDate.getMonth() &&
      today.getFullYear() === givenDate.getFullYear()
    );
  };

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
            <Input className="pl-10" placeholder="Search boards" />
          </div>
          <div className="space-y-4">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/workspace/${workspaceId}/board/${board.id}`}
                className="block"
              >
                <Card className="hover:bg-gray-50 transition duration-300">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://avatar.vercel.sh/${board.id}.png`} alt={board.title} />
                        <AvatarFallback>{board.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{board.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Last updated:{" "}
                          {isToday(board.updatedAt)
                            ? new Date(board.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true, 
                            })
                            : new Date(board.updatedAt).toLocaleDateString('en-US')}
                        </p>

                      </div>
                    </div>
                    <Button variant="ghost">View Board</Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};