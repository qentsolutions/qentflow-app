"use client";

import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { removeUserFromBoard } from "@/actions/boards/remove-user-from-board";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCallback, useState } from "react";
import { addUserToBoard } from "@/actions/boards/add-users-to-board";
import { UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { createNotification } from "@/actions/notifications/create-notification";

interface BoardMembersProps {
  boardId: string;
  users: any[];
  createdById: string;
  boardTitle: string;
}

export const BoardMembers = ({ boardId, users, createdById, boardTitle }: BoardMembersProps) => {
  const { currentWorkspace } = useCurrentWorkspace();
  const currentUser = useCurrentUser();
  const [isAdding, setIsAdding] = useState(false);
  const [boardUsers, setBoardUsers] = useState(users);
  const [isOpen, setIsOpen] = useState(false);

  const workspaceUsers = currentWorkspace?.members?.map(({ user }) => user).filter(Boolean) ?? [];
  const availableUsers = workspaceUsers.filter(
    user => !boardUsers.some(boardUser => boardUser.id === user.id)
  );

  const isCreator = currentUser?.id === createdById;

  const handleAddUser = useCallback(
    async (user: any) => {
      setIsAdding(true);
      try {
        await addUserToBoard(user.id, boardId);
        setBoardUsers((prevUsers) => [...prevUsers, user]);
        await createNotification(
          user?.id,
          currentWorkspace?.id || "",
          `${currentUser?.name} added you in the board : ${boardTitle} `
        )
        toast.success(`${user.name} added to board`);
      } catch (error) {
        console.error("Failed to update board users:", error);
        toast.error("Failed to update board users");
      } finally {
        setIsAdding(false);
      }
    },
    [boardId]
  );

  const handleRemoveUser = async (userId: string) => {
    if (!isCreator) {
      toast.error("Only the board creator can remove members");
      return;
    }

    try {
      await removeUserFromBoard(userId, boardId);
      setBoardUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      toast.success("User removed from board");
    } catch (error) {
      toast.error("Failed to remove user");
    }
  };

  return (
    <div className="p-6">
      {isCreator && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Board Members</h2>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Board Members</DialogTitle>
                <DialogDescription>
                  Add members from your workspace to this board.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="mt-4 max-h-[60vh]">
                <div className="space-y-2 pr-4">
                  {availableUsers.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No available users to add
                    </div>
                  ) : (
                    availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg transition-colors",
                          "hover:bg-slate-100 dark:hover:bg-gray-700 group cursor-pointer"
                        )}
                        onClick={() => handleAddUser(user)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.image || ""} />
                            <AvatarFallback>
                              {user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          Add
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="space-y-4">
        {boardUsers.map((user) => (
          <div
            key={user.id}
            className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 dark:border-gray-600 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarImage src={user?.image} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  {user.id === createdById && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Creator
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            {isCreator && user.id !== createdById && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRemoveUser(user.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
