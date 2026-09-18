"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuBuilding2,
  LuMapPin,
  LuShieldCheck,
  LuCheck,
  LuUpload,
  LuSparkles,
  LuChevronLeft,
  LuDollarSign,
  LuBed,
  LuUsers,
  LuInfo,
  LuZap,
  LuFlame,
  LuLock,
  LuFileText,
  LuEye,
  LuTrash2,
  LuPlus,
  LuCopy,
  LuChevronDown,
  LuChevronUp,
  LuImage,
  LuBath,
  LuLayers,
  LuSlidersHorizontal,
} from "react-icons/lu";
import { STANDARD_CHECKLIST, calculateSafetyScore, type ChecklistTemplateItem } from "@/lib/safety";

export interface RoomTypeItem {
  id: string;
  name: string;
  type:
    | "SINGLE_STANDARD"
    | "SINGLE_ENSUITE"
    | "DOUBLE_SHARING"
    | "TRIPLE_SHARING"
    | "QUAD_SHARING"
    | "STUDIO_BACHELOR"
    | "ONE_BED_APARTMENT"
    | "CUSTOM";
  quantity: number;
  bedsPerRoom: number;
  bathroomType: "ENSUITE" | "SHARED_1_2" | "SHARED_COMMUNAL";
  monthlyPrice: number;
  deposit: number;
  sizeSqm?: string;
  isNsfasCapped: boolean;
  availabilityStatus: "AVAILABLE_NOW" | "NEXT_SEMESTER" | "LIMITED_BEDS" | "WAITLIST";
  features: string[];
  photos: string[];
  isExpanded?: boolean;
}

export const ROOM_FEATURE_OPTIONS = [
  { id: "FURNISHED_BED", label: "Bed & Quality Mattress", icon: "🛏️" },
  { id: "STUDY_DESK", label: "Study Desk & Ergonomic Chair", icon: "📝" },
  { id: "WARDROBE", label: "Lockable Fitted Wardrobe", icon: "🚪" },
  { id: "MINI_FRIDGE", label: "In-Room Mini / Bar Fridge", icon: "🧊" },
  { id: "AIRCON_HEATER", label: "Air Conditioning / Wall Heater", icon: "❄️" },
  { id: "BALCONY", label: "Private Balcony / View", icon: "🌅" },
  { id: "PREPAID_ELEC", label: "Prepaid Electricity Meter", icon: "⚡" },
  { id: "WIFI_AP", label: "High-Speed WiFi / Ethernet AP", icon: "📶" },
  { id: "KEYLESS_LOCK", label: "Smart Keyless Lock", icon: "🔐" },
  { id: "ENSUITE_BATH", label: "Private Ensuite Bathroom", icon: "🚿" },
];

export const ROOM_TYPE_PRESETS = [
  {
    name: "Commune Standard (Singles + Doubles)",
    description: "Balanced mix of private singles and affordable sharing rooms",
    rooms: [
      {
        id: "preset-1",
        name: "Standard Private Single",
        type: "SINGLE_STANDARD" as const,
        quantity: 2,
        bedsPerRoom: 1,
        bathroomType: "SHARED_1_2" as const,
        monthlyPrice: 4900,
        deposit: 4900,
        sizeSqm: "14",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW" as const,
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
        photos: [],
        isExpanded: true,
      },
      {
        id: "preset-2",
        name: "Deluxe Single Ensuite",
        type: "SINGLE_ENSUITE" as const,
        quantity: 1,
        bedsPerRoom: 1,
        bathroomType: "ENSUITE" as const,
        monthlyPrice: 5600,
        deposit: 5600,
        sizeSqm: "18",
        isNsfasCapped: false,
        availabilityStatus: "AVAILABLE_NOW" as const,
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "ENSUITE_BATH", "MINI_FRIDGE", "WIFI_AP"],
        photos: [],
        isExpanded: false,
      },
      {
        id: "preset-3",
        name: "2-Sharing Double Room",
        type: "DOUBLE_SHARING" as const,
        quantity: 2,
        bedsPerRoom: 2,
        bathroomType: "SHARED_COMMUNAL" as const,
        monthlyPrice: 4200,
        deposit: 4200,
        sizeSqm: "22",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW" as const,
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
        photos: [],
        isExpanded: false,
      },
    ],
  },
  {
    name: "Purpose-Built Block (Ensuite & Studios)",
    description: "High-density private and semi-private student accommodation",
    rooms: [
      {
        id: "preset-pb-1",
        name: "Ensuite Single Studio Room",
        type: "SINGLE_ENSUITE" as const,
        quantity: 6,
        bedsPerRoom: 1,
        bathroomType: "ENSUITE" as const,
        monthlyPrice: 5800,
        deposit: 5800,
        sizeSqm: "16",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW" as const,
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "ENSUITE_BATH", "WIFI_AP", "PREPAID_ELEC"],
        photos: [],
        isExpanded: true,
      },
      {
        id: "preset-pb-2",
        name: "2-Sharing Ensuite Cluster",
        type: "DOUBLE_SHARING" as const,
        quantity: 4,
        bedsPerRoom: 2,
        bathroomType: "ENSUITE" as const,
        monthlyPrice: 4600,
        deposit: 4600,
        sizeSqm: "24",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW" as const,
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "ENSUITE_BATH", "WIFI_AP"],
        photos: [],
        isExpanded: false,
      },
    ],
  },
  {
    name: "NSFAS Capped Direct Residence",
    description: "Optimized for maximum student placement matching national funding caps",
    rooms: [
      {
        id: "preset-nsfas-1",
        name: "NSFAS Direct 2-Sharing Bed",
        type: "DOUBLE_SHARING" as const,
        quantity: 4,
        bedsPerRoom: 2,
        bathroomType: "SHARED_COMMUNAL" as const,
        monthlyPrice: 4500,
        deposit: 0,
        sizeSqm: "20",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW" as const,
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
        photos: [],
        isExpanded: true,
      },
      {
        id: "preset-nsfas-2",
        name: "NSFAS Single Room",
        type: "SINGLE_STANDARD" as const,
        quantity: 2,
        bedsPerRoom: 1,
        bathroomType: "SHARED_1_2" as const,
        monthlyPrice: 5000,
        deposit: 0,
        sizeSqm: "15",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW" as const,
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
        photos: [],
        isExpanded: false,
      },
    ],
  },
];

interface ResidenceBuilderPageProps {
  user: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
}

const SA_UNIVERSITIES = [
  {
    name: "University of the Witwatersrand (Wits)",
    campuses: ["Braamfontein East", "Braamfontein West", "Parktown Education", "Parktown Medical"],
  },
  {
    name: "University of Johannesburg (UJ)",
    campuses: ["Auckland Park Kingsway (APK)", "Auckland Park Bunting (APB)", "Doornfontein (DFC)", "Soweto (SWC)"],
  },
  {
    name: "University of Cape Town (UCT)",
    campuses: ["Upper Campus", "Middle & Lower Campus", "Hiddingh", "Health Sciences (Observatory)"],
  },
  {
    name: "University of Pretoria (UP)",
    campuses: ["Hatfield", "Hillcrest", "Groenkloof", "Prinshof (Medical)", "Mamelodi"],
  },
  {
    name: "Stellenbosch University (SU)",
    campuses: ["Stellenbosch Main", "Tygerberg (Medical)", "Bellville Park"],
  },
  {
    name: "Tshwane University of Technology (TUT)",
    campuses: ["Pretoria Main", "Arcadia", "Arts Campus", "Ga-Rankuwa", "Soshanguve"],
  },
  {
    name: "University of KwaZulu-Natal (UKZN)",
    campuses: ["Howard College", "Westville", "Pietermaritzburg", "Nelson R Mandela Medical"],
  },
  {
    name: "Nelson Mandela University (NMU)",
    campuses: ["Gqeberha South Campus", "North Campus", "Second Avenue", "Missionvale", "George"],
  },
  {
    name: "Other Institution / College",
    campuses: ["Main Campus"],
  },
];

const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

const AMENITY_CATEGORIES = [
  {
    category: "Power & Load-Shedding",
    items: [
      { id: "BACKUP_POWER", label: "Solar Inverter / Battery UPS (WiFi & Lighting during load-shedding)", icon: "⚡" },
      { id: "GENERATOR", label: "Full Complex Backup Diesel Generator", icon: "🔋" },
    ],
  },
  {
    category: "Water & Utilities",
    items: [
      { id: "BACKUP_WATER", label: "Backup JoJo Water Tanks + Pressure Pump", icon: "💧" },
      { id: "SOLAR_GEYSER", label: "Solar / Heat Pump Hot Water System", icon: "☀️" },
      { id: "WATER_INCLUDED", label: "Water Included in Monthly Rent", icon: "🚿" },
      { id: "ELEC_INCLUDED", label: "Electricity / Monthly Power Quota Included", icon: "💡" },
    ],
  },
  {
    category: "Connectivity & Study",
    items: [
      { id: "WIFI", label: "Uncapped High-Speed Fibre WiFi (100Mbps+)", icon: "📶" },
      { id: "STUDY_ROOM", label: "Dedicated Quiet Study Center with Power Sockets", icon: "📚" },
      { id: "COMPUTER_LAB", label: "Student Computer Lab & Printing Station", icon: "💻" },
    ],
  },
  {
    category: "Security & Access Control",
    items: [
      { id: "BIOMETRIC", label: "Biometric Fingerprint / Facial Recognition Access Control", icon: "🔒" },
      { id: "CCTV", label: "24/7 Monitored CCTV Surveillance System", icon: "📹" },
      { id: "ARMED_RESPONSE", label: "Electric Perimeter Fencing & Armed Response Link", icon: "🚨" },
      { id: "GUARD_SECURITY", label: "24-Hour On-Site Security Guard / Caretaker", icon: "👮" },
    ],
  },
  {
    category: "Living, Furnishings & Facilities",
    items: [
      { id: "FURNISHED", label: "Fully Furnished (Bed, Study Desk, Chair, Lockable Wardrobe)", icon: "🛏️" },
      { id: "LAUNDRY", label: "On-Site Laundry Machines (Washers & Dryers)", icon: "🧺" },
      { id: "KITCHEN_COMMUNAL", label: "Fully Equipped Communal Kitchen (Stoves, Microwaves, Fridges)", icon: "🍳" },
      { id: "TV_LOUNGE", label: "Student Social Lounge / TV Room (DSTV/Netflix)", icon: "📺" },
      { id: "OUTDOOR_BRAAI", label: "Outdoor Courtyard / Braai Area", icon: "🍖" },
      { id: "FITNESS_GYM", label: "On-Site Student Gym / Fitness Room", icon: "🏋️" },
    ],
  },
];

export default function ResidenceBuilderPage({ user }: ResidenceBuilderPageProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Active Tab View within Builder
  const [activeTab, setActiveTab] = useState<"basics" | "capacity" | "amenities" | "safety" | "media">("basics");

  // Basic Info Form State
  const [basics, setBasics] = useState({
    title: "",
    buildingType: "STUDENT_BLOCK", // STUDENT_BLOCK, COMMUNE, COMPLEX, HOSTEL
    institution: SA_UNIVERSITIES[0].name,
    campus: SA_UNIVERSITIES[0].campuses[0],
    distanceToCampus: "0.8",
    transitMode: "WALKING", // WALKING, SHUTTLE, TAXI
    streetAddress: "",
    suburb: "",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "",
    description: "",
  });

  // Room Configuration & Capacity State
  const [rooms, setRooms] = useState<RoomTypeItem[]>([
    {
      id: "room-1",
      name: "Standard Private Single",
      type: "SINGLE_STANDARD",
      quantity: 2,
      bedsPerRoom: 1,
      bathroomType: "SHARED_1_2",
      monthlyPrice: 5200,
      deposit: 5200,
      sizeSqm: "14",
      isNsfasCapped: true,
      availabilityStatus: "AVAILABLE_NOW",
      features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
      photos: [],
      isExpanded: true,
    },
    {
      id: "room-2",
      name: "2-Sharing Double Room",
      type: "DOUBLE_SHARING",
      quantity: 4,
      bedsPerRoom: 2,
      bathroomType: "SHARED_COMMUNAL",
      monthlyPrice: 4600,
      deposit: 4600,
      sizeSqm: "22",
      isNsfasCapped: true,
      availabilityStatus: "AVAILABLE_NOW",
      features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
      photos: [],
      isExpanded: false,
    },
  ]);

  const [totalBathrooms, setTotalBathrooms] = useState("3");
  const [generalDeposit, setGeneralDeposit] = useState("4600");
  const [nsfasEligible, setNsfasEligible] = useState(true);
  const [uploadingRoomPhotoId, setUploadingRoomPhotoId] = useState<string | null>(null);

  // Dynamic Building Capacity Metrics
  const buildingMetrics = useMemo(() => {
    let totalBeds = 0;
    let totalBedrooms = 0;
    let grossRevenue = 0;
    let minPrice = Infinity;
    let maxPrice = 0;

    rooms.forEach((r) => {
      const q = Number(r.quantity) || 0;
      const b = Number(r.bedsPerRoom) || 1;
      const beds = q * b;
      const price = Number(r.monthlyPrice) || 0;

      totalBeds += beds;
      totalBedrooms += q;
      grossRevenue += beds * price;

      if (price > 0) {
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
      }
    });

    if (minPrice === Infinity) minPrice = 0;

    return {
      totalBeds: Math.max(1, totalBeds),
      totalBedrooms: Math.max(1, totalBedrooms),
      grossRevenue,
      minPrice,
      maxPrice: maxPrice || minPrice,
      roomCount: rooms.length,
    };
  }, [rooms]);

  const addRoom = () => {
    const newId = `room-${Date.now()}`;
    setRooms((prev) => [
      ...prev,
      {
        id: newId,
        name: `Room Type ${prev.length + 1}`,
        type: "SINGLE_STANDARD",
        quantity: 1,
        bedsPerRoom: 1,
        bathroomType: "SHARED_1_2",
        monthlyPrice: 4800,
        deposit: 4800,
        sizeSqm: "15",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW",
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
        photos: [],
        isExpanded: true,
      },
    ]);
  };

  const duplicateRoom = (id: string) => {
    const existing = rooms.find((r) => r.id === id);
    if (!existing) return;
    const newId = `room-${Date.now()}`;
    const copy: RoomTypeItem = {
      ...existing,
      id: newId,
      name: `${existing.name} (Copy)`,
      photos: [...existing.photos],
      features: [...existing.features],
      isExpanded: true,
    };
    setRooms((prev) => [...prev, copy]);
  };

  const removeRoom = (id: string) => {
    if (rooms.length <= 1) {
      setError("At least one room configuration is required for student listings.");
      return;
    }
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRoom = (id: string, partial: Partial<RoomTypeItem>) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...partial } : r))
    );
  };

  const toggleRoomFeature = (roomId: string, featureId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const exists = r.features.includes(featureId);
        return {
          ...r,
          features: exists
            ? r.features.filter((f) => f !== featureId)
            : [...r.features, featureId],
        };
      })
    );
  };

  const toggleRoomExpand = (id: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isExpanded: !r.isExpanded } : r))
    );
  };

  const applyPreset = (preset: typeof ROOM_TYPE_PRESETS[0]) => {
    setRooms(
      preset.rooms.map((r, i) => ({
        ...r,
        id: `preset-${Date.now()}-${i}`,
        photos: [],
      }))
    );
  };

  const handleRoomPhotoUpload = async (
    roomId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRoomPhotoId(roomId);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "property");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload room photo");
      }

      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId ? { ...r, photos: [...r.photos, data.url] } : r
        )
      );

      setPhotos((prev) => (prev.includes(data.url) ? prev : [...prev, data.url]));
    } catch (err: any) {
      setError(err.message || "Room photo upload failed");
    } finally {
      setUploadingRoomPhotoId(null);
    }
  };

  const removeRoomPhoto = (roomId: string, photoIdx: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          photos: r.photos.filter((_, i) => i !== photoIdx),
        };
      })
    );
  };

  // Selected Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "BACKUP_POWER",
    "BACKUP_WATER",
    "WIFI",
    "STUDY_ROOM",
    "BIOMETRIC",
    "CCTV",
    "FURNISHED",
    "LAUNDRY",
    "WATER_INCLUDED",
  ]);

  // 13-Point Checklist State
  const [checklistAnswers, setChecklistAnswers] = useState<
    Array<{
      category: ChecklistTemplateItem["category"];
      label: string;
      weight: number;
      passed: boolean | null;
      notes?: string;
    }>
  >(
    STANDARD_CHECKLIST.map((item) => ({
      category: item.category,
      label: item.label,
      weight: item.weight,
      passed: true,
      notes: "",
    }))
  );

  // Media and Document State
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Live Safety Score Calculation
  const liveSafetyScore = useMemo(() => {
    return calculateSafetyScore(checklistAnswers);
  }, [checklistAnswers]);

  // Selected University Campuses
  const currentUniversityCampuses = useMemo(() => {
    const uni = SA_UNIVERSITIES.find((u) => u.name === basics.institution);
    return uni ? uni.campuses : ["Main Campus"];
  }, [basics.institution]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const setChecklistAnswer = (index: number, passed: boolean) => {
    setChecklistAnswers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], passed };
      return updated;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "property");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setPhotos((prev) => [...prev, data.url]);
    } catch (err: any) {
      setError(err.message || "Photo upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Validation
  const isBasicsValid =
    basics.title.trim().length > 0 &&
    basics.streetAddress.trim().length > 0 &&
    basics.suburb.trim().length > 0 &&
    basics.city.trim().length > 0;

  const isCapacityValid =
    rooms.length > 0 &&
    rooms.every(
      (r) => Number(r.quantity) >= 1 && Number(r.monthlyPrice) > 0 && Number(r.bedsPerRoom) >= 1
    );

  const isFormValid = isBasicsValid && isCapacityValid;

  const handlePublish = async () => {
    if (!isFormValid) {
      setError("Please fill in all mandatory residence basics and room configurations.");
      if (!isBasicsValid) setActiveTab("basics");
      else if (!isCapacityValid) setActiveTab("capacity");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const basePrice = buildingMetrics.minPrice || 4800;

      // Build structured room summary text for description
      const roomSummaryLines = rooms.map((r) => {
        const typeLabel =
          r.type === "SINGLE_STANDARD"
            ? "Single Room (Private)"
            : r.type === "SINGLE_ENSUITE"
            ? "Single Room (Ensuite)"
            : r.type === "DOUBLE_SHARING"
            ? "2-Sharing (Double)"
            : r.type === "TRIPLE_SHARING"
            ? "3-Sharing (Triple)"
            : r.type === "QUAD_SHARING"
            ? "4-Sharing (Quad)"
            : r.type === "STUDIO_BACHELOR"
            ? "Studio / Bachelor"
            : r.type === "ONE_BED_APARTMENT"
            ? "1-Bed Apartment"
            : "Custom Room";

        const bathLabel =
          r.bathroomType === "ENSUITE"
            ? "Private Ensuite"
            : r.bathroomType === "SHARED_1_2"
            ? "Shared (1:2)"
            : "Communal Bath";

        return `• ${r.name || typeLabel} (${typeLabel}, ${bathLabel}): R${Number(
          r.monthlyPrice
        ).toLocaleString()}/mo per bed (${r.quantity} room${
          r.quantity > 1 ? "s" : ""
        }, ${r.quantity * r.bedsPerRoom} total beds)${
          r.isNsfasCapped ? " [NSFAS Accredited Cap]" : ""
        }`;
      });

      const detailedDescription = basics.description
        ? `${basics.description}\n\n🏠 Room Configurations & Rates:\n${roomSummaryLines.join(
            "\n"
          )}`
        : `Accredited student housing located in ${basics.suburb}, ${Number(
            basics.distanceToCampus
          )}km from ${basics.institution} (${basics.campus}).\n\n🏠 Room Configurations & Rates:\n${roomSummaryLines.join(
            "\n"
          )}`;

      // Collect all room photos and property photos
      const allRoomPhotos = rooms.flatMap((r) => r.photos);
      const combinedPhotos = Array.from(new Set([...photos, ...allRoomPhotos]));

      const payload = {
        title: basics.title,
        address: `${basics.streetAddress}${basics.postalCode ? `, ${basics.postalCode}` : ""}`,
        suburb: basics.suburb,
        city: basics.city,
        priceMonthly: basePrice,
        depositAmount: generalDeposit ? Number(generalDeposit) : undefined,
        bedrooms: buildingMetrics.totalBedrooms,
        bathrooms: totalBathrooms ? Number(totalBathrooms) : 1,
        maxOccupants: buildingMetrics.totalBeds,
        description: detailedDescription,
        amenities: selectedAmenities,
        distanceToCampus: basics.distanceToCampus ? Number(basics.distanceToCampus) : undefined,
        images: combinedPhotos,
        checklistAnswers,
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Failed to create residence listing");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/landlord/properties");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create residence listing.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-poppins">
      
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/landlord/properties"
              className="text-xs font-semibold text-[#64748B] hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <LuChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Residences</span>
            </Link>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              New Residence Listing
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {basics.title ? basics.title : "Register Student Residence"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure residence infrastructure, capacity, NSFAS/bursary pricing, and 13-point safety accreditation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 px-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Safety Rating
            </span>
            <span className="text-base font-extrabold text-emerald-700">
              {liveSafetyScore !== null ? `${liveSafetyScore.toFixed(1)} / 10` : "-- / 10"}
            </span>
          </div>

          <button
            type="button"
            disabled={saving || success}
            onClick={handlePublish}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : success ? (
              <>
                <LuCheck className="w-4 h-4" />
                <span>Listing Published!</span>
              </>
            ) : (
              <>
                <LuSparkles className="w-4 h-4" />
                <span>Publish Accredited Residence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
          <LuInfo className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: "basics" as const, label: "1. Identity & Location", icon: <LuBuilding2 className="w-3.5 h-3.5" /> },
          { id: "capacity" as const, label: "2. Capacity & Rates", icon: <LuBed className="w-3.5 h-3.5" /> },
          { id: "amenities" as const, label: "3. Living Amenities", icon: <LuZap className="w-3.5 h-3.5" /> },
          { id: "safety" as const, label: "4. 13-Point Safety Audit", icon: <LuShieldCheck className="w-3.5 h-3.5" /> },
          { id: "media" as const, label: "5. Photos & Compliance", icon: <LuUpload className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: IDENTITY & LOCATION ================= */}
      {activeTab === "basics" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900">Residence Identity &amp; Institution Proximity</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Specify your property&apos;s title, classification, and targeted university campuses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Residence / Building Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={basics.title}
                onChange={(e) => setBasics({ ...basics, title: e.target.value })}
                placeholder="e.g. Apex Student Manor, Braamfontein Loft"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Property Classification
              </label>
              <select
                value={basics.buildingType}
                onChange={(e) => setBasics({ ...basics, buildingType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
              >
                <option value="STUDENT_BLOCK">Dedicated Student Apartment Block</option>
                <option value="COMMUNE">Accredited Student Commune / House</option>
                <option value="COMPLEX">Multi-Unit Residential Complex</option>
                <option value="HOSTEL">Full Student Residence / Hostel</option>
              </select>
            </div>
          </div>

          {/* Institution Selection */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Campus Proximity &amp; Transit Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target Higher Education Institution
                </label>
                <select
                  value={basics.institution}
                  onChange={(e) => {
                    const uni = SA_UNIVERSITIES.find((u) => u.name === e.target.value);
                    setBasics({
                      ...basics,
                      institution: e.target.value,
                      campus: uni ? uni.campuses[0] : "Main Campus",
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
                >
                  {SA_UNIVERSITIES.map((u) => (
                    <option key={u.name} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nearest Campus / Faculty Location
                </label>
                <select
                  value={basics.campus}
                  onChange={(e) => setBasics({ ...basics, campus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
                >
                  {currentUniversityCampuses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Distance to Campus Gates (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={basics.distanceToCampus}
                  onChange={(e) => setBasics({ ...basics, distanceToCampus: e.target.value })}
                  placeholder="e.g. 0.8"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Primary Commute Access
                </label>
                <select
                  value={basics.transitMode}
                  onChange={(e) => setBasics({ ...basics, transitMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
                >
                  <option value="WALKING">Safe Walking Distance (&lt; 1.5 km)</option>
                  <option value="SHUTTLE">Official University Shuttle Route Stop</option>
                  <option value="TAXI">Public Transit / Rea Vaya / MyCiTi (&lt; 300m)</option>
                  <option value="PRIVATE_SHUTTLE">Residence-Operated Private Shuttle</option>
                </select>
              </div>
            </div>
          </div>

          {/* Physical Address Details */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Physical Location &amp; Postal Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Street Address &amp; Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={basics.streetAddress}
                    onChange={(e) => setBasics({ ...basics, streetAddress: e.target.value })}
                    placeholder="e.g. 45 Juta Street, Braamfontein"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                  />
                  <LuMapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Suburb / Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={basics.suburb}
                  onChange={(e) => setBasics({ ...basics, suburb: e.target.value })}
                  placeholder="e.g. Braamfontein, Auckland Park, Hatfield"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={basics.city}
                  onChange={(e) => setBasics({ ...basics, city: e.target.value })}
                  placeholder="e.g. Johannesburg, Cape Town, Pretoria"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Province
                </label>
                <select
                  value={basics.province}
                  onChange={(e) => setBasics({ ...basics, province: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
                >
                  {SA_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={basics.postalCode}
                  onChange={(e) => setBasics({ ...basics, postalCode: e.target.value })}
                  placeholder="e.g. 2001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveTab("capacity")}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Continue to Capacity &amp; Rates →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CAPACITY & RATES (ROBUST ROOM LISTING) ================= */}
      {activeTab === "capacity" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-7">
          
          {/* Header & Overview */}
          <div className="border-b border-gray-100 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Step 2: Room Inventory
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-gray-500">
                  {rooms.length} Room Type{rooms.length !== 1 ? "s" : ""} Configured
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Room Configurations &amp; Student Rates</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Add distinct room types, upload interior room photos, configure per-bed rental rates, and tag NSFAS allowances.
              </p>
            </div>

            {/* Quick Templates Dropdown / Popover Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1">
                <LuSparkles className="w-3 h-3 text-emerald-600" /> Presets:
              </span>
              {ROOM_TYPE_PRESETS.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  title={preset.description}
                  className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-white hover:bg-emerald-50 hover:text-emerald-700 rounded-lg border border-gray-200 shadow-2xs transition-all cursor-pointer"
                >
                  {preset.name.split(" ")[0]} Mix
                </button>
              ))}
            </div>
          </div>

          {/* Live Building Capacity Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-[#E2E8F0]">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                <LuBed className="w-3.5 h-3.5 text-emerald-600" /> Total Student Beds
              </span>
              <span className="text-xl font-black text-gray-900 block">
                {buildingMetrics.totalBeds} Beds
              </span>
              <span className="text-[10px] text-gray-400">Summed from all units</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                <LuLayers className="w-3.5 h-3.5 text-blue-600" /> Bedroom Units
              </span>
              <span className="text-xl font-black text-gray-900 block">
                {buildingMetrics.totalBedrooms} Rooms
              </span>
              <span className="text-[10px] text-gray-400">{rooms.length} unique room layout{rooms.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                <LuDollarSign className="w-3.5 h-3.5 text-emerald-600" /> Base Starting Rent
              </span>
              <span className="text-xl font-black text-emerald-700 block">
                R {buildingMetrics.minPrice.toLocaleString()}
                <span className="text-[11px] font-normal text-gray-500"> / bed</span>
              </span>
              <span className="text-[10px] text-gray-400">Lowest rate per student</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
                <LuUsers className="w-3.5 h-3.5 text-purple-600" /> Gross Potential
              </span>
              <span className="text-xl font-black text-gray-900 block">
                R {buildingMetrics.grossRevenue.toLocaleString()}
                <span className="text-[11px] font-normal text-gray-500"> / mo</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% full capacity</span>
            </div>
          </div>

          {/* Rooms List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <LuSlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                Configured Room Types &amp; Inclusions ({rooms.length})
              </h3>
              <button
                type="button"
                onClick={addRoom}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer border border-emerald-200"
              >
                <LuPlus className="w-3.5 h-3.5" />
                <span>+ Add Room Type</span>
              </button>
            </div>

            {/* Individual Room Cards */}
            <div className="space-y-4">
              {rooms.map((room, idx) => {
                const totalBedsInThisType = (Number(room.quantity) || 1) * (Number(room.bedsPerRoom) || 1);
                const isUploading = uploadingRoomPhotoId === room.id;

                return (
                  <div
                    key={room.id}
                    className="rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-all shadow-xs overflow-hidden"
                  >
                    {/* Room Card Header Strip */}
                    <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-gray-900">
                              {room.name || `Room Type ${idx + 1}`}
                            </h4>
                            {room.isNsfasCapped && (
                              <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                                NSFAS Cap Aligned
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {room.quantity} unit{room.quantity > 1 ? "s" : ""} • {totalBedsInThisType} total bed{totalBedsInThisType > 1 ? "s" : ""} • {room.bathroomType.replace("_", " ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-gray-900 block">
                            R {Number(room.monthlyPrice || 0).toLocaleString()}
                            <span className="text-[10px] font-normal text-gray-500"> / bed</span>
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            Deposit: R{Number(room.deposit || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                          <button
                            type="button"
                            onClick={() => duplicateRoom(room.id)}
                            title="Duplicate this room configuration"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 transition-colors cursor-pointer"
                          >
                            <LuCopy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeRoom(room.id)}
                            disabled={rooms.length <= 1}
                            title={rooms.length <= 1 ? "At least 1 room type required" : "Remove this room configuration"}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleRoomExpand(room.id)}
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200/60 transition-colors cursor-pointer ml-1"
                          >
                            {room.isExpanded ? (
                              <LuChevronUp className="w-4 h-4" />
                            ) : (
                              <LuChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Room Card Expanded Body */}
                    {room.isExpanded && (
                      <div className="p-5 space-y-5">
                        
                        {/* Primary Room Attributes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Room Type Title / Identifier <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={room.name}
                              onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                              placeholder="e.g. Deluxe Single Ensuite, Room 101 Standard"
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Room Layout Category
                            </label>
                            <select
                              value={room.type}
                              onChange={(e) => {
                                const newType = e.target.value as RoomTypeItem["type"];
                                let defaultBeds = room.bedsPerRoom;
                                if (newType === "SINGLE_STANDARD" || newType === "SINGLE_ENSUITE" || newType === "STUDIO_BACHELOR" || newType === "ONE_BED_APARTMENT") {
                                  defaultBeds = 1;
                                } else if (newType === "DOUBLE_SHARING") {
                                  defaultBeds = 2;
                                } else if (newType === "TRIPLE_SHARING") {
                                  defaultBeds = 3;
                                } else if (newType === "QUAD_SHARING") {
                                  defaultBeds = 4;
                                }
                                updateRoom(room.id, {
                                  type: newType,
                                  bedsPerRoom: defaultBeds,
                                  bathroomType: newType === "SINGLE_ENSUITE" || newType === "STUDIO_BACHELOR" ? "ENSUITE" : room.bathroomType,
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                            >
                              <option value="SINGLE_STANDARD">Single Room (Standard Private)</option>
                              <option value="SINGLE_ENSUITE">Single Room (Private Ensuite)</option>
                              <option value="DOUBLE_SHARING">2-Sharing (Double Room)</option>
                              <option value="TRIPLE_SHARING">3-Sharing (Triple Room)</option>
                              <option value="QUAD_SHARING">4-Sharing (Quad Room / Dorm)</option>
                              <option value="STUDIO_BACHELOR">Bachelor / Studio Flatlet</option>
                              <option value="ONE_BED_APARTMENT">1-Bedroom Flatlet</option>
                              <option value="CUSTOM">Custom Room Category</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Number of Identical Units <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min={1}
                              required
                              value={room.quantity}
                              onChange={(e) => updateRoom(room.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">Units with this layout</span>
                          </div>
                        </div>

                        {/* Secondary Attributes: Pricing, Beds, Bath, Size */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Beds Per Unit
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={room.bedsPerRoom}
                              onChange={(e) => updateRoom(room.id, { bedsPerRoom: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                            <span className="text-[10px] text-gray-400 mt-0.5 block">e.g. 1 (Single) or 2 (Sharing)</span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Monthly Rental Rate per Bed (ZAR) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">R</span>
                              <input
                                type="number"
                                step="10"
                                min={1}
                                required
                                value={room.monthlyPrice}
                                onChange={(e) => updateRoom(room.id, { monthlyPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                                placeholder="4800"
                                className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Security Deposit (ZAR)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">R</span>
                              <input
                                type="number"
                                step="10"
                                min={0}
                                value={room.deposit}
                                onChange={(e) => updateRoom(room.id, { deposit: Math.max(0, parseFloat(e.target.value) || 0) })}
                                placeholder="4800"
                                className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Bathroom Arrangement
                            </label>
                            <select
                              value={room.bathroomType}
                              onChange={(e) => updateRoom(room.id, { bathroomType: e.target.value as RoomTypeItem["bathroomType"] })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                            >
                              <option value="ENSUITE">Private In-Room Ensuite</option>
                              <option value="SHARED_1_2">Semi-Private (Shared 1:2)</option>
                              <option value="SHARED_COMMUNAL">Communal Floor Bathrooms</option>
                            </select>
                          </div>
                        </div>

                        {/* Tertiary Attributes: NSFAS, Availability, Size */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Room Floor Area (Optional)
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={room.sizeSqm || ""}
                                onChange={(e) => updateRoom(room.id, { sizeSqm: e.target.value })}
                                placeholder="e.g. 16"
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              />
                              <span className="absolute right-3 top-2 text-[11px] text-gray-400 font-medium">m²</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                              Current Availability Status
                            </label>
                            <select
                              value={room.availabilityStatus}
                              onChange={(e) => updateRoom(room.id, { availabilityStatus: e.target.value as RoomTypeItem["availabilityStatus"] })}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                            >
                              <option value="AVAILABLE_NOW">Available Immediately</option>
                              <option value="NEXT_SEMESTER">Available Next Academic Semester</option>
                              <option value="LIMITED_BEDS">Limited Beds Remaining</option>
                              <option value="WAITLIST">Waitlist Only</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <div>
                              <span className="text-xs font-bold text-gray-900 block">NSFAS Allowance Cap</span>
                              <span className="text-[10px] text-gray-500 block">Aligned with DHET grant rate</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={room.isNsfasCapped}
                              onChange={(e) => updateRoom(room.id, { isNsfasCapped: e.target.checked })}
                              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* In-Room Inclusions & Features */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                            In-Room Furnishings &amp; Included Features
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {ROOM_FEATURE_OPTIONS.map((feat) => {
                              const isChecked = room.features.includes(feat.id);
                              return (
                                <button
                                  key={feat.id}
                                  type="button"
                                  onClick={() => toggleRoomFeature(room.id, feat.id)}
                                  className={`flex items-center gap-2 p-2 rounded-xl border text-left text-[11px] font-medium transition-all cursor-pointer ${
                                    isChecked
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500/20 font-semibold"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                  }`}
                                >
                                  <span className="text-sm shrink-0">{feat.icon}</span>
                                  <span className="truncate flex-1">{feat.label}</span>
                                  {isChecked && <LuCheck className="w-3 h-3 text-emerald-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Room-Specific Photos Gallery */}
                        <div className="pt-3 border-t border-gray-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                <LuImage className="w-3.5 h-3.5 text-emerald-600" />
                                Interior Photos for this Room ({room.photos.length})
                              </span>
                              <span className="text-[11px] text-gray-400 block">
                                Upload pictures of the bed, study workspace, wardrobe, and ensuite.
                              </span>
                            </div>

                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                              <LuUpload className="w-3.5 h-3.5" />
                              <span>{isUploading ? "Uploading..." : "+ Add Room Photo"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleRoomPhotoUpload(room.id, e)}
                                disabled={isUploading}
                                className="sr-only"
                              />
                            </label>
                          </div>

                          {room.photos.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-center">
                              <p className="text-[11px] text-gray-400">
                                No room photos uploaded yet. High quality room photos increase student applications by 78%.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                              {room.photos.map((url, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-square bg-gray-100"
                                >
                                  <img
                                    src={url}
                                    alt={`${room.name} photo ${pIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeRoomPhoto(room.id, pIdx)}
                                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                                  >
                                    <LuTrash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Room Type Button */}
            <button
              type="button"
              onClick={addRoom}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/70 text-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LuPlus className="w-4 h-4 text-emerald-600" />
              <span>+ Add Another Room Configuration / Unit</span>
            </button>
          </div>

          {/* Building-Wide Bathroom & Security Deposit Settings */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Building-Wide Facilities &amp; NSFAS Direct Scheme
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Total Residence Bathrooms
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={totalBathrooms}
                    onChange={(e) => setTotalBathrooms(e.target.value)}
                    placeholder="3"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-900 bg-white font-bold"
                  />
                  <LuBath className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Toilets / Showers across the property</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Standard Security Deposit (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">R</span>
                  <input
                    type="number"
                    step="10"
                    value={generalDeposit}
                    onChange={(e) => setGeneralDeposit(e.target.value)}
                    placeholder="4600"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-900 bg-white font-bold"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Refundable student deposit</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Accept NSFAS Direct</span>
                  <span className="text-[10px] text-gray-500 block">Direct institutional disbursement</span>
                </div>
                <input
                  type="checkbox"
                  checked={nsfasEligible}
                  onChange={(e) => setNsfasEligible(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("basics")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
            >
              ← Back to Identity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("amenities")}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Continue to Living Amenities →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LIVING AMENITIES ================= */}
      {activeTab === "amenities" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900">Student Living Amenities &amp; Resilience</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select all verified facilities included with accommodation rent.
            </p>
          </div>

          <div className="space-y-6">
            {AMENITY_CATEGORIES.map((group) => (
              <div key={group.category} className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {group.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.items.map((item) => {
                    const isSelected = selectedAmenities.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleAmenity(item.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-500/20"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                      >
                        <span className="text-lg shrink-0">{item.icon}</span>
                        <span className="flex-1 leading-snug">{item.label}</span>
                        {isSelected && <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("capacity")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("safety")}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Continue to Safety Audit →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 4: 13-POINT SAFETY AUDIT ================= */}
      {activeTab === "safety" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">13-Point Municipal Safety Checklist</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Standardized municipal health &amp; safety inspection required for university &amp; NSFAS accreditation.
              </p>
            </div>

            {/* Live Safety Score Badge */}
            <div className="p-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center gap-3 shrink-0 shadow-sm">
              <LuShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Computed Rating
                </span>
                <span className="text-lg font-extrabold text-white">
                  {liveSafetyScore !== null ? `${liveSafetyScore.toFixed(1)} / 10` : "-- / 10"}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist Items list */}
          <div className="space-y-3">
            {checklistAnswers.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all text-xs"
              >
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block text-xs">{item.label}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    Category: {item.category.replace("_", " ")} • Priority Weight: {item.weight}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setChecklistAnswer(idx, true)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      item.passed === true
                        ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50"
                    }`}
                  >
                    <LuCheck className="w-3.5 h-3.5" /> Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setChecklistAnswer(idx, false)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      item.passed === false
                        ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-rose-50"
                    }`}
                  >
                    ✕ Fail
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("amenities")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Continue to Photos &amp; Compliance →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 5: PHOTOS & COMPLIANCE ================= */}
      {activeTab === "media" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900">Property Photos &amp; Compliance Documentation</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload verified photos of bedroom interiors, study spaces, and security perimeter.
            </p>
          </div>

          {/* Photos Upload Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Property Gallery ({photos.length} uploaded)</span>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer transition-colors">
                <LuUpload className="w-3.5 h-3.5" />
                <span>{uploadingPhoto ? "Uploading to Blob..." : "+ Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="sr-only"
                />
              </label>
            </div>

            {photos.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-2">
                <LuUpload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-600 font-semibold">No property images uploaded yet</p>
                <p className="text-[11px] text-gray-400">Upload photos of rooms, bathrooms, study desks, and security gates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-video bg-gray-100">
                    <img src={url} alt={`Residence photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Complete Bar */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LuShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs text-gray-600">
                Ready to publish. Safety Rating will be live immediately.
              </span>
            </div>

            <button
              type="button"
              disabled={saving || success || !isFormValid}
              onClick={handlePublish}
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : success ? (
                <>
                  <LuCheck className="w-4 h-4" />
                  <span>Published Successfully!</span>
                </>
              ) : (
                <>
                  <LuSparkles className="w-4 h-4" />
                  <span>Complete &amp; Publish Listing</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
