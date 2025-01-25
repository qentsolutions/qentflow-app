import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users } from "lucide-react";
import Image from "next/image";

interface BoardCardProps {
  board: {
    id: string;
    title: string;
    creator: {
      id: string;
      name: string;
      imageUrl: string;
    };
    memberCount: number;
    createdAt: string;
    isMember: boolean;
    image: string;
  };
  onClick: (e: React.MouseEvent) => void;
}

export const BoardCard = ({ board, onClick }: BoardCardProps) => {

  return (
    <Card
      onClick={onClick}
      className={`group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden ${!board.isMember ? "opacity-50 cursor-not-allowed" : ""
        }`}
    >
      <div className="relative">
        {/* Board preview background */}
        <div className="h-24 bg-gradient-to-br from-blue-500/10 to-blue-500/10 flex justify-center items-center">
          {/* Miniature board preview */}
          {board.image ? (
            <div className="relative w-full h-full">
              <Image
                src={board.image}
                alt={board.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <p></p>
          )}
        </div>

        {/* Board info */}
        <div className="p-4">
          <div className="flex items-center gap-x-2">
            <h3 className="font-medium group-hover:text-blue-600 text-sm transition-colors">{board.title}</h3>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {/* Affichage du créateur */}
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-10 w-10 border-2 border-white">
                    {/* Vérification si l'image du créateur existe */}
                    {board.creator.imageUrl ? (
                      <AvatarImage
                        src={board.creator.imageUrl}
                        alt={board.creator.name}
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-200">
                        {board.creator.name?.charAt(0).toUpperCase()} {/* Affichage de l'initiale du nom */}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-sm">{board.creator.name}</span>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center text-xs text-gray-500">
              <Users className="h-3 w-3 mr-1" />
              {board.memberCount > 1 ? (
                <p>{board.memberCount} members</p>
              ) : (
                <p>{board.memberCount} member</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
