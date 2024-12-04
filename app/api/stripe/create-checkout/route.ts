import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createCheckout } from "@/lib/stripe";
import { getSession } from "next-auth/react";
import { currentUser } from "@/lib/auth";

// Fonction POST pour créer une session Stripe Checkout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation des champs nécessaires
    const { priceId, mode, successUrl, cancelUrl } = body;
    if (!priceId || !successUrl || !cancelUrl || !mode) {
      return NextResponse.json(
        { error: "Missing required fields: priceId, successUrl, cancelUrl, or mode" },
        { status: 400 }
      );
    }

    // Obtenez la session de l'utilisateur via NextAuth
    const user = await currentUser();
    let clientReferenceId = null;

    if (user?.id) {
      // Récupération de l'utilisateur avec Prisma
      const us = await db.user.findUnique({
        where: { id: user?.id },
      });

      if (!us) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      clientReferenceId = user.id;
    }

    // Création de la session Stripe Checkout
    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      clientReferenceId: "1",
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (error:any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
