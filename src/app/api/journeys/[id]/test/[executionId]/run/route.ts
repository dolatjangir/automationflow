
import { NextRequest, NextResponse } from "next/server";
import { ExecutionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { processJourneyExecution } from "@/lib/journeys/process-execution";

type RouteContext = {
  params: Promise<{
    id: string;
    executionId: string;
  }>;
};

export async function POST(
  _request: NextRequest,
  { params }: RouteContext
) {
  let executionId = "";
  let journeyId = "";

  try {
    const routeParams = await params;

    journeyId = routeParams.id;
    executionId = routeParams.executionId;

    const execution = await prisma.journeyExecution.findFirst({
      where: {
        id: executionId,
        journeyId,
        isTest: true,
      },
    });

    if (!execution) {
      return NextResponse.json(
        {
          success: false,
          message: "Test execution not found.",
        },
        { status: 404 }
      );
    }

    if (execution.status !== ExecutionStatus.queued) {
      return NextResponse.json(
        {
          success: false,
          message: `Execution cannot run because its status is ${execution.status}.`,
        },
        { status: 409 }
      );
    }

    // Claim the execution so it cannot run twice.
    const claimed = await prisma.journeyExecution.updateMany({
      where: {
        id: executionId,
        journeyId,
        isTest: true,
        status: ExecutionStatus.queued,
      },
      data: {
        status: ExecutionStatus.running,
        startedAt: new Date(),
        currentNodeId: execution.currentNodeId,
      },
    });

    if (claimed.count !== 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Execution is already running or has been processed.",
        },
        { status: 409 }
      );
    }

    const result = await processJourneyExecution(
      executionId,
      "test"
    );

    return NextResponse.json({
      success: true,
      message: "Test execution completed successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Journey test execution error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown execution error.";

    return NextResponse.json(
      {
        success: false,
        message: "Test execution failed.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
