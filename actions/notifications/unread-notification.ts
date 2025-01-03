"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markNotificationAsUnread(notificationId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    // Vérification de l'existence de la notification
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    // Mise à jour de la notification pour la marquer comme non lue
    await db.notification.update({
      where: { id: notificationId },
      data: { read: false },
    });

    // Revalidation du cache pour la page actuelle
    revalidatePath("/");
    return {
      success: true,
      message: "Notification marked as unread successfully",
    };
  } catch (error) {
    console.error("Error marking notification as unread:", error);
    return { success: false, message: error || "An unexpected error occurred" };
  }
}
