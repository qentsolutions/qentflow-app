import { useState, useCallback } from 'react';

interface UseCardFiltersProps {
  lists: any[];
}

export const useBoardFilters = ({ lists }: UseCardFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
        
        // Gestion spéciale pour les cartes non assignées
        const matchesUser = selectedUser === "unassigned" 
          ? !card.assignedUserId // Vérifie si la carte n'est pas assignée
          : selectedUser 
            ? card.assignedUserId === selectedUser // Vérifie si la carte est assignée à l'utilisateur sélectionné
            : true; // Aucun filtre utilisateur
        
        const matchesTags = selectedTags.length > 0
          ? selectedTags.every(tagId => 
              card.tags.some((cardTag: any) => cardTag.id === tagId)
            )
          : true;

        return matchesSearch && matchesUser && matchesTags;
      }),
    }));
  }, [lists, searchTerm, selectedUser, selectedTags]);

  return {
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    selectedTags,
    toggleTag,
    getFilteredLists,
  };
};