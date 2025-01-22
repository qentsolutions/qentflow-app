"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserWorkspaces } from "@/actions/workspace";
import { UserRole } from "@prisma/client";

interface User {
  name: string | null;
  id: string;
  email: string | null;
  image: string | null; // Modifier de `string | undefined` à `string | null`
}

interface Member {
  user: User;
  role: UserRole;
}

interface Workspace {
  id: string;
  name: string;
  logo: string | null;
  createdAt: string;
  members: Member[];
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace | null) => void;  // Modification ici
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const { workspaces: loadedWorkspaces, error } = await getUserWorkspaces();
        if (loadedWorkspaces && !error) {
          setWorkspaces(loadedWorkspaces);

          const workspaceId = params?.workspaceId as string;
          const currentWs = loadedWorkspaces.find(w => w.id === workspaceId) || loadedWorkspaces[0];
          setCurrentWorkspace(currentWs || null);

          if (loadedWorkspaces.length === 0) {
            router.push("/workspace/select");
          }
        }
      } catch (error) {
        console.error("Error loading workspaces:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, [params?.workspaceId, router]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        setCurrentWorkspace,
        isLoading
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useCurrentWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useCurrentWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}