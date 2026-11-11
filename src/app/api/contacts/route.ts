
import { NextRequest, NextResponse } from "next/server";
import { ContactStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET: Fetch contacts with search and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 20)
    );

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { company: { contains: search } },
          ],
        }
      : {};

    const [contacts, total] = await prisma.$transaction([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET contacts error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch contacts." },
      { status: 500 }
    );
  }
}

// POST: Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const firstName = body.firstName?.trim() || null;
    const lastName = body.lastName?.trim() || null;
    const email = body.email?.trim() || null;
    const phone = body.phone?.trim() || null;

    if (!firstName && !lastName && !email && !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide at least a name, email, or phone number.",
        },
        { status: 400 }
      );
    }

    const validStatuses = Object.values(ContactStatus);
    const status = validStatuses.includes(body.status)
      ? body.status
      : ContactStatus.new;

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company: body.company?.trim() || null,
        jobTitle: body.jobTitle?.trim() || null,
        source: body.source?.trim() || null,
        status,
        customFields: body.customFields ?? undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Contact created successfully.",
        data: contact,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST contact error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create contact." },
      { status: 500 }
    );
  }
}
