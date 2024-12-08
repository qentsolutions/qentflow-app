'use client'

import { useState, useCallback } from "react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, Plus, UserPlus } from 'lucide-react'
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { addUserToBoard } from "@/actions/boards/add-users-to-board"

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
    const { currentWorkspace } = useCurrentWorkspace()
    const [isAdding, setIsAdding] = useState(false)
    const [boardUsers, setBoardUsers] = useState(users || [])

    const workspaceUsers = currentWorkspace?.members?.map(({ user }) => user).filter(Boolean) ?? []

    const handleToggleUser = useCallback(async (user: User) => {
        setIsAdding(true)
        const isCurrentlyInBoard = boardUsers.some(boardUser => boardUser.id === user.id)
        try {
            if (isCurrentlyInBoard) {
                setBoardUsers(prevUsers => prevUsers.filter(u => u.id !== user.id))
                toast.success(`${user.name} removed from board`)
            } else {
                await addUserToBoard(user.id, boardId)
                setBoardUsers(prevUsers => [...prevUsers, user])
                toast.success(`${user.name} added to board`)
            }
        } catch (error) {
            console.error("Failed to update board users:", error)
            toast.error("Failed to update board users")
        } finally {
            setIsAdding(false)
        }
    }, [boardUsers, boardId])

    return (
        <div className="flex items-center mt-4">
            {boardUsers && boardUsers.length > 0 ? (
                <>
                    <div className="flex items-center">
                        {boardUsers.slice(0, 5).map((user, index) => (
                            <Tooltip key={user.id}>
                                <TooltipTrigger>
                                    <Avatar className={`w-8 h-8 ${index > 0 ? '-ml-2' : ''} ring-2 ring-background`}>
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
                                </TooltipTrigger>
                                <TooltipContent>{user.name}</TooltipContent>
                            </Tooltip>
                        ))}


                        {boardUsers.length > 5 && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="w-8 h-8 -ml-2 ring-2 ring-background cursor-pointer">
                                        <div className="bg-gray-300 w-full h-full rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                +{boardUsers.length - 5}
                                            </span>
                                        </div>
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-0">
                                    <ScrollArea className="h-48">
                                        {boardUsers.slice(5).map(user => (
                                            <div key={user.id} className="flex items-center space-x-2 p-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage
                                                        src={user.image || ""}
                                                        alt={user.name || "User"}
                                                        className="w-full h-full object-cover"
                                                    />
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
                            <Button variant="outline" size="sm" className="ml-2">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Manage Users
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56">
                            <ScrollArea className="h-48">
                                {workspaceUsers.map(user => {
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
                                })}
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
