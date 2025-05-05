"use client";

import { type FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, PlusCircle, X } from "lucide-react";
import { toast } from "sonner";
import { inviteMember } from "@/actions/workspace/invite-member";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { revokeInvitation } from "@/actions/workspace/invitations/revoke-invitation";

export function InviteMemberDialog() {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;
  const queryClient = useQueryClient();

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      await revokeInvitation(workspaceId!, invitationId);
      queryClient.invalidateQueries({
        queryKey: ["workspace-invitations", workspaceId],
      });
      toast.success("Invitation cancelled");
    } catch (error) {
      toast.error("Failed to cancel invitation");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary dark:bg-blue-400 dark:text-white hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your workspace. They&apos;ll receive an email with instructions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Pending Invitations Section */}
          {invitations && invitations.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Pending Invitations</h3>
                <Badge variant="outline" className="text-xs font-normal">
                  {invitations.length} pending
                </Badge>
              </div>

              <ScrollArea className="max-h-[240px] pr-4">
                <div className="space-y-2">
                  {invitations.map((invitation: any, index: number) => (
                    <motion.div
                      key={invitation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden border border-border/50 hover:border-border transition-all duration-200">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Mail className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{invitation.email}</p>
                                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {formatDate(invitation.createdAt)}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                              onClick={() => cancelInvitation(invitation.id)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cancel invitation</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!email} className="bg-primary hover:bg-primary/90">
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
