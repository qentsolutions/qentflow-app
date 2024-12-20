import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Users } from "lucide-react";

interface BoardCardProps {
  board: {
    id: string;
    title: string;
    creator: {
      id: string;
      name: string;
      imageUrl: string; // Assurez-vous que cette propriété existe
    };
    memberCount: number;
    createdAt: string;
    isMember: boolean; // Nouvelle propriété pour indiquer si l'utilisateur est membre
  };
  onClick: (e: React.MouseEvent) => void;
}

export const BoardCard = ({ board, onClick }: BoardCardProps) => {
  // Vérification si createdAt est une date valide
  const createdAtDate = new Date(board.createdAt);
  const formattedDate = isNaN(createdAtDate.getTime()) ? 'Invalid date' : format(createdAtDate, "MMM d, yyyy");

  return (
    <Card
      onClick={onClick}
      className={`group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden ${!board.isMember ? "opacity-50 cursor-not-allowed" : ""
        }`}
    >
      <div className="relative">
        {/* Board preview background */}
        <div className="h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4">
          {/* Miniature board preview */}
          <div className="flex gap-2 transform scale-[0.6] origin-top-left">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`https://avatar.vercel.sh/${board.id}.png`}
                alt={board.title}
              />
              <AvatarFallback>{board.title.charAt(0)}</AvatarFallback>
            </Avatar>
            {[1, 2, 3].map((column) => (
              <div
                key={column}
                className="w-24 mt-16 bg-white/90 dark:bg-gray-800/90 rounded p-2 shadow-sm"
              >
                <div className="text-[8px] font-medium mb-2">List {column}</div>
                {[1, 2].map((card) => (
                  <div
                    key={card}
                    className="bg-gray-50 dark:bg-gray-700 rounded p-1 mb-1"
                  >
                    <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Board info */}
        <div className="p-4">
          <div className="flex items-center gap-x-2">
            <h3 className="font-medium group-hover:text-blue-600 transition-colors">
              {board.title}
            </h3>
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
                        {board.creator.name?.charAt(0).toUpperCase()} {/* Affichage de l'initiale du nom du créateur */}
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
                <p> {board.memberCount} members</p>
              ) : (
                <p> {board.memberCount} member</p>
              )}

            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Created {formattedDate}
          </div>
        </div>
      </div>
    </Card>
  );
};
