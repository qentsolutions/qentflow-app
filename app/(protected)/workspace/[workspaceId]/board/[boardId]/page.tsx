import { db } from "@/lib/db";
import { BoardNavbar } from "./components/board-navbar";
import { ListContainer } from "./components/list-container";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateTagForm from "./components/create-tag-form";

interface BoardIdPageProps {
  params: {
    boardId: string;
    workspaceId: string;
  };
}

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  const user = await currentUser();

  const isUserMember = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: params.workspaceId,
        userId: user?.id ?? '',
      },
    },
  });

  // Si l'utilisateur n'est pas membre du workspace, retournez une page d'erreur
  if (!isUserMember) {
    // redirect to board
    redirect(`/workspace/${params.workspaceId}/board`);
  }

  // Récupérer les données du board
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
    },
  });

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <div className="bg-white mt-8">
      <main className="relative  h-full mx-auto p-8">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-x-2 text-lg font-semibold mb-6">
            <div className="flex items-center gap-2">
              <Link href={`/workspace/${params.workspaceId}/board`}>
                <span className="text-blue-500">Boards</span>
              </Link>
              <span className="text-neutral-400">/</span>
              <BoardNavbar board={board} />
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-700">Timeline:</span>
              <span className="text-sm">Nov 14, 2024 - Dec 14 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-700">Assignees:</span>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <Tabs defaultValue="board">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>
              <div className="mt-8"></div>
              <CreateTagForm boardId={board.id} />
              <TabsContent value="overview">Overview</TabsContent>
              <TabsContent value="list">List</TabsContent>
              <TabsContent value="board">
                <div className="overflow-x-auto">
                  <ListContainer boardId={board?.id} data={board.lists} />
                </div>
              </TabsContent>
              <TabsContent value="timeline">Timeline</TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BoardIdPage;
