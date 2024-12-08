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
import BoardUsers from "./components/board-users"; // Assurez-vous que le chemin est correct

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  // Logique serveur pour récupérer `board` (comme dans votre code existant)
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
          <div className="flex items-center justify-between">
            <BoardNavbar board={board} />
          </div>
          <div className="flex">
            <BoardUsers users={board.User} boardId={board.id} />
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

