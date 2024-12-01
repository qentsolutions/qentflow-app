import { db } from "@/lib/db";
import { BoardNavbar } from "./components/board-navbar";
import { ListContainer } from "./components/list-container";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Settings from "./components/settings-board";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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
    redirect(`/${params.workspaceId}/board`);
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
    <div className="bg-white w-full">
      <main className="relative w-full h-full mx-auto p-8">
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center gap-x-2 text-lg mb-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${params.workspaceId}/board`}>
                    <span className="text-blue-500">Boards</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BoardNavbar board={board} />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

          </div>

          <div>
            <p className="text-2xl font-bold">{board.title}</p>
          </div>

          <div className="flex w-full items-center gap-4 mb-6 mt-8">
            <Tabs defaultValue="board" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <div className="mt-8"></div>
              <TabsContent value="overview">Overview</TabsContent>
              <TabsContent value="list">List</TabsContent>
              <TabsContent value="board">
                <ListContainer boardId={board?.id} data={board.lists} />
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
