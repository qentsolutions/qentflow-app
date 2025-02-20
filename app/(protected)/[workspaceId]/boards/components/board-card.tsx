import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Users } from "lucide-react"
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
  return (
    <TooltipProvider>
      <Card
        onClick={onClick}
        className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] ${!board.isMember
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          }`}
      >
        <div className="relative">
          {/* Board preview background */}
          <div className="relative h-32 w-full overflow-hidden">
            {board.image ? (
              <img
                src={board.image || "/placeholder.svg"}
                alt={board.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                <span className="text-2xl font-medium text-neutral-600">
                  {board.title.charAt(0)}
                </span>
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          {/* Board info */}
          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between">
              <h3 className="line-clamp-2 font-medium tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-700">
                {board.title}
              </h3>

            </div>
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6 ring-2 ring-white">
                      {board.creator.imageUrl ? (
                        <AvatarImage
                          src={board.creator.imageUrl}
                          alt={board.creator.name}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-neutral-100 text-sm font-medium text-neutral-600">
                          {board.creator.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-neutral-900 text-white">
                  <p className="text-sm">{board.creator.name}</p>
                </TooltipContent>
              </Tooltip>
              <div className="ml-2 flex items-center space-x-1 rounded-full bg-neutral-100 px-2 py-1">
                <Users className="h-3 w-3 text-neutral-600" />
                <span className="text-xs font-medium text-neutral-600">
                  {board.memberCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  )
}