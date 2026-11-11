
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface EnrollRequestBody {
  contactIds?: string[];
  contactId?: string;
  source?: string;
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id: journeyId } = await params;

    const body = (await request.json()) as EnrollRequestBody;

    // 1. Normalize contact IDs.
    const contactIds = [
      ...new Set(
        [
          ...(body.contactIds ?? []),
          ...(body.contactId ? [body.contactId] : []),
        ]
          .filter((id): id is string => typeof id === "string")
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ];

    if (contactIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide at least one valid contact ID.",
        },
        { status: 400 }
      );
    }

    if (contactIds.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum 500 contacts can be enrolled at a time.",
        },
        { status: 400 }
      );
    }

    // 2. Verify journey and its trigger node.
    const journey = await prisma.journey.findUnique({
      where: { id: journeyId },
      select: {
        id: true,
        name: true,
        status: true,
        nodes: {
          where: { type: "trigger" },
          select: {
            id: true,
            title: true,
            config: true,
          },
          take: 1,
        },
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

    if (journey.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Only active journeys can accept enrollments.",
        },
        { status: 400 }
      );
    }

    const triggerNode = journey.nodes[0];

    if (!triggerNode) {
      return NextResponse.json(
        {
          success: false,
          message: "Journey does not have a trigger node.",
        },
        { status: 400 }
      );
    }

    // 3. Fetch contacts and their data.
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
      },
    });

    const existingContactIds = new Set(
      contacts.map((contact) => contact.id)
    );

    const invalidContactIds = contactIds.filter(
      (contactId) => !existingContactIds.has(contactId)
    );

    if (invalidContactIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Some contacts were not found.",
          invalidContactIds,
        },
        { status: 404 }
      );
    }

    // 4. Check existing enrollments.
    const existingEnrollments =
      await prisma.journeyEnrollment.findMany({
        where: {
          journeyId,
          contactId: { in: contactIds },
        },
        select: {
          contactId: true,
          status: true,
        },
      });

    const existingContactSet = new Set(
      existingEnrollments.map((item) => item.contactId)
    );

    const duplicateContactIds = contactIds.filter((contactId) =>
      existingContactSet.has(contactId)
    );

    const newContacts = contacts.filter(
      (contact) => !existingContactSet.has(contact.id)
    );

    // 5. Create enrollment and execution together.
    const createdRecords = await prisma.$transaction(async (tx) => {
      const records = [];

      for (const contact of newContacts) {
        const enrollment = await tx.journeyEnrollment.create({
          data: {
            journeyId,
            contactId: contact.id,
            source: body.source?.trim() || "manual",
            status: "active",
          },
        });

        const triggerData = {
          contactId: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          jobTitle: contact.jobTitle,
          source: contact.source,
          contactStatus: contact.status,
          customFields: contact.customFields,
          enrollmentId: enrollment.id,
        };

        const execution = await tx.journeyExecution.create({
          data: {
            journeyId,
            contactId: contact.id,
            status: "queued",
            isTest: false,
            currentNodeId: triggerNode.id,
            triggerData,
            logs: {
              create: {
                nodeId: triggerNode.id,
                level: "info",
                message: "Contact enrolled. Journey execution created and queued.",
                metadata: {
                  enrollmentId: enrollment.id,
                  source: body.source?.trim() || "manual",
                },
              },
            },
          },
        });

        const updatedEnrollment =
          await tx.journeyEnrollment.update({
            where: { id: enrollment.id },
            data: {
              executionId: execution.id,
            },
          });

        records.push({
          enrollment: updatedEnrollment,
          execution,
        });
      }

      return records;
    });

    // 6. Prepare response.
    const enrollments = createdRecords.map((record) => ({
      id: record.enrollment.id,
      contactId: record.enrollment.contactId,
      status: record.enrollment.status,
      source: record.enrollment.source,
      enrolledAt: record.enrollment.enrolledAt,
      executionId: record.execution.id,
      executionStatus: record.execution.status,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Contact enrollment and execution creation completed.",
        data: {
          journey: {
            id: journey.id,
            name: journey.name,
          },
          triggerNode: {
            id: triggerNode.id,
            title: triggerNode.title,
          },
          summary: {
            requested: contactIds.length,
            enrolled: createdRecords.length,
            executionsCreated: createdRecords.length,
            alreadyEnrolled: duplicateContactIds.length,
          },
          duplicateContactIds,
          enrollments,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Journey enrollment error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Duplicate enrollment detected. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to enroll contacts and create executions.",
      },
      { status: 500 }
    );
  }
}
