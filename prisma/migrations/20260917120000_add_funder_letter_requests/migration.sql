-- Add explicit evidence for physical residence inspections.
ALTER TABLE "Property"
  ADD COLUMN "physicalInspectionAt" TIMESTAMP(3),
  ADD COLUMN "physicalInspectorName" TEXT,
  ADD COLUMN "accreditationReference" TEXT;

-- Persist student requests for residence verification letters.
CREATE TABLE "FunderLetterRequest" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "funderEmail" TEXT,
    "status" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "letterReference" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "physicalInspectionAt" TIMESTAMP(3) NOT NULL,
    "physicalInspectorName" TEXT NOT NULL,
    "accreditationReference" TEXT,
    "safetyScore" DECIMAL(65,30),
    "checklistPassed" INTEGER NOT NULL,
    "checklistTotal" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3),

    CONSTRAINT "FunderLetterRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FunderLetterRequest_applicationId_key" ON "FunderLetterRequest"("applicationId");
CREATE UNIQUE INDEX "FunderLetterRequest_letterReference_key" ON "FunderLetterRequest"("letterReference");
CREATE INDEX "FunderLetterRequest_studentId_idx" ON "FunderLetterRequest"("studentId");
CREATE INDEX "FunderLetterRequest_propertyId_idx" ON "FunderLetterRequest"("propertyId");

ALTER TABLE "FunderLetterRequest" ADD CONSTRAINT "FunderLetterRequest_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FunderLetterRequest" ADD CONSTRAINT "FunderLetterRequest_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FunderLetterRequest" ADD CONSTRAINT "FunderLetterRequest_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
