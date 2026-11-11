
import { NextRequest, NextResponse } from "next/server";
import { ContactStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Fetch one contact by ID
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("GET contact error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch contact." },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing contact
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingContact = await prisma.contact.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingContact) {
      return NextResponse.json(
        { success: false, message: "Contact not found." },
        { status: 404 }
      );
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "company",
      "jobTitle",
      "source",
      "status",
      "customFields",
    ] as const;

    const data: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        data[field] = body[field];
      }
    }

    // Validate status if it is being updated
    if (
      data.status !== undefined &&
      !Object.values(ContactStatus).includes(data.status as ContactStatus)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid contact status." },
        { status: 400 }
      );
    }

    // Convert empty strings to null for optional text fields
    const textFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "company",
      "jobTitle",
      "source",
    ];

    for (const field of textFields) {
      if (typeof data[field] === "string") {
        data[field] = (data[field] as string).trim() || null;
      } else if (data[field] !== undefined && data[field] !== null) {
        return NextResponse.json(
          { success: false, message: `Invalid value for ${field}.` },
          { status: 400 }
        );
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: data as any,
    });

    return NextResponse.json({
      success: true,
      message: "Contact updated successfully.",
      data: updatedContact,
    });
  } catch (error) {
    console.error("PATCH contact error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update contact." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const existingContact = await prisma.contact.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingContact) {
      return NextResponse.json(
        { success: false, message: "Contact not found." },
        { status: 404 }
      );
    }

    await prisma.contact.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE contact error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete contact." },
      { status: 500 }
    );
  }
}
