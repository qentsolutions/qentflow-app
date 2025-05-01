import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { RelationshipType } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { cardId } = params;

    // Get all relationships where this card is either source or destination
    const relationships = await db.cardRelationship.findMany({
      where: {
        OR: [{ sourceCardId: cardId }, { destCardId: cardId }],
      },
      include: {
        sourceCard: {
          select: {
            id: true,
            title: true,
            listId: true,
            list: {
              select: {
                title: true,
              },
            },
          },
        },
        destCard: {
          select: {
            id: true,
            title: true,
            listId: true,
            list: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Get parent-child relationships
    const card = await db.card.findUnique({
      where: { id: cardId },
      select: {
        parentId: true,
        parent: {
          select: {
            id: true,
            title: true,
            listId: true,
            list: {
              select: {
                title: true,
              },
            },
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            listId: true,
            list: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      relationships: relationships.map((rel) => ({
        ...rel,
        relationshipId: rel.id, // Include the relationship ID
      })),
      parent: card?.parent
        ? { ...card.parent, relationshipId: card.parentId }
        : null,
      children:
        card?.children.map((child) => ({
          ...child,
          relationshipId: child.id, // Include the relationship ID
        })) || [],
    });
  } catch (error) {
    console.error("[CARD_RELATIONSHIPS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { cardId } = params;
    const { destCardId, relationshipType } = await req.json();

    if (!destCardId || !relationshipType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate relationship type
    if (!Object.values(RelationshipType).includes(relationshipType)) {
      return new NextResponse("Invalid relationship type", { status: 400 });
    }

    // Check if relationship already exists
    const existingRelationship = await db.cardRelationship.findFirst({
      where: {
        sourceCardId: cardId,
        destCardId,
        relationshipType,
      },
    });

    if (existingRelationship) {
      return new NextResponse("Relationship already exists", { status: 400 });
    }

    // Create the relationship
    const relationship = await db.cardRelationship.create({
      data: {
        sourceCardId: cardId,
        destCardId,
        relationshipType,
      },
    });

    return NextResponse.json(relationship);
  } catch (error) {
    console.error("[CARD_RELATIONSHIP_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { relationshipId } = await req.json();

    if (!relationshipId) {
      return new NextResponse("Missing relationship ID", { status: 400 });
    }

    // Delete the relationship
    await db.cardRelationship.delete({
      where: {
        id: relationshipId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CARD_RELATIONSHIP_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
