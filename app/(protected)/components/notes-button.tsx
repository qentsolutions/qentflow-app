import { useCurrentWorkspace } from '@/hooks/use-current-workspace';
import { Plus, StickyNote, X } from 'lucide-react';
import { useState } from 'react';

const NotesButton = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const { currentWorkspace } = useCurrentWorkspace();

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const handleNoteCreation = () => {
        // Logique pour créer une note associée au workspaceId
        console.log('Créer une note pour le workspace :', currentWorkspace?.id);
        // Ajoutez ici la logique pour envoyer les données de la note au serveur
    };

    return (
        <div>
            <button
                className="fixed bottom-8 right-6 w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-blue-600 transition-colors"
                onClick={togglePopup}
            >
                {isPopupOpen ? <X /> : <StickyNote />}
            </button>
            {isPopupOpen && (
                <div className="fixed bottom-20 right-4 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 transition-transform transform translate-y-0">
                    <p>Contenu de la popup</p>
                    <button
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={handleNoteCreation}
                    >
                        Créer une note
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotesButton;
