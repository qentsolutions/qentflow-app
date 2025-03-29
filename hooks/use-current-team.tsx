"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "./use-current-workspace";

interface Team {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  isDefault: boolean;
  members: {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
  }[];
  boards: any[];
}

interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  setCurrentTeam: (team: Team | null) => void;
  isLoading: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { currentWorkspace } = useCurrentWorkspace();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: teams = [] } = useQuery({
    queryKey: ["teams", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/teams/${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  useEffect(() => {
    if (teams.length > 0 && !currentTeam) {
      // Si aucune équipe n'est sélectionnée, sélectionner l'équipe par défaut
      const defaultTeam =
        teams.find((team: Team) => team.isDefault) || teams[0];
      setCurrentTeam(defaultTeam);
    }
    setIsLoading(false);
  }, [teams, currentTeam]);

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        teams,
        setCurrentTeam,
        isLoading,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useCurrentTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useCurrentTeam must be used within a TeamProvider");
  }
  return context;
}
