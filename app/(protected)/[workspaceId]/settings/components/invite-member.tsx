"use client";

import { FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { inviteMember } from "@/actions/workspace/invite-member";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Card } from "@/components/ui/card";

export function InviteMemberDialog() {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;

  // Fetch pending invitations
  const { data: invitations, refetch } = useQuery({
    queryKey: ["workspace-invitations", workspaceId],
    queryFn: () => fetcher(`/api/workspaces/${workspaceId}/invitations`),
    enabled: !!workspaceId,
  });

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await inviteMember({ workspaceId: workspaceId!, email: email! });
      setEmail("");
      toast.success("Invitation sent successfully");
      refetch(); // Refresh invitations list
    } catch (error: any) {
      toast.error(error.message);
    } 
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your workspace. They'll receive an email with instructions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              id="email"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {/* Pending Invitations Section */}
          {invitations && invitations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Pending Invitations</h3>
              <div className="space-y-2">
                {invitations.map((invitation: any) => (
                  <Card key={invitation.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{invitation.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited {new Date(invitation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await fetch(`/api/workspaces/${workspaceId}/invitations/${invitation.id}`, {
                              method: 'DELETE'
                            });
                            refetch();
                            toast.success("Invitation cancelled");
                          } catch (error) {
                            toast.error("Failed to cancel invitation");
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!email}>
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}