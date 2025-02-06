import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

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
    <Card className="h-[30.5vh] overflow-y-auto relative">
      <div className="sticky top-0  px-4 pt-4 pb-1 z-10 bg-white border-b">
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg font-semibold">Board Members ({filteredUsers.length})</p>
          <input
            type="text"
            placeholder="Search by name..."
            className="p-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2 px-4 pt-2">
        {filteredUsers.map((user: any) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer ${selectedUserId === user.id ? 'bg-accent' : ''
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
