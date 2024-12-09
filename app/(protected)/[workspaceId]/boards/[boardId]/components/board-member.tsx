// app/(protected)/[workspaceId]/boards/[boardId]/components/settings/board-members.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { removeUserFromBoard } from "@/actions/boards/remove-user-from-board";
import { useCurrentUser } from "@/hooks/use-current-user";

interface BoardMembersProps {
  boardId: string;
  users: any[];
}

export const BoardMembers = ({ boardId, users }: BoardMembersProps) => {
  const { currentWorkspace } = useCurrentWorkspace();
  const user = useCurrentUser();
  const currentUserRole = currentWorkspace?.members.find(
    (member) => member.user.id === user?.id
  )?.role;

  const isAdminOrOwner = currentUserRole === "ADMIN" || currentUserRole === "OWNER";

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUserFromBoard(userId, boardId);
      toast.success("User removed from board");
    } catch (error) {
      toast.error("Failed to remove user");
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        {users?.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.image} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            {isAdminOrOwner && (
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveUser(user.id)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
