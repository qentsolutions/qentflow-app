'use server';

import { db } from "@/lib/db";  // Assure-toi d'importer correctement Prisma ou ton ORM
import { z } from "zod";

// Définir un schéma de validation pour l'ID du feedback
const feedbackIdSchema = z.object({
  id: z.string().min(1, "Feedback ID cannot be empty"), // Valider que l'ID est une chaîne non vide
});

export async function deleteFeedback(id: string) {
  try {
    // Valider l'ID du feedback
    feedbackIdSchema.parse({ id });

    // Supprimer le feedback dans la base de données
    const deletedFeedback = await db.feedback.delete({
      where: { id: (id) },  // Assure-toi que l'ID est un nombre entier
    });

    return { success: true, message: 'Feedback deleted successfully' };
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return {
      success: false,
      error: "Failed to delete feedback. Please try again later.",
    };
  }
}
