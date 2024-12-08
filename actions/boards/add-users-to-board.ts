"use server";

import { db } from "@/lib/db"; // Remplacez par le chemin de votre client Prisma
import { currentUser } from "@/lib/auth"; // Remplacez par la méthode pour obtenir l'utilisateur actuel
import { z } from "zod";

const addBoardMemberSchema = z.object({
  boardId: z.string(),
  userId: z.string(), // ID de l'utilisateur à ajouter
});

export async function addUserToBoard(userId: string, boardId: string) {
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

  // Vérifiez si l'utilisateur à inviter appartient au même workspace
  const invitedUser = board.workspace.members.find(
    (member) => member.userId === userId
  );
  if (!invitedUser) {
    throw new Error(
      "The user you are trying to invite is not part of this workspace"
    );
  }

  // Ajouter l'utilisateur au board (relation `User[]` dans Board)
  await db.board.update({
    where: { id: boardId },
    data: {
      User: {
        connect: { id: userId }, // Connexion de l'utilisateur au board
      },
    },
  });

  return { message: "User successfully added to the board" };
}
