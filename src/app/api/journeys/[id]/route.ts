
import { NextRequest, NextResponse } from "next/server";
import {
  Prisma,
  JourneyNodeType,
  JourneyStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";


type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Fetch one journey with complete workflow
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const journey = await prisma.journey.findUnique({
      where: { id },
      include: {
        nodes: true,
        edges: true,
        _count: {
          select: { executions: true },
        },
      },
    });

    if (!journey) {
      return NextResponse.json(
        { success: false, message: "Journey not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: journey,
    });
  } catch (error) {
    console.error("GET journey error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch journey." },
      { status: 500 }
    );
  }
}

// PATCH: Update journey details and/or replace its complete workflow
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingJourney = await prisma.journey.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingJourney) {
      return NextResponse.json(
        { success: false, message: "Journey not found." },
        { status: 404 }
      );
    }

    const validStatuses = Object.values(JourneyStatus);

    if (
      body.status !== undefined &&
      !validStatuses.includes(body.status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid journey status." },
        { status: 400 }
      );
    }

    const hasNodes = body.nodes !== undefined;
    const hasEdges = body.edges !== undefined;

    if (hasNodes !== hasEdges) {
      return NextResponse.json(
        {
          success: false,
          message: "Send both nodes and edges when updating the workflow.",
        },
        { status: 400 }
      );
    }

    const updateData: Prisma.JourneyUpdateInput = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { success: false, message: "Journey name is required." },
          { status: 400 }
        );
      }

      updateData.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.journey.update({
        where: { id },
        data: updateData,
      });

      // Replace workflow only when both arrays are supplied.
      if (hasNodes && hasEdges) {
        const nodes = body.nodes;
        const edges = body.edges;

        if (!Array.isArray(nodes) || !Array.isArray(edges)) {
          throw new Error("INVALID_WORKFLOW_ARRAYS");
        }

        const validNodeTypes = Object.values(JourneyNodeType);
        const nodeIds = new Set<string>();

        for (const node of nodes) {
          if (
            !node.id ||
            !validNodeTypes.includes(node.type) ||
            !node.data?.title ||
            !Number.isFinite(node.position?.x) ||
            !Number.isFinite(node.position?.y) ||
            nodeIds.has(node.id)
          ) {
            throw new Error("INVALID_NODE_DATA");
          }

          nodeIds.add(node.id);
        }

        for (const edge of edges) {
          if (
            !edge.id ||
            !nodeIds.has(edge.source) ||
            !nodeIds.has(edge.target)
          ) {
            throw new Error("INVALID_EDGE_DATA");
          }
        }

        // Delete edges first because they reference nodes.
        await tx.journeyEdge.deleteMany({
          where: { journeyId: id },
        });

        await tx.journeyNode.deleteMany({
          where: { journeyId: id },
        });

        if (nodes.length > 0) {
          await tx.journeyNode.createMany({
            data: nodes.map((node: any) => ({
              id: node.id,
              journeyId: id,
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
              journeyId: id,
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
      }

      return tx.journey.findUnique({
        where: { id },
        include: {
          nodes: true,
          edges: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Journey updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("PATCH journey error:", error);

    const message =
      error instanceof Error ? error.message : "";

    if (
      [
        "INVALID_WORKFLOW_ARRAYS",
        "INVALID_NODE_DATA",
        "INVALID_EDGE_DATA",
      ].includes(message)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid workflow data." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update journey." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a journey
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const journey = await prisma.journey.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!journey) {
      return NextResponse.json(
        { success: false, message: "Journey not found." },
        { status: 404 }
      );
    }

    await prisma.journey.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Journey deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE journey error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete journey." },
      { status: 500 }
    );
  }
}
