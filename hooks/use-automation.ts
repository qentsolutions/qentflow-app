import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrentWorkspace } from "./use-current-workspace";
import { create } from "zustand";

interface UseAutomationOptions {
  workspaceId: string;
  boardId?: string;
}

interface AutomationStore {
  selectedTemplate: string | null;
  setSelectedTemplate: (id: string | null) => void;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
}

export const useAutomationStore = create<AutomationStore>((set) => ({
  selectedTemplate: null,
  setSelectedTemplate: (id) => set({ selectedTemplate: id }),
  isCreating: false,
  setIsCreating: (value) => set({ isCreating: value }),
}));

export const useAutomation = ({
  workspaceId,
  boardId,
}: UseAutomationOptions) => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  // Récupérer les automatisations
  const { data: automations, isLoading } = useQuery({
    queryKey: ["automations", workspaceId, boardId],
    queryFn: async () => {
      const url = boardId
        ? `/api/automations/${workspaceId}?boardId=${boardId}`
        : `/api/automations/${workspaceId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch automations");
      return response.json();
    },
    enabled: !!workspaceId,
  });

  // Créer une automatisation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/automations/${workspaceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create automation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["automations", workspaceId, boardId],
      });
      toast.success("Automation created successfully");
    },
    onError: () => {
      toast.error("Failed to create automation");
    },
  });

  // Mettre à jour une automatisation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/automations/${workspaceId}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update automation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["automations", workspaceId, boardId],
      });
      toast.success("Automation updated successfully");
    },
    onError: () => {
      toast.error("Failed to update automation");
    },
  });

  // Supprimer une automatisation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/automations/${workspaceId}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete automation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["automations", workspaceId, boardId],
      });
      toast.success("Automation deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete automation");
    },
  });

  return {
    automations,
    isLoading,
    createAutomation: createMutation.mutate,
    updateAutomation: updateMutation.mutate,
    deleteAutomation: deleteMutation.mutate,
  };
};