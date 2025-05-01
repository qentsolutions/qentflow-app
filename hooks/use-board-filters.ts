import { useState, useCallback } from "react";

interface UseCardFiltersProps {
  lists: any[];
  isArchived: boolean; // Ajouter le paramètre isArchived
}

export const useBoardFilters = ({ lists, isArchived }: UseCardFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const sortCards = (cards: any[]) => {
    if (!sortBy) return cards;
    return [...cards].sort((a, b) => {
      let compareA, compareB;
      switch (sortBy) {
        case "startDate":
          compareA = a.startDate || "";
          compareB = b.startDate || "";
          break;
        case "dueDate":
          compareA = a.dueDate || "";
          compareB = b.dueDate || "";
          break;
        default:
          return 0;
      }
      if (compareA < compareB) return sortDirection === "asc" ? -1 : 1;
      if (compareA > compareB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const getFilteredLists = useCallback(() => {
    return lists.map((list: any) => ({
      ...list,
      cards: sortCards(
        list.cards.filter((card: any) => {
          const matchesSearch = card.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesUser =
            selectedUser === "unassigned"
              ? !card.assignedUserId
              : selectedUser
              ? card.assignedUserId === selectedUser
              : true;
          const matchesTags =
            selectedTags.length > 0
              ? selectedTags.every((tagId) =>
                  card.tags.some((cardTag: any) => cardTag.id === tagId)
                )
              : true;
          const matchesPriority = selectedPriority
            ? card.priority === selectedPriority
            : true;
          const matchesArchived = isArchived
            ? card.archived === true
            : card.archived === false; // Modifier la condition pour "Archived"
          return (
            matchesSearch &&
            matchesUser &&
            matchesTags &&
            matchesPriority &&
            matchesArchived
          );
        })
      ),
    }));
  }, [
    lists,
    searchTerm,
    selectedUser,
    selectedTags,
    selectedPriority,
    sortBy,
    sortDirection,
    sortCards,
    isArchived,
  ]);

  return {
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    selectedTags,
    toggleTag,
    selectedPriority,
    setSelectedPriority,
    getFilteredLists,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
  };
};
