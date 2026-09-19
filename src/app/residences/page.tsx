import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPublicMediaUrl } from "@/lib/media";
import {
  LuMapPin,
  LuShieldCheck,
  LuBed,
  LuBuilding2,
  LuArrowUpRight,
  LuChevronLeft,
} from "react-icons/lu";

export const dynamic = "force-dynamic";

const FALLBACK_PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
];

export default async function PublicResidencesDirectoryPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      landlord: {
        select: { name: true, surname: true },
      },
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
              Accredited and verified student housing accommodations across South Africa.
            </p>
          </div>

          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Home
          </Link>
        </div>

        {/* Property Grid */}
        {properties.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 bg-white space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#005F56]/10 text-[#005F56] flex items-center justify-center mx-auto">
              <LuBuilding2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Residences Available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Check back soon for new student accommodation listings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p, idx) => {
              const rawImage =
                p.images && p.images.length > 0
                  ? p.images[0]
                  : FALLBACK_PROPERTY_IMAGES[idx % FALLBACK_PROPERTY_IMAGES.length];

              const image = getPublicMediaUrl(rawImage) || FALLBACK_PROPERTY_IMAGES[idx % FALLBACK_PROPERTY_IMAGES.length];

              const slug =
                p.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || p.id;

              const isNsfas =
                (p.amenities && p.amenities.includes("NSFAS_ACCREDITED")) ||
                (p.description && /nsfas accredited/i.test(p.description));

              const score = p.safetyScore ? Number(p.safetyScore).toFixed(1) : null;

              return (
                <Link
                  key={p.id}
                  href={`/residences/${slug}`}
                  className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md hover:border-[#005F56] transition-all flex flex-col"
                >
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                    <img
                      src={image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {isNsfas && (
                        <span className="px-2.5 py-1 rounded bg-[#005F56] text-white text-[10px] font-bold shadow-xs">
                          NSFAS Accredited
                        </span>
                      )}
                      {p.status === "VERIFIED" && (
                        <span className="px-2 py-1 rounded bg-white/95 text-slate-900 text-[10px] font-bold backdrop-blur-xs shadow-2xs">
                          Verified Safe
                        </span>
                      )}
                    </div>

                    {score && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-white/95 text-[#005F56] text-xs font-black backdrop-blur-xs shadow-2xs flex items-center gap-1 border border-slate-200">
                        <LuShieldCheck className="w-3.5 h-3.5" />
                        <span>{score}/10</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#005F56] transition-colors line-clamp-1">
                        {p.title}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <LuMapPin className="w-3.5 h-3.5 text-[#005F56] shrink-0" />
                        <span className="truncate">{p.address}, {p.suburb}</span>
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 font-medium text-[11px]">
                          <LuBed className="w-3.5 h-3.5 text-slate-500" />
                          <span>{p.bedrooms || 1} Rooms</span>
                        </span>

                        {p.distanceToCampus && (
                          <span className="px-2.5 py-1 rounded bg-slate-100 font-medium text-[11px]">
                            {Number(p.distanceToCampus).toFixed(1)} km to Campus
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          From
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-slate-900">
                            R {Number(p.priceMonthly).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">/ month</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#005F56]/10 group-hover:bg-[#005F56] group-hover:text-white text-[#005F56] text-xs font-bold transition-all">
                        <span>View</span>
                        <LuArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
