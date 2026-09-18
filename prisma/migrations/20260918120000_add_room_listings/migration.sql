CREATE TABLE "RoomListing" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "description" TEXT,
    "monthlyRent" DECIMAL(65,30) NOT NULL,
    "availableUnits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RoomListing_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Application" ADD COLUMN "roomListingId" TEXT;
ALTER TABLE "Tenancy" ADD COLUMN "roomListingId" TEXT;
CREATE INDEX "RoomListing_propertyId_idx" ON "RoomListing"("propertyId");
ALTER TABLE "RoomListing" ADD CONSTRAINT "RoomListing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_roomListingId_fkey" FOREIGN KEY ("roomListingId") REFERENCES "RoomListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tenancy" ADD CONSTRAINT "Tenancy_roomListingId_fkey" FOREIGN KEY ("roomListingId") REFERENCES "RoomListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
