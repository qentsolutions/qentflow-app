import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { ModeToggle } from "../mode-toggle";

export const NavigationSidebar = async () => {
  const profile = await currentProfile();

  if (!profile) {
    return null; // Arrêtez l'exécution du composant si le profil n'est pas trouvé
  }

  const servers = await db.server.findMany({
    where: {
      workspaceMembers: {
        some: {
          userId: profile.id
        }
      }
    }
  });

  return (
    <div
      className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3"
    >
      <Separator
        className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto"
      />
      <ScrollArea className="flex-1 w-full">
        {/* Utilisez Link pour envelopper le texte "Server List" */}
        <Link href="/servers/test">
          Server List
        </Link>
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
      </div>
    </div>
  );
};
