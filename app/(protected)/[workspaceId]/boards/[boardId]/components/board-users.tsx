'use client'

import { useState } from "react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { UserX } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"

interface User {
  id: string
  name: string | null
  image: string | null
}

interface BoardUsersProps {
  users: User[] | undefined
  boardId: string
  onUserSelect?: (userId: string) => void
  selectedUser?: string | null
}

const BoardUsers: React.FC<BoardUsersProps> = ({ users, boardId, onUserSelect, selectedUser }) => {
  const [boardUsers, setBoardUsers] = useState(users ?? [])

  const displayedUsers = boardUsers.slice(0, 5)
  const remainingUsers = boardUsers.slice(5)

  return (
    <div className="flex items-center ml-4">
      {boardUsers.length > 0 ? (
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger>
              <Avatar
                className={`w-8 h-8 ring-2 ring-background cursor-pointer ${selectedUser === "unassigned" ? 'ring-blue-500' : ''} hover:ring-blue-500 transition-all duration-200`}
                onClick={() => onUserSelect?.("unassigned")}
              >
                <div className="bg-gray-200 w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:z-10">
                  <UserX className="w-4 h-4 text-gray-500" />
                </div>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>Not Assigned {selectedUser === "unassigned" && "(Filtered)"}</TooltipContent>
          </Tooltip>

          {displayedUsers.map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger>
                <Avatar
                  className={`w-8 h-8 -ml-2 ring-2 ring-background cursor-pointer ${selectedUser === user.id ? 'ring-blue-500' : ''} hover:ring-blue-500 transition-all duration-200`}
                  onClick={() => onUserSelect?.(user.id)}
                >
                  <div className="bg-gray-200 w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:z-10">
                    {user?.image ? (
                      <AvatarImage src={user?.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-gray-500">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                {user.name} {selectedUser === user.id && "(Filtered)"}
              </TooltipContent>
            </Tooltip>
          ))}

          {remainingUsers.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="w-8 h-8 -ml-2 ring-2 ring-background cursor-pointer">
                  <div className="bg-gray-300 w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:z-10">
                    <span className="text-sm font-medium text-gray-700">+{remainingUsers.length}</span>
                  </div>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <ScrollArea className="h-48">
                  {remainingUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100">
                      <Avatar className="h-6 w-6">
                        <div className="bg-gray-200 w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                          {user?.image ? (
                            <AvatarImage src={user?.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium text-gray-500">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}
        </div>
      ) : (
        <p>No users in this board.</p>
      )}
    </div>
  )
}

export default BoardUsers
