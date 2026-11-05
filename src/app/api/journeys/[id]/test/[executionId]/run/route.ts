import { NextRequest, NextResponse } from "next/server";
import { ExecutionStatus, LogLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    executionId: string;
  }>;
};

type JsonObject = Record<string, unknown>;

function toObject(value: unknown): JsonObject {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function evaluateCondition(
  config: JsonObject,
  testData: JsonObject
): boolean {
  const field = String(config.conditionField ?? "");
  const operator = String(config.operator ?? "equals");
  const expected = config.value;

  const actual = testData[field];

  const actualString = String(actual ?? "").toLowerCase();
  const expectedString = String(expected ?? "").toLowerCase();

  switch (operator) {
    case "equals":
      return actualString === expectedString;

    case "not_equals":
      return actualString !== expectedString;

    case "contains":
      return actualString.includes(expectedString);

    case "not_contains":
      return !actualString.includes(expectedString);

    case "greater_than":
      return Number(actual) > Number(expected);

    case "less_than":
      return Number(actual) < Number(expected);

    case "is_empty":
      return (
        actual === undefined ||
        actual === null ||
        actual === ""
      );

    case "is_not_empty":
      return (
        actual !== undefined &&
        actual !== null &&
        actual !== ""
      );

    default:
      throw new Error(`Unsupported condition operator: ${operator}`);
  }
}

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

    // Prevent the same queued execution from running twice.
    const claimed = await prisma.journeyExecution.updateMany({
      where: {
        id: executionId,
        status: ExecutionStatus.queued,
        isTest: true,
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

    const journey = await prisma.journey.findUnique({
      where: { id: journeyId },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!journey) {
      throw new Error("Journey not found.");
    }

    const nodes = new Map(
      journey.nodes.map((node) => [node.id, node])
    );

    const edges = journey.edges;

    const testData = toObject(execution.triggerData);

    let currentNodeId = execution.currentNodeId;
    let steps = 0;

    const maxSteps = 100;
    const visited = new Set<string>();

    await prisma.executionLog.create({
      data: {
        executionId,
        level: LogLevel.info,
        message: "Test execution started.",
        metadata: {
          mode: "test",
        },
      },
    });

    while (currentNodeId) {
      steps++;

      if (steps > maxSteps) {
        throw new Error("Maximum execution steps exceeded.");
      }

      if (visited.has(currentNodeId)) {
        throw new Error(
          `Circular connection detected at node ${currentNodeId}.`
        );
      }

      visited.add(currentNodeId);

      const node = nodes.get(currentNodeId);

      if (!node) {
        throw new Error(`Node not found: ${currentNodeId}`);
      }

      await prisma.journeyExecution.update({
        where: { id: executionId },
        data: {
          currentNodeId: node.id,
        },
      });

      const config = toObject(node.config);

      let logMessage = "";
      let logLevel: LogLevel = LogLevel.info;
      let selectedEdge: (typeof edges)[number] | undefined;

      // 1. Trigger node
      if (node.type === "trigger") {
        logMessage = `Trigger simulated: ${node.title}`;

        selectedEdge = edges.find(
          (edge) => edge.sourceNodeId === node.id
        );
      }

      // 2. Condition node
      else if (node.type === "condition") {
        const conditionResult = evaluateCondition(
          config,
          testData
        );

        const selectedBranch = conditionResult ? "yes" : "no";

        selectedEdge = edges.find(
          (edge) =>
            edge.sourceNodeId === node.id &&
            edge.sourceHandle?.toLowerCase() === selectedBranch
        );

        logMessage = conditionResult
          ? `Condition evaluated TRUE. YES branch selected: ${node.title}`
          : `Condition evaluated FALSE. NO branch selected: ${node.title}`;

        if (!selectedEdge) {
          logLevel = LogLevel.warning;
          logMessage += ". No matching branch connection found.";
        }
      }

      // 3. Dummy action nodes
      else if (
        ["email", "whatsapp", "sms"].includes(node.type)
      ) {
        logMessage = `${node.title} simulated successfully. No real message was sent.`;

        selectedEdge = edges.find(
          (edge) => edge.sourceNodeId === node.id
        );
      }

      // 4. Delay node
      else if (node.type === "delay") {
        logMessage = `${node.title} simulated. No actual waiting period was applied.`;

        selectedEdge = edges.find(
          (edge) => edge.sourceNodeId === node.id
        );
      }

      // 5. Assign node
      else if (node.type === "assign") {
        logMessage = `${node.title} simulated. No actual assignment was performed.`;

        selectedEdge = edges.find(
          (edge) => edge.sourceNodeId === node.id
        );
      }

      // 6. End node
      else if (node.type === "end") {
        logMessage = `Journey reached end node: ${node.title}`;
      } else {
        throw new Error(`Unsupported node type: ${node.type}`);
      }

      await prisma.executionLog.create({
        data: {
          executionId,
          nodeId: node.id,
          level: logLevel,
          message: logMessage,
          metadata: {
            mode: "test",
            nodeType: node.type,
            nodeTitle: node.title,
            ...(node.type === "condition"
              ? {
                  conditionField: config.conditionField ?? null,
                  operator: config.operator ?? null,
                  expectedValue: config.value ?? null,
                  actualValue:
                    testData[String(config.conditionField ?? "")] ?? null,
                  selectedBranch:
                    logMessage.includes("TRUE") ? "yes" : "no",
                }
              : {}),
          },
        },
      });

      // Stop if an end node is reached.
      if (node.type === "end") {
        currentNodeId = "";
        break;
      }

      // Continue to the selected next node.
      currentNodeId = selectedEdge?.targetNodeId ?? "";
    }

    await prisma.journeyExecution.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.completed,
        currentNodeId: null,
        completedAt: new Date(),
        errorMessage: null,
      },
    });

    const result = await prisma.journeyExecution.findUnique({
      where: { id: executionId },
      include: {
        logs: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

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

    if (executionId) {
      try {
        await prisma.journeyExecution.updateMany({
          where: {
            id: executionId,
            journeyId,
            isTest: true,
            status: ExecutionStatus.running,
          },
          data: {
            status: ExecutionStatus.failed,
            errorMessage,
            completedAt: new Date(),
          },
        });

        await prisma.executionLog.create({
          data: {
            executionId,
            level: LogLevel.error,
            message: errorMessage,
            metadata: {
              mode: "test",
              error: true,
            },
          },
        });
      } catch (logError) {
        console.error("Failed to save execution error:", logError);
      }
    }

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