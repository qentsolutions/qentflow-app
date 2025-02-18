import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamMembersProps {
  users: any[];
  selectedUserId: string | null;
  onUserSelect: (userId: string | null) => void;
}

export const TeamMembers = ({ users, selectedUserId, onUserSelect }: TeamMembersProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border border-border/50 backdrop-blur-sm">
      <div className="sticky top-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 border-b border-border/50 px-6 py-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Team Members ({filteredUsers.length})</h2>
          <Input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="p-6 space-y-2 max-h-[300px] overflow-y-auto">
        {filteredUsers.map((user: any) => (
          <div
            key={user.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
              "border border-transparent hover:border-border/50 hover:bg-accent",
              selectedUserId === user.id && "bg-accent border-border/50"
            )}
            onClick={() => onUserSelect(selectedUserId === user.id ? null : user.id)}
          >
            <Avatar className="border border-border/50">
              <AvatarImage src={user.image} />
              <AvatarFallback className="bg-primary/5">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};