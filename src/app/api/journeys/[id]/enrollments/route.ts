
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: journeyId } = await params;

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim() || "";

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") || "20", 10) || 20
      )
    );

    const skip = (page - 1) * limit;

    const journey = await prisma.journey.findUnique({
      where: { id: journeyId },
      select: {
        id: true,
        name: true,
        status: true,
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

    const allowedStatuses = [
      "active",
      "completed",
      "failed",
      "cancelled",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid enrollment status.",
        },
        { status: 400 }
      );
    }

    const where = {
      journeyId,
      ...(status
        ? {
            status: status as
              | "active"
              | "completed"
              | "failed"
              | "cancelled",
          }
        : {}),
      ...(search
        ? {
            contact: {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { company: { contains: search } },
              ],
            },
          }
        : {}),
    };

    const [enrollments, total, statusCounts] = await Promise.all([
      prisma.journeyEnrollment.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              company: true,
              status: true,
            },
          },
        },
        orderBy: {
          enrolledAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.journeyEnrollment.count({ where }),

      prisma.journeyEnrollment.groupBy({
        by: ["status"],
        where: { journeyId },
        _count: {
          _all: true,
        },
      }),
    ]);

    const counts = {
      active: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const item of statusCounts) {
      counts[item.status] = item._count._all;
    }

    return NextResponse.json({
      success: true,
      data: {
        journey,
        summary: {
          total: statusCounts.reduce(
            (sum, item) => sum + item._count._all,
            0
          ),
          ...counts,
        },
        enrollments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Journey enrollments listing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load journey enrollments.",
      },
      { status: 500 }
    );
  }
}
