import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMembersProps {
  users: any[];
  selectedUserId: string | null;
  onUserSelect: (userId: string | null) => void;
}

export const TeamMembers = ({ users, selectedUserId, onUserSelect }: TeamMembersProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-lg font-semibold">Board Members ({users.length})</p>
      </div>
      <div className="space-y-4">
        {users.map((user: any) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer ${
              selectedUserId === user.id ? 'bg-accent' : ''
            }`}
            onClick={() => onUserSelect(selectedUserId === user.id ? null : user.id)}
          >
            <Avatar>
              <AvatarImage src={user.image} />
              <AvatarFallback>
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
