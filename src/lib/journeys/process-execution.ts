
import {
  EnrollmentStatus,
  ExecutionStatus,
  LogLevel,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type JsonObject = Record<string, unknown>;

type ExecutionMode = "test" | "live";

function toObject(value: unknown): JsonObject {
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return value as JsonObject;
  }

  return {};
}

function evaluateCondition(
  config: JsonObject,
  data: JsonObject
): boolean {
  const field = String(config.conditionField ?? "");
  const operator = String(config.operator ?? "equals");
  const expected = config.value;
  const actual = data[field];

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
      return actual === undefined || actual === null || actual === "";

    case "is_not_empty":
      return actual !== undefined && actual !== null && actual !== "";

    default:
      throw new Error(`Unsupported condition operator: ${operator}`);
  }
}

export async function processJourneyExecution(
  executionId: string,
  mode: ExecutionMode
) {
  const isTest = mode === "test";

  try {
    const execution = await prisma.journeyExecution.findFirst({
      where: {
        id: executionId,
        isTest,
        status: ExecutionStatus.running,
      },
    });

    if (!execution) {
      throw new Error("Running execution not found.");
    }

    const journey = await prisma.journey.findUnique({
      where: { id: execution.journeyId },
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
    const triggerData = toObject(execution.triggerData);

    let currentNodeId = execution.currentNodeId;
    let steps = 0;

    const maxSteps = 100;
    const visited = new Set<string>();

    await prisma.executionLog.create({
      data: {
        executionId,
        level: LogLevel.info,
        message: isTest
          ? "Test execution started."
          : "Live execution started.",
        metadata: { mode },
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
        data: { currentNodeId: node.id },
      });

      const config = toObject(node.config);

      let logMessage = "";
      let logLevel: LogLevel = LogLevel.info;
      let selectedEdge: (typeof edges)[number] | undefined;
      let selectedBranch: "yes" | "no" | undefined;
      let delayUntil: Date | null = null;
      if (node.type === "trigger") {
        logMessage = `Trigger processed: ${node.title}`;

        selectedEdge = edges.find(
          (edge) => edge.sourceNodeId === node.id
        );
      } else if (node.type === "condition") {
        const conditionResult = evaluateCondition(
          config,
          triggerData
        );

        selectedBranch = conditionResult ? "yes" : "no";

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
      } else if (
        ["email", "whatsapp", "sms"].includes(node.type)
      ) {
        logMessage = isTest
          ? `${node.title} simulated successfully. No real message was sent.`
          : `${node.title} reached. Provider integration is not connected; no real message was sent.`;

        selectedEdge = edges.find(
          (edge) => edge.sourceNodeId === node.id
        );
     } else if (node.type === "delay") {
  const duration = Number(config.duration);
  const unit = String(config.unit ?? "minutes");

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Delay duration must be a positive number.");
  }

  const unitMilliseconds: Record<string, number> = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
  };

  const multiplier = unitMilliseconds[unit];

  if (!multiplier) {
    throw new Error(`Unsupported delay unit: ${unit}`);
  }

  selectedEdge = edges.find(
    (edge) => edge.sourceNodeId === node.id
  );

  if (!selectedEdge) {
    throw new Error("Delay node has no outgoing connection.");
  }

  delayUntil = new Date(
    Date.now() + duration * multiplier
  );

  logMessage = isTest
    ? `Delay simulated: ${duration} ${unit}. No actual waiting applied.`
    : `Delay scheduled for ${duration} ${unit}. Journey will resume at ${delayUntil.toISOString()}.`;
} else if (node.type === "assign") {
        logMessage =
          "Assign node processed. No actual assignment was performed.";

        selectedEdge = edges.find(
          (edge) => edge.sourceNodeId === node.id
        );
      } else if (node.type === "end") {
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
            mode,
            nodeType: node.type,
            nodeTitle: node.title,
            ...(node.type === "condition"
              ? {
                  conditionField: config.conditionField ?? null,
                  operator: config.operator ?? null,
                  expectedValue: config.value ?? null,
                  actualValue:
                    triggerData[String(config.conditionField ?? "")] ?? null,
                  selectedBranch: selectedBranch ?? null,
                }
              : {}),
          } as Prisma.InputJsonValue,
        },
      });


      // Pause live execution at a delay node.
if (node.type === "delay" && !isTest && delayUntil) {
  await prisma.journeyExecution.update({
    where: { id: executionId },
    data: {
      status: ExecutionStatus.queued,
      currentNodeId: selectedEdge!.targetNodeId,
      nextRunAt: delayUntil,
    },
  });

  return await prisma.journeyExecution.findUnique({
    where: { id: executionId },
    include: {
      logs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}


      if (node.type === "end") {
        currentNodeId = "";
        break;
      }

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

    // Update the enrollment only for real executions.
    if (!isTest) {
      await prisma.journeyEnrollment.updateMany({
        where: {
          executionId,
          status: EnrollmentStatus.active,
        },
        data: {
          status: EnrollmentStatus.completed,
          completedAt: new Date(),
        },
      });
    }

    return await prisma.journeyExecution.findUnique({
      where: { id: executionId },
      include: {
        logs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown execution error.";

    await prisma.journeyExecution.updateMany({
      where: {
        id: executionId,
        isTest,
        status: ExecutionStatus.running,
      },
      data: {
        status: ExecutionStatus.failed,
        errorMessage,
        completedAt: new Date(),
      },
    });

    if (!isTest) {
      await prisma.journeyEnrollment.updateMany({
        where: {
          executionId,
          status: EnrollmentStatus.active,
        },
        data: {
          status: EnrollmentStatus.failed,
          exitedAt: new Date(),
        },
      });
    }

    await prisma.executionLog.create({
      data: {
        executionId,
        level: LogLevel.error,
        message: errorMessage,
        metadata: {
          mode,
          error: true,
        },
      },
    }).catch((logError) => {
      console.error("Failed to save execution error log:", logError);
    });

    throw error;
  }
}
