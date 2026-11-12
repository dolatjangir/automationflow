
import { NextRequest, NextResponse } from "next/server";
import { ExecutionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { processJourneyExecution } from "@/lib/journeys/process-execution";

const BATCH_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    // Protect this endpoint with a secret.
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { success: false, message: "CRON_SECRET is not configured." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find queued real executions that are ready to run.
    const queuedExecutions = await prisma.journeyExecution.findMany({
      where: {
        status: ExecutionStatus.queued,
        isTest: false,
        lockedAt: null,
        OR: [
          { nextRunAt: null },
          { nextRunAt: { lte: now } },
        ],
      },
      select: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: BATCH_SIZE,
    });

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const item of queuedExecutions) {
      const lockedAt = new Date();

      // Atomically claim the execution.
      const claim = await prisma.journeyExecution.updateMany({
        where: {
          id: item.id,
          status: ExecutionStatus.queued,
          isTest: false,
          lockedAt: null,
        },
        data: {
          status: ExecutionStatus.running,
          lockedAt,
          startedAt: lockedAt,
        },
      });

      // Another worker may already have claimed it.
      if (claim.count === 0) {
        skipped++;
        continue;
      }

      try {
        await processJourneyExecution(item.id, "live");
        processed++;
      } catch (error) {
        failed++;

        console.error(
          `Journey execution failed: ${item.id}`,
          error
        );
      } finally {
        // Release the lock after processing.
        await prisma.journeyExecution.updateMany({
          where: {
            id: item.id,
            lockedAt,
          },
          data: {
            lockedAt: null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Journey worker completed.",
      data: {
        found: queuedExecutions.length,
        processed,
        failed,
        skipped,
      },
    });
  } catch (error) {
    console.error("Journey worker error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Journey worker failed.",
      },
      { status: 500 }
    );
  }
}
