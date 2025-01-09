import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import { InitialModal } from "./components/modals/initial-modal";

const SetupPage = async () => {
  const profile = await initialProfile();


  const server = await db.server.findFirst({
    where: {
      workspace: {
        members: {
          some: {
            userId: profile.id
          }
        }
      }
    },
    include: {
      workspace: true
    }
  });

  if (server) {
    return redirect(`/${server.workspaceId}/conversations/${server.id}`);
  }

  return <InitialModal />;
}

export default SetupPage;