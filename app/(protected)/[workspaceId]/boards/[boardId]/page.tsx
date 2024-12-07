import { db } from "@/lib/db";
import { BoardNavbar } from "./components/board-navbar";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Settings from "./components/settings-board";
import { BoardContent } from "./components/board-content";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BoardIdPageProps {
  params: {
    boardId: string;
    workspaceId: string;
  };
}

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  const user = await currentUser();

  // Vérifie si l'utilisateur est membre du workspace
  const isUserMember = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: params.workspaceId,
        userId: user?.id ?? '',
      },
    },
  });

  if (!isUserMember) {
    redirect(`/${params.workspaceId}/boards`);
  }

  // Vérifie si l'utilisateur fait partie du board
  const isUserInBoard = await db.board.findFirst({
    where: {
      id: params.boardId,
      workspaceId: params.workspaceId,
      User: {
        some: {
          id: user?.id,
        },
      },
    },
  });

  if (!isUserInBoard) {
    redirect(`/${params.workspaceId}/boards`);
  }

  // Récupère les informations du board, y compris les utilisateurs
  const board = await db.board.findUnique({
    where: {
      id: params.boardId,
      workspaceId: params.workspaceId,
    },
    include: {
      lists: {
        include: {
          cards: {
            include: {
              tags: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
      User: true, // Inclut les utilisateurs associés au board
    },
  });

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <div className="bg-white w-full">
      <main className="relative w-full h-full mx-auto p-8">
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center gap-x-2 text-lg mb-2">
            <div className="flex space-x-2">
              {board.User.map((user) => (
                <div className="flex space-x-2">
                  {board.User.map((user) => (
                    <Tooltip>
                      <TooltipTrigger>
                        <Avatar key={user.id}>
                          <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                            {user.image ? (
                              <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
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
                </div>

              ))}
            </div>
          </div>

          <div>
            <BoardNavbar board={board} />
          </div>

          <div className="flex w-full items-center gap-4 mb-6 mt-8">
            <Tabs defaultValue="board" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="board">Tasks</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <div className="mt-4"></div>
              <TabsContent value="overview">Overview</TabsContent>
              <TabsContent value="list">List</TabsContent>
              <TabsContent value="board">
                <BoardContent boardId={board.id} lists={board.lists} />
              </TabsContent>
              <TabsContent value="timeline">Timeline</TabsContent>
              <TabsContent value="settings">
                <Settings boardId={board.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BoardIdPage;


