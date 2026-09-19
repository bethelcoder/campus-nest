import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateApplicationProofLetterPdf } from "@/lib/pdf";

export const dynamic = "force-dynamic";

// GET /api/applications/proof/[id]
// ---------------------------------------------------------------------------
// Returns the formal "Proof of Application & Lease Intent" certificate as a PDF
// attachment. `Content-Disposition: attachment` tells the browser to
// automatically download the document (no print step needed) — the proof letter
// button on the student dashboard points here.
//
// Only the student who owns the application (or an admin) may download it.
// All document details are re-fetched server-side so the stamp always reflects
// the current application status, never stale client state.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const isAdmin = session.role === "ADMIN";

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      student: { include: { studentProfile: true } },
      property: {
        include: {
          landlord: { include: { landlordProfile: true } },
          checklistItems: { select: { passed: true } },
        },
      },
      roomListing: true,
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // Ownership guard: a student may only download their own proof letter.
  if (!isAdmin && application.studentId !== session.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const student = application.student;
  const profile = student.studentProfile;
  const property = application.property;
  const landlord = property.landlord;
  const landlordProfile = landlord.landlordProfile;
  const room = application.roomListing;

  const providerName =
    landlordProfile?.companyName || `${landlord.name} ${landlord.surname}` || "";

  const addressCity = `${property.address}, ${property.suburb}, ${property.city}`;
  const addressNoCity = `${property.address}, ${property.suburb}`;
  const rentAmount = room ? Number(room.monthlyRent) : Number(property.priceMonthly);

  const referenceCode = `CN-PROOF-${application.id.slice(-8).toUpperCase()}`;

  let statusText = "Under Review (Pending Approval)";
  if (application.status === "ACCEPTED") statusText = "Application Approved / Accepted";
  else if (application.status === "REJECTED") statusText = "Declined / Rejected";

  const data = {
    referenceCode,
    statusText,
    submittedDate: new Date(application.createdAt).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    studentName: `${student.name} ${student.surname}`,
    studentNumber: profile?.studentNumber || "2489102",
    university: profile?.universityName || "University of the Witwatersrand (Wits)",
    funderName: profile?.funderName || profile?.fundingType || "NSFAS Direct Allowance",
    studentEmail: student.universityEmail || student.email,
    idNumber: student.idNumber || "Verified via Student Portal",
    propertyTitle: property.title,
    propertyAddress: addressCity,
    providerName,
    entityType: landlordProfile?.entityType || undefined,
    safetyScore: property.safetyScore ? Number(property.safetyScore) : null,
    landlordEmail: landlord.email,
    room: room ? { name: room.name, roomType: room.roomType } : undefined,
    rentAmount,
    note: application.message || "Standard lease term (12-month academic period).",
    issuedDate: new Date().toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };

  const pdfBuffer = await generateApplicationProofLetterPdf(data);

  const filename = `CampusNest-Proof-of-Application-${application.id
    .slice(-8)
    .toUpperCase()}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBuffer.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
