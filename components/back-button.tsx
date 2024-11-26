'use client'; // Pour Next.js (dossier app)

import { useRouter } from 'next/navigation';

export default function BackButton({ fallback = '/auth/register' }) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back(); // Retourne à la page précédente
    } else {
      router.push(fallback); // Redirige vers la route fallback
    }
  };

  return (
    <button
      onClick={handleBack}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      Go Back
    </button>
  );
}
