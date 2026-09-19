import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ResidencesDirectoryView from "@/components/residences/residences-directory-view";

export const dynamic = "force-dynamic";

export default async function PublicResidencesDirectoryPage() {
  const properties = await prisma.property.findMany({
    where: { status: "VERIFIED" },
    orderBy: { createdAt: "desc" },
    include: {
      landlord: {
        select: {
          name: true,
          surname: true,
          landlordProfile: { select: { companyName: true, entityType: true } },
        },
      },
      roomListings: { select: { availableUnits: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#005F56] bg-[#005F56]/10 px-2.5 py-0.5 rounded-md border border-[#005F56]/20">
                Public Directory
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {properties.length} Residence{properties.length !== 1 ? "s" : ""} Listed
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Student Housing Residences
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Accredited and verified student housing accommodations across South Africa with interactive campus proximity.
            </p>
          </div>

          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Home
          </Link>
        </div>

        {/* Directory View with Grid and Interactive Map Explorer */}
        <ResidencesDirectoryView properties={properties as any} />
      </div>
    </div>
  );
}
