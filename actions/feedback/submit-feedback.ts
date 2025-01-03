"use server";

import { db } from "@/lib/db";
import { z } from "zod";

// Définir un schéma de validation pour le feedback
const feedbackSchema = z.object({
  content: z.string().min(1, "Feedback content cannot be empty"),
  userId: z.string().optional(), // userId est une chaîne ou undefined, mais pas null
});

export async function submitFeedback(content: string, userId?: string) {
  try {
    // Valider les données d'entrée
    feedbackSchema.parse({ content, userId });

    // Créer un nouveau feedback dans la base de données
    const feedback = await db.feedback.create({
      data: {
        content,
        userId: userId ?? undefined, // Si userId est null ou undefined, l'assigner comme undefined
        createdAt: new Date(),
      },
    });

    return { success: true, data: feedback };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return {
      success: false,
      error: "Failed to submit feedback. Please try again later.",
    };
  }
}
