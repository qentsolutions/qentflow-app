"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ProfilePage = () => {
  const user = useCurrentUser();
  const { currentWorkspace } = useCurrentWorkspace();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              {currentWorkspace?.members.find((m) => m.user.id === user?.id)?.role === "OWNER" && (
                <Badge variant="secondary">Workspace Owner</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Workspaces</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.role}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;

