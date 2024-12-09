"use client";

import { useQuery } from "@tanstack/react-query";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { addUserToBoard } from "@/actions/boards/add-users-to-board";
import { PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface BoardMembersProps {
  boardId: string;
  users: any[];
  createdById: string;
}

export const BoardMembers = ({ boardId, users, createdById }: BoardMembersProps) => {
  const { currentWorkspace } = useCurrentWorkspace();
  const currentUser = useCurrentUser();
  const [email, setEmail] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);

  const isCreator = currentUser?.id === createdById;

  const handleRemoveUser = async (userId: string) => {
    if (!isCreator) {
      toast.error("Only the board creator can remove members");
      return;
    }

    try {
      await removeUserFromBoard(userId, boardId);
      toast.success("User removed from board");
    } catch (error) {
      toast.error("Failed to remove user");
    }
  };

  const handleAddMember = async () => {
    if (!isCreator) {
      toast.error("Only the board creator can add members");
      return;
    }

    try {
      setIsAddingMember(true);
      await addUserToBoard(email, boardId);
      toast.success("User added to board");
      setEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add user");
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <div className="p-6">
      {isCreator && (
        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member</DialogTitle>
                <DialogDescription>
                  Add a new member to this board by their email address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    placeholder="Enter member's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddMember}
                  disabled={isAddingMember || !email}
                >
                  {isAddingMember ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

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
            {isCreator && user.id !== createdById && (
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveUser(user.id)}
              >
                Remove
              </Button>
            )}
            {user.id === createdById && (
              <Badge variant="secondary">Creator</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};