import { db } from "@/lib/db";
import { currentUser } from "./auth";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const user = await currentUser();

  if (!user) {
    return false;
  }

  // Étape 1 : Trouver le workspaceId de l'utilisateur
  const workspaceMember = await db.workspaceMember.findFirst({
    where: {
      userId: user.id,
    },
    select: {
      workspaceId: true,
    },
  });

  if (!workspaceMember) {
    return false; // L'utilisateur n'appartient à aucun workspace
  }

  const workspaceId = workspaceMember.workspaceId;

  // Étape 2 : Vérifier l'abonnement lié au workspace
  const orgSubscription = await db.workspaceSubscription.findUnique({
    where: {
      workspaceId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!orgSubscription) {
    return false; // Pas de souscription active pour ce workspace
  }

  // Étape 3 : Vérifier si l'abonnement est valide
  const isValid =
    orgSubscription.stripePriceId &&
    orgSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return !!isValid;
};
