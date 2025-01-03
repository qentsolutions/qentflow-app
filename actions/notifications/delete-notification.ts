"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteNotification(notificationId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    // Vérification de l'existence de la notification avant suppression
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    // Suppression de la notification
    await db.notification.delete({
      where: { id: notificationId },
    });

    // Revalidation du cache pour la page actuelle
    revalidatePath("/");
    return { success: true, message: "Notification deleted successfully" };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, message: error || "An unexpected error occurred" };
  }
}
