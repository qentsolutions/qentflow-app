import { useState, useCallback } from 'react';

interface UseCardFiltersProps {
  lists: any[];
}

export const useBoardFilters = ({ lists }: UseCardFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getFilteredLists = useCallback(() => {
    return lists.map((list: any) => ({
      ...list,
      cards: list.cards.filter((card: any) => {
        const matchesSearch = card.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        
        const matchesUser = selectedUser === "unassigned" 
          ? !card.assignedUserId 
          : selectedUser 
            ? card.assignedUserId === selectedUser 
            : true;
        
        const matchesTags = selectedTags.length > 0
          ? selectedTags.every(tagId => 
              card.tags.some((cardTag: any) => cardTag.id === tagId)
            )
          : true;

        const matchesPriority = selectedPriority
          ? card.priority === selectedPriority
          : true;

        return matchesSearch && matchesUser && matchesTags && matchesPriority;
      }),
    }));
  }, [lists, searchTerm, selectedUser, selectedTags, selectedPriority]);

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
  };
};
