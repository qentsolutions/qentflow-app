import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { findCheckoutSession } from "@/lib/stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event: Stripe.Event;

  // Vérifiez l'authenticité de l'événement Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature as string,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // Paiement réussi, création de l'abonnement
        const stripeObject = event.data.object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price?.id;
        const userId = stripeObject.client_reference_id;
        const workspaceName = session?.metadata?.workspaceName;

        if (!userId || !workspaceName) {
          console.error("Missing userId or workspaceName in session metadata");
          break;
        }

        // Créer un workspace et associer l'abonnement
        const user = await db.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          console.error("User not found");
          throw new Error("User not found");
        }

        const workspace = await db.workspace.create({
          data: {
            name: workspaceName,
            createdBy: { connect: { id: userId } },
            members: {
              create: {
                userId,
                role: "OWNER",
              },
            },
          },
        });

        await db.workspaceSubscription.create({
          data: {
            workspaceId: workspace.id,
            stripeCustomerId: customerId as string,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: priceId as string,
            stripeCurrentPeriodEnd: "0",
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        // Révocation de l'accès en cas de suppression de l'abonnement
        const stripeObject = event.data.object as Stripe.Subscription;

        const subscription = await db.workspaceSubscription.findUnique({
          where: { stripeSubscriptionId: stripeObject.id },
        });

        if (subscription) {
          await db.workspace.delete({
            where: { id: subscription.workspaceId },
          });
        }

        break;
      }

      case "invoice.payment_failed": {
        // Paiement échoué, suspendre temporairement l'accès
        const stripeObject = event.data.object as Stripe.Invoice;

        const subscription = await db.workspaceSubscription.findUnique({
          where: { stripeCustomerId: stripeObject.customer as string },
        });

        if (subscription) {
          // Mettre en pause l'accès ou notifier l'utilisateur
        }

        break;
      }

      default:
        console.warn(`Unhandled event type: ${eventType}`);
    }
  } catch (e: any) {
    console.error("Stripe webhook handler error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
