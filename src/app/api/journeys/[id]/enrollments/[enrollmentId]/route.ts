
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


interface RouteContext {
  params: Promise<{
    id: string;
    enrollmentId: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: journeyId, enrollmentId } = await params;

    const enrollment = await prisma.journeyEnrollment.findFirst({
      where: {
        id: enrollmentId,
        journeyId,
      },
      include: {
        contact: true,
        journey: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          message: "Enrollment not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Enrollment details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load enrollment details.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: journeyId, enrollmentId } = await params;

    const body = await request.json();

    const enrollment = await prisma.journeyEnrollment.findFirst({
      where: {
        id: enrollmentId,
        journeyId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          message: "Enrollment not found.",
        },
        { status: 404 }
      );
    }

    if (body.status !== "cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: "Only cancellation is supported at this stage.",
        },
        { status: 400 }
      );
    }

    if (enrollment.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Only active enrollments can be cancelled.",
        },
        { status: 400 }
      );
    }

    const updatedEnrollment =
      await prisma.journeyEnrollment.update({
        where: {
          id: enrollmentId,
        },
        data: {
          status: "cancelled",
          exitedAt: new Date(),
        },
      });

    return NextResponse.json({
      success: true,
      message: "Enrollment cancelled successfully.",
      data: updatedEnrollment,
    });
  } catch (error) {
    console.error("Enrollment update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update enrollment.",
      },
      { status: 500 }
    );
  }
}
