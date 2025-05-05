"use client"

import type React from "react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Users, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BoardCardProps {
  board: {
    id: string
    title: string
    creator: {
      id: string
      name: string
      imageUrl: string
    }
    memberCount: number
    createdAt: string
    isMember: boolean
    image: string
  }
  onClick: (e: React.MouseEvent) => void
}

export const BoardCard = ({ board, onClick }: BoardCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const formattedDate = new Date(board.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  return (
    <TooltipProvider>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          onClick={onClick}
          className={cn(
            "relative overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-background transition-all duration-300",
            board.isMember ? "cursor-pointer shadow-sm hover:shadow-lg" : "cursor-not-allowed opacity-60",
          )}
        >
          {/* Board preview background */}
          <div className="relative">
            <div className="relative h-36 w-full overflow-hidden">
              {board.image ? (
                <motion.img
                  src={board.image || "/placeholder.svg?height=144&width=300"}
                  alt={board.title}
                  className={cn(
                    "h-full w-full object-cover transition-all duration-500",
                    isHovered && board.isMember && "scale-110 blur-[1px]",
                  )}
                  whileHover={{ scale: board.isMember ? 1.02 : 1 }}
                  whileTap={{ scale: board.isMember ? 0.98 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100">
                  <span className="text-4xl font-semibold text-indigo-500">{board.title.charAt(0).toUpperCase()}</span>
                </div>
              )}

              {/* Overlay gradient */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent transition-opacity duration-300",
                  isHovered && board.isMember ? "opacity-100" : "opacity-0",
                )}
              />

              {/* Hover effect overlay */}
              {board.isMember && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-indigo-500/10 backdrop-blur-sm transition-opacity duration-300",
                    isHovered ? "opacity-100" : "opacity-0",
                  )}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: isHovered ? 1 : 0.8,
                      opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="rounded-full bg-background px-4 py-2 font-medium text-indigo-600 shadow-md"
                  >
                    Open Project
                  </motion.div>
                </div>
              )}

              {/* Status badge */}
              {!board.isMember && (
                <div className="absolute right-3 top-3">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    No Access
                  </Badge>
                </div>
              )}
            </div>

            {/* Board info */}
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between">
                <h3 className="line-clamp-1 font-medium text-neutral-900 dark:text-gray-400 transition-colors group-hover:text-neutral-700">
                  {board.title}
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-7 w-7 ring-2 ring-white">
                        {board.creator.imageUrl ? (
                          <AvatarImage src={board.creator.imageUrl} alt={board.creator.name} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-indigo-100 text-sm font-medium text-indigo-600">
                            {board.creator.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-neutral-900 text-white">
                      <p className="text-sm">Created by {board.creator.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <div className="flex items-center space-x-1 rounded-full bg-neutral-100 dark:bg-gray-800 px-2 py-1">
                    <Users className="h-3 w-3 text-neutral-600" />
                    <span className="text-xs font-medium text-neutral-600">{board.memberCount}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  )
}
