
import { NextRequest, NextResponse } from "next/server";
import { Prisma, JourneyNodeType, JourneyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET: Fetch all journeys
export async function GET() {
  try {
 
const journeys = await prisma.journey.findMany({
  orderBy: { updatedAt: "desc" },
  include: {
    nodes: {
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        config: true,
      },
    },
    _count: {
      select: {
        nodes: true,
        edges: true,
        executions: true,
      },
    },
  },
});


    return NextResponse.json({
      success: true,
      data: journeys,
    });
  } catch (error) {
    console.error("GET journeys error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch journeys." },
      { status: 500 }
    );
  }
}

// POST: Create a journey with its nodes and edges
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Journey name is required." },
        { status: 400 }
      );
    }

    const nodes = body.nodes ?? [];
    const edges = body.edges ?? [];

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        { success: false, message: "Nodes and edges must be arrays." },
        { status: 400 }
      );
    }

    const validNodeTypes = Object.values(JourneyNodeType);
    const nodeIds = new Set<string>();

    for (const node of nodes) {
      if (
        !node.id ||
        !validNodeTypes.includes(node.type) ||
        !node.data?.title ||
        !Number.isFinite(node.position?.x) ||
        !Number.isFinite(node.position?.y)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid node data." },
          { status: 400 }
        );
      }

      if (nodeIds.has(node.id)) {
        return NextResponse.json(
          { success: false, message: "Duplicate node ID found." },
          { status: 400 }
        );
      }

      nodeIds.add(node.id);
    }

    for (const edge of edges) {
      if (
        !edge.id ||
        !nodeIds.has(edge.source) ||
        !nodeIds.has(edge.target)
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid edge connection." },
          { status: 400 }
        );
      }
    }

    const validStatuses = Object.values(JourneyStatus);
    const status = validStatuses.includes(body.status)
      ? body.status
      : JourneyStatus.draft;

    const journey = await prisma.$transaction(async (tx) => {
      const createdJourney = await tx.journey.create({
        data: {
          name,
          description: body.description ?? null,
          status,
        },
      });

      if (nodes.length > 0) {
        await tx.journeyNode.createMany({
          data: nodes.map((node: any) => ({
            id: node.id,
            journeyId: createdJourney.id,
            type: node.type,
            title: node.data.title,
            description: node.data.description ?? null,
            positionX: node.position.x,
            positionY: node.position.y,
            config: node.data.config
              ? (node.data.config as Prisma.InputJsonValue)
              : undefined,
            actionId: node.data.actionId ?? null,
            category: node.data.category ?? null,
            icon: node.data.icon ?? null,
            color: node.data.color ?? null,
          })),
        });
      }

      if (edges.length > 0) {
        await tx.journeyEdge.createMany({
          data: edges.map((edge: any) => ({
            id: edge.id,
            journeyId: createdJourney.id,
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            sourceHandle: edge.sourceHandle ?? null,
            targetHandle: edge.targetHandle ?? null,
            label: edge.label ?? null,
            edgeType: edge.type ?? null,
            animated: edge.animated ?? false,
          })),
        });
      }

      return tx.journey.findUnique({
        where: { id: createdJourney.id },
        include: {
          nodes: true,
          edges: true,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Journey created successfully.",
        data: journey,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST journey error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create journey." },
      { status: 500 }
    );
  }
}
