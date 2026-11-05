import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const journey = await prisma.journey.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
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

    const executions = await prisma.journeyExecution.findMany({
      where: {
        journeyId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
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
      data: {
        journey,
        executions,
        total: await prisma.journeyExecution.count({
          where: { journeyId: id },
        }),
      },
    });
  } catch (error) {
    console.error("GET journey executions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch execution history.",
      },
      { status: 500 }
    );
  }
}