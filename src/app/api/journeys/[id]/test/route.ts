import { NextRequest, NextResponse } from "next/server";
import { Prisma, ExecutionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST: Create a new test execution for a journey
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    // Read test data from request body.
    const body = await request.json();

    const testData = body?.testData ?? {};

    if (
      typeof testData !== "object" ||
      testData === null ||
      Array.isArray(testData)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "testData must be a JSON object.",
        },
        { status: 400 }
      );
    }

    // Find the journey with its workflow.
    const journey = await prisma.journey.findUnique({
      where: { id },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!journey) {
      return NextResponse.json(
        {
          success: false,
          message: "Journey not found.",
        },
        { status: 404 }
      );
    }

    if (journey.nodes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot test an empty journey.",
        },
        { status: 400 }
      );
    }

    // Find the trigger node.
    const triggerNode = journey.nodes.find(
      (node) => node.type === "trigger"
    );

    if (!triggerNode) {
      return NextResponse.json(
        {
          success: false,
          message: "Journey must contain a trigger node.",
        },
        { status: 400 }
      );
    }

    // Verify that every edge belongs to a valid node.
    const nodeIds = new Set(journey.nodes.map((node) => node.id));

    const invalidEdge = journey.edges.some(
      (edge) =>
        !nodeIds.has(edge.sourceNodeId) ||
        !nodeIds.has(edge.targetNodeId)
    );

    if (invalidEdge) {
      return NextResponse.json(
        {
          success: false,
          message: "Journey contains an invalid connection.",
        },
        { status: 400 }
      );
    }

    // Create a test execution and its first log.
    const execution = await prisma.journeyExecution.create({
      data: {
        journeyId: journey.id,
        contactId: null,
        isTest: true,
        status: ExecutionStatus.queued,
        currentNodeId: triggerNode.id,
        triggerData: testData as Prisma.InputJsonValue,
        logs: {
          create: {
            nodeId: triggerNode.id,
            level: "info",
            message: "Test execution created and queued.",
            metadata: {
              mode: "test",
              triggerNodeId: triggerNode.id,
              testData: testData as Prisma.InputJsonValue,
            } as Prisma.InputJsonValue,
          },
        },
      },
      include: {
        logs: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Test execution created successfully.",
        data: {
          execution,
          journey: {
            id: journey.id,
            name: journey.name,
            nodeCount: journey.nodes.length,
            edgeCount: journey.edges.length,
            triggerNodeId: triggerNode.id,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST journey test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create test execution.",
      },
      { status: 500 }
    );
  }
}