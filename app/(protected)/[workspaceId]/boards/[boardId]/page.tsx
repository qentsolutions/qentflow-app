import { db } from "@/lib/db";
import { BoardNavbar } from "./components/board-navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Settings from "./components/settings-board";
import { BoardContent } from "./components/board-content";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

interface BoardIdPageProps {
  params: {
    boardId: string;
    workspaceId: string;
  };
}

const BoardIdPage = async ({ params }: BoardIdPageProps) => {

  const user = await currentUser();
  const isMember = await db.workspaceMember.findFirst({
    where: {
      workspaceId: params.workspaceId,
      userId: user?.id,
    },
  });

  if (!isMember) {
    redirect(`/${params.workspaceId}/boards`);
  }


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
      User: true,
    },
  });

  if (!board) {
    return <div>Board not found</div>;
  }

  const isBoardMember = board.User.some((boardUser) => boardUser.id === user?.id);

  if (!isBoardMember) {
    redirect(`/${params.workspaceId}/boards`);
  }


  return (
    <div className="bg-white w-full">
      <main className="relative w-full h-full mx-auto p-8">
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between">
            <BoardNavbar board={board} />
          </div>
          <div className="flex w-full items-center gap-4 mb-6 mt-4">
            <Tabs defaultValue="board" className="w-full">
              <TabsList>
                <TabsTrigger value="board">Tasks</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <div className="mt-4"></div>
              <TabsContent value="board">
                <BoardContent users={board.User} boardId={board.id} lists={board.lists} />
              </TabsContent>
              <TabsContent value="settings">
                <Settings
                  boardId={board.id}
                  boardTitle={board.title}
                  users={board.User}
                  createdById={board.createdById}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BoardIdPage;

