"use server";

import { db } from "@/lib/db"; // Remplacez par le chemin de votre client Prisma
import { currentUser } from "@/lib/auth"; // Remplacez par la méthode pour obtenir l'utilisateur actuel
import { z } from "zod";

const removeBoardMemberSchema = z.object({
  boardId: z.string(),
  userId: z.string()
})

export async function removeUserFromBoard(input: { userId: string; boardId: string }) {
  // Valider les données d'entrée avec Zod
  const { userId, boardId } = removeBoardMemberSchema.parse(input);

  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Récupérer le board et vérifier si l'utilisateur actuel y a accès
  const board = await db.board.findUnique({
    where: { id: boardId },
    include: { workspace: { include: { members: true } } }, // Inclut le workspace et ses membres
  });

  if (!board) {
    throw new Error("Board not found");
  }

  // Vérifiez si l'utilisateur actuel est membre du workspace
  const isMember = board.workspace.members.some(
    (member) => member.userId === user.id
  );
  if (!isMember) {
    throw new Error("You are not a member of this workspace");
  }

  // Vérifiez si l'utilisateur à retirer appartient au board
  const userToRemove = board.workspace.members.find(
    (member) => member.userId === userId
  );
  if (!userToRemove) {
    throw new Error("The user you are trying to remove is not a member of this board");
  }

  // Supprimer l'utilisateur du board (relation `User[]` dans Board)
  await db.board.update({
    where: { id: boardId },
    data: {
      User: {
        disconnect: { id: userId }, // Déconnexion de l'utilisateur du board
      },
    },
  });

  return { message: "User successfully removed from the board" };
}
