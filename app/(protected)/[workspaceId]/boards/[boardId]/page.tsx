import { db } from "@/lib/db";
import { BoardNavbar } from "./components/board-navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Settings from "./components/settings-board";
import { BoardContent } from "./components/board-content";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TimelineView } from "./components/timeline-view";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OverviewView } from "./components/overview/overview-view";

interface BoardIdPageProps {
  params: {
    boardId: string;
    workspaceId: string;
  };
}

export async function generateMetadata({ params }: { params: { boardId: string; workspaceId: string } }) {
  const board = await db.board.findUnique({
    where: {
      id: params.boardId,
      workspaceId: params.workspaceId,
    },
  });

  if (!board) {
    return { title: "Board Not Found | MyApp" };
  }

  return { title: `${board.title} - QentFlow` };
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
              tasks: true,
              tags: {
                select: {
                  id: true,
                  name: true,
                  color: true,
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
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
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
    <div className="w-full p-2  h-[calc(100vh-70px)]">
      <Card className="shadow-none rounded-none h-full">
        <main className="relative w-full mx-auto h-full">
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between px-6 pt-6">
              <BoardNavbar board={board} />
            </div>
            <div className="flex w-full items-center gap-4 mb-6 mt-4">
              <Tabs defaultValue="board" className="w-full cursor-pointer">
                <TabsList className="px-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="board">Board</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <Separator />
                <TabsContent value="overview">
                  <OverviewView lists={board.lists} users={board?.User} />
                </TabsContent>
                <TabsContent value="board">
                  <BoardContent users={board.User} boardId={board.id} lists={board.lists} />
                </TabsContent>
                <TabsContent value="timeline">
                  <TimelineView boardId={board.id} data={board.lists} />
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
      </Card>
    </div>
  );
};

export default BoardIdPage;

