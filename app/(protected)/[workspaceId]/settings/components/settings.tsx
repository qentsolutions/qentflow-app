"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { updateWorkspace } from "@/actions/workspace";
import { deleteWorkspace } from "@/actions/workspace/delete-workspace";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/use-current-user";

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
});

export default function SettingsWorkspace() {
  const { currentWorkspace, setCurrentWorkspace } = useCurrentWorkspace();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const currentUser = useCurrentUser();

  const isAdminOrOwner =
    currentWorkspace?.members.find(
      (member) => member.user.id === currentUser?.id
    )?.role === "ADMIN" || currentWorkspace?.members.find(
      (member) => member.user.id === currentUser?.id
    )?.role === "OWNER";
  const form = useForm<z.infer<typeof UpdateWorkspaceSchema>>({
    resolver: zodResolver(UpdateWorkspaceSchema),
    defaultValues: {
      name: currentWorkspace?.name || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof UpdateWorkspaceSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    if (!currentWorkspace) return;

    const result = await updateWorkspace({
      ...values,
      workspaceId: currentWorkspace.id,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.workspace) {
      setCurrentWorkspace({
        ...result.workspace,
        members: currentWorkspace.members,
        createdAt: result.workspace.createdAt.toISOString(),
      });
      setSuccess("Workspace updated successfully!");
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace) return;

    const result = await deleteWorkspace({ workspaceId: currentWorkspace.id });

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(result.success);
    setCurrentWorkspace(null);

    // Redirect to the dashboard
    window.location.href = "/";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Workspace</CardTitle>
          <CardDescription>Change your workspace settings here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={currentWorkspace?.name}
                        disabled={!isAdminOrOwner || form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Logo</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={!isAdminOrOwner}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default" className="border-green-500 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isAdminOrOwner || form.formState.isSubmitting}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Permanently delete your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your workspace, there is no going back. Please be certain.
          </p>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={!isAdminOrOwner}
              >
                Delete Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your
                  workspace and remove all associated data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => {
                  handleDeleteWorkspace();
                  setIsDeleteDialogOpen(false);
                }}>
                  Delete Workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

