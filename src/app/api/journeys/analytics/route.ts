
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [journeys, executions] = await Promise.all([
      prisma.journey.findMany({
        select: {
          id: true,
          name: true,
          status: true,
        },
      }),

      prisma.journeyExecution.findMany({
        select: {
          id: true,
          journeyId: true,
          status: true,
          isTest: true,
          createdAt: true,
          startedAt: true,
          completedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Separate test executions from real executions.
    const realExecutions = executions.filter(
      (execution) => !execution.isTest
    );

    const testExecutions = executions.filter(
      (execution) => execution.isTest
    );

    const completed = realExecutions.filter(
      (execution) => execution.status === "completed"
    ).length;

    const failed = realExecutions.filter(
      (execution) => execution.status === "failed"
    ).length;

    const running = realExecutions.filter(
      (execution) => execution.status === "running"
    ).length;

    const queued = realExecutions.filter(
      (execution) => execution.status === "queued"
    ).length;

    const cancelled = realExecutions.filter(
      (execution) => execution.status === "cancelled"
    ).length;

    const successRate =
      realExecutions.length > 0
        ? Math.round((completed / realExecutions.length) * 100)
        : 0;

    // Generate the last 14 calendar days.
    const trend = Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCDate(date.getUTCDate() - (13 - index));

      const nextDate = new Date(date);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);

      const dailyReal = realExecutions.filter((execution) => {
        const createdAt = new Date(execution.createdAt);
        return createdAt >= date && createdAt < nextDate;
      });

      const dailyTests = testExecutions.filter((execution) => {
        const createdAt = new Date(execution.createdAt);
        return createdAt >= date && createdAt < nextDate;
      });

      return {
        date: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          timeZone: "UTC",
        }),
        real: dailyReal.length,
        test: dailyTests.length,
        completed: dailyReal.filter(
          (execution) => execution.status === "completed"
        ).length,
        failed: dailyReal.filter(
          (execution) => execution.status === "failed"
        ).length,
      };
    });

    // Calculate performance for each journey.
    const journeyPerformance = journeys.map((journey) => {
      const journeyExecutions = realExecutions.filter(
        (execution) => execution.journeyId === journey.id
      );

      const journeyCompleted = journeyExecutions.filter(
        (execution) => execution.status === "completed"
      ).length;

      const journeyFailed = journeyExecutions.filter(
        (execution) => execution.status === "failed"
      ).length;

      return {
        id: journey.id,
        name: journey.name,
        status: journey.status,
        totalExecutions: journeyExecutions.length,
        completed: journeyCompleted,
        failed: journeyFailed,
        successRate:
          journeyExecutions.length > 0
            ? Math.round(
                (journeyCompleted / journeyExecutions.length) * 100
              )
            : 0,
      };
    });

    journeyPerformance.sort(
      (a, b) => b.totalExecutions - a.totalExecutions
    );

    const activeJourneys = journeys.filter(
      (journey) => journey.status === "active"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalExecutions: realExecutions.length,
          testExecutions: testExecutions.length,
          completed,
          failed,
          running,
          queued,
          cancelled,
          successRate,
          activeJourneys,
          totalJourneys: journeys.length,
        },
        modeBreakdown: {
          real: realExecutions.length,
          test: testExecutions.length,
        },
        trend,
        journeys: journeyPerformance,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Journey analytics API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load journey analytics.",
      },
      { status: 500 }
    );
  }
}
