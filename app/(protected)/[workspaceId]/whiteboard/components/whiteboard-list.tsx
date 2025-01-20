"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";

export function WhiteboardList() {
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState("");

  const { data: whiteboards, refetch } = useQuery({
    queryKey: ["whiteboards", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/whiteboards?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/whiteboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          workspaceId: currentWorkspace?.id,
        }),
      });

      if (!response.ok) throw new Error();

      const whiteboard = await response.json();
      toast.success("Whiteboard created!");
      setIsCreateDialogOpen(false);
      setTitle("");
      refetch();
      router.push(`/${currentWorkspace?.id}/whiteboard/${whiteboard.id}`);
    } catch {
      toast.error("Failed to create whiteboard");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-2xl font-bold">Whiteboards</CardTitle>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Whiteboard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Whiteboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter whiteboard title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Whiteboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {whiteboards?.map((whiteboard: any) => (
            <Card
              key={whiteboard.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/${currentWorkspace?.id}/whiteboard/${whiteboard.id}`)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold">{whiteboard.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(whiteboard.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}