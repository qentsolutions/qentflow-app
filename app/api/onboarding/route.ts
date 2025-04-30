import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { responses } = body;

    if (!responses) {
      return new NextResponse("Responses are required", { status: 400 });
    }

    // Store survey responses anonymously
    await db.onboardingSurvey.create({
      data: {
        responses,
      },
    });

    // Mark user as having completed onboarding
    await db.user.update({
      where: { id: user.id },
      data: { hasCompletedOnboarding: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ONBOARDING_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
