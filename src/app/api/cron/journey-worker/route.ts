
import { NextRequest, NextResponse } from "next/server";
import { ExecutionStatus, EnrollmentStatus, LogLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { processJourneyExecution } from "@/lib/journeys/process-execution";

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const STALE_LOCK_MINUTES = 10;

const RETRY_DELAYS_MINUTES = [1, 5, 15];

export async function POST(request: NextRequest) {
  try {
    // 1. Protect the worker API.
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
    const staleBefore = new Date(
      now.getTime() - STALE_LOCK_MINUTES * 60 * 1000
    );

    let recovered = 0;
    let permanentlyFailed = 0;

    // 2. Find executions with stale locks that can be retried.
    const staleExecutions = await prisma.journeyExecution.findMany({
      where: {
        status: ExecutionStatus.running,
        isTest: false,
        lockedAt: { lt: staleBefore },
        retryCount: { lt: MAX_RETRIES },
      },
      select: {
        id: true,
        retryCount: true,
      },
      take: BATCH_SIZE,
    });

    for (const item of staleExecutions) {
      const recovery = await prisma.journeyExecution.updateMany({
        where: {
          id: item.id,
          status: ExecutionStatus.running,
          lockedAt: { lt: staleBefore },
          retryCount: item.retryCount,
        },
        data: {
          status: ExecutionStatus.queued,
          retryCount: { increment: 1 },
          nextRunAt: now,
          lockedAt: null,
          startedAt: null,
          completedAt: null,
          errorMessage: "Recovered after a stale worker lock.",
        },
      });

      if (recovery.count > 0) {
        recovered++;

        await prisma.journeyEnrollment.updateMany({
          where: { executionId: item.id },
          data: {
            status: EnrollmentStatus.active,
            completedAt: null,
            exitedAt: null,
          },
        });

        await prisma.executionLog.create({
          data: {
            executionId: item.id,
            level: LogLevel.warning,
            message: "Execution recovered after a stale worker lock.",
            metadata: {
              retryCount: item.retryCount + 1,
              recoveredAt: now.toISOString(),
            },
          },
        });
      }
    }

    // 3. Permanently fail executions that exceeded retry limits.
    const exhaustedExecutions = await prisma.journeyExecution.findMany({
      where: {
        status: ExecutionStatus.running,
        isTest: false,
        lockedAt: { lt: staleBefore },
        retryCount: { gte: MAX_RETRIES },
      },
      select: { id: true },
      take: BATCH_SIZE,
    });

    for (const item of exhaustedExecutions) {
      const failure = await prisma.journeyExecution.updateMany({
        where: {
          id: item.id,
          status: ExecutionStatus.running,
          lockedAt: { lt: staleBefore },
          retryCount: { gte: MAX_RETRIES },
        },
        data: {
          status: ExecutionStatus.failed,
          lockedAt: null,
          completedAt: now,
          errorMessage: "Execution stopped after maximum retry attempts.",
        },
      });

      if (failure.count > 0) {
        permanentlyFailed++;

        await prisma.journeyEnrollment.updateMany({
          where: { executionId: item.id },
          data: {
            status: EnrollmentStatus.failed,
            exitedAt: now,
          },
        });

        await prisma.executionLog.create({
          data: {
            executionId: item.id,
            level: LogLevel.error,
            message: "Maximum retry attempts reached. Execution permanently failed.",
          },
        });
      }
    }

    // 4. Find queued executions ready to run.
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
    let retried = 0;
    let skipped = 0;

    // 5. Process each queued execution.
    for (const item of queuedExecutions) {
      const lockedAt = new Date();

      const claim = await prisma.journeyExecution.updateMany({
        where: {
          id: item.id,
          status: ExecutionStatus.queued,
          isTest: false,
          lockedAt: null,
          OR: [
            { nextRunAt: null },
            { nextRunAt: { lte: now } },
          ],
        },
        data: {
          status: ExecutionStatus.running,
          lockedAt,
          startedAt: lockedAt,
        },
      });

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

        // 6. Retry failed executions.
        const currentExecution =
          await prisma.journeyExecution.findUnique({
            where: { id: item.id },
            select: {
              status: true,
              retryCount: true,
            },
          });

        if (
          currentExecution?.status === ExecutionStatus.failed &&
          currentExecution.retryCount < MAX_RETRIES
        ) {
          const retryDelay =
            RETRY_DELAYS_MINUTES[currentExecution.retryCount] ?? 15;

          const nextRunAt = new Date(
            Date.now() + retryDelay * 60 * 1000
          );

          const retryUpdate = await prisma.journeyExecution.updateMany({
            where: {
              id: item.id,
              status: ExecutionStatus.failed,
              retryCount: currentExecution.retryCount,
            },
            data: {
              status: ExecutionStatus.queued,
              retryCount: { increment: 1 },
              nextRunAt,
              completedAt: null,
              startedAt: null,
              errorMessage: null,
            },
          });

          if (retryUpdate.count > 0) {
            retried++;

            await prisma.journeyEnrollment.updateMany({
              where: { executionId: item.id },
              data: {
                status: EnrollmentStatus.active,
                completedAt: null,
                exitedAt: null,
              },
            });

            await prisma.executionLog.create({
              data: {
                executionId: item.id,
                level: LogLevel.warning,
                message: `Execution scheduled for retry ${currentExecution.retryCount + 1} of ${MAX_RETRIES}.`,
                metadata: {
                  retryCount: currentExecution.retryCount + 1,
                  nextRunAt: nextRunAt.toISOString(),
                  retryDelayMinutes: retryDelay,
                },
              },
            });
          }
        }
      } finally {
        // 7. Release this worker's lock.
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
        retried,
        recovered,
        permanentlyFailed,
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
