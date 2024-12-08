'use client'

import { useState, useCallback } from "react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, Plus, UserPlus, X, Loader2 } from 'lucide-react'
import { toast } from "sonner"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { addUserToBoard } from "@/actions/boards/add-users-to-board"
import { removeUserFromBoard } from "@/actions/boards/remove-user-from-board"

interface User {
    id: string
    name: string | null
    image: string | null
}

interface BoardUsersProps {
    users: User[] | undefined
    boardId: string
}

const BoardUsers: React.FC<BoardUsersProps> = ({ users, boardId }) => {
    if (!users) {
        return null;
    }
    const { currentWorkspace } = useCurrentWorkspace()
    const [isAdding, setIsAdding] = useState(false)
    const [boardUsers, setBoardUsers] = useState(users)
    const [showAllUsers, setShowAllUsers] = useState(false)

    const workspaceUsers = currentWorkspace?.members?.map(({ user }) => user).filter(Boolean) ?? []

    const handleToggleUser = useCallback(async (user: User) => {
        setIsAdding(true)
        const isCurrentlyInBoard = boardUsers?.some(boardUser => boardUser.id === user.id) ?? false
        try {
            if (isCurrentlyInBoard) {
                await removeUserFromBoard(user.id, boardId)
                setBoardUsers(prevUsers => prevUsers.filter(u => u.id !== user.id))
                toast.success(`${user.name} removed from board`)
            } else {
                await addUserToBoard(user.id, boardId)
                setBoardUsers(prevUsers => [...prevUsers, user])
                toast.success(`${user.name} added to board`)
            }
        } catch (error) {
            console.error("Failed to update board users:", error)
            toast.error(`Failed to update board users`)
        } finally {
            setIsAdding(false)
        }
    }, [boardUsers, boardId])

    const displayedUsers = boardUsers?.slice(0, 5) ?? []
    const remainingUsers = boardUsers?.slice(5) ?? []

    return (
        <div className="flex items-center ml-4">
            {boardUsers && boardUsers.length > 0 ? (
                <>
                    <div className="flex items-center">
                        {displayedUsers.map((user, index) => (
                            <Tooltip key={user.id}>
                                <TooltipTrigger>
                                    <Avatar className={`w-8 h-8 ${index !== 0 ? '-ml-2' : ''} ring-2 ring-background`}>
                                        <div className="bg-gray-200 w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:z-10">
                                            {user.image ? (
                                                <AvatarImage
                                                    src={user.image}
                                                    alt={user.name || "User"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-500">
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </span>
                                            )}
                                        </div>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>{user.name}</TooltipContent>
                            </Tooltip>
                        ))}
                        {remainingUsers.length > 0 && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="w-8 h-8 -ml-2 ring-2 ring-background cursor-pointer">
                                        <div className="bg-gray-300 w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out hover:scale-110 hover:z-10">
                                            <span className="text-sm font-medium text-gray-700">
                                                +{remainingUsers.length}
                                            </span>
                                        </div>
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-0">
                                    <ScrollArea className="h-48">
                                        {remainingUsers.map((user) => (
                                            <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100">
                                                <Avatar className="h-6 w-6">
                                                    <div className="bg-gray-200 w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                                                        {user.image ? (
                                                            <AvatarImage
                                                                src={user.image}
                                                                alt={user.name || "User"}
                                                                className="w-full h-full object-cover"
                                                            />
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

                    <Popover>
                        <PopoverTrigger asChild>
                            <Avatar className="w-8 h-8 -ml-2 ring-2 ring-background cursor-pointer">
                                <div className="bg-gray-300 w-full h-full rounded-full flex items-center justify-center">
                                    <Plus className="h-4 w-4 text-gray-700" />
                                </div>
                            </Avatar>
                        </PopoverTrigger>
                        <PopoverContent className="w-56">
                            <ScrollArea>
                                {workspaceUsers.length === 0 ? (
                                    <div className="flex items-center justify-center text-gray-500">
                                        No users to add
                                    </div>
                                ) : (
                                    workspaceUsers.map(user => {
                                        const isInBoard = boardUsers.some(boardUser => boardUser.id === user.id)
                                        return (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleToggleUser(user)}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className={`w-8 h-8 ring-2 ring-background`}>
                                                        {user.image ? (
                                                            <AvatarImage
                                                                src={user.image}
                                                                alt={user.name || "User"}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm flex items-center justify-center w-full h-full bg-gray-200 font-medium text-gray-500 rounded-full">
                                                                {user.name
                                                                    ?.split(" ")
                                                                    .slice(0, 2)
                                                                    .map(part => part.charAt(0).toUpperCase())
                                                                    .join("") || "U"}
                                                            </span>
                                                        )}
                                                    </Avatar>
                                                    <span className="text-sm">{user.name}</span>
                                                </div>
                                                {isInBoard && <Check className="h-4 w-4 text-green-500" />}
                                            </div>
                                        )
                                    })
                                )}
                            </ScrollArea>
                        </PopoverContent>

                    </Popover>
                </>
            ) : (
                <p>No users in this board.</p>
            )}
        </div>
    )
}

export default BoardUsers

