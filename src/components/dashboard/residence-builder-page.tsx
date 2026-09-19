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
  LuSave,
  LuChevronDown,
  LuChevronUp,
  LuImage,
  LuBath,
  LuLayers,
  LuSlidersHorizontal,
  LuWifi,
  LuBookOpen,
  LuTv,
  LuUtensils,
  LuDumbbell,
  LuWaves,
  LuCar,
  LuKey,
  LuWind,
  LuSun,
  LuDroplets,
  LuLaptop,
  LuAccessibility,
  LuX,
  LuLink,
} from "react-icons/lu";
import { getPublicMediaUrl } from "@/lib/media";
import { STANDARD_CHECKLIST, calculateSafetyScore, type ChecklistTemplateItem } from "@/lib/safety";
import { extractRoomsFromProperty } from "@/lib/rooms";

// Extract the landlord-written portion of a description, dropping any
// previously generated room-inventory block so it can be regenerated cleanly.
function extractBaseDescription(desc?: string | null): string {
  if (!desc) return "";
  const i = desc.search(/\n\s*\n\s*(?:🏠\s*)?Room (?:Configurations|Inventory) & Rates:/i);
  if (i >= 0) return desc.slice(0, i).trim();
  return desc.trim();
}
import GoogleMap, { type MapLocation } from "@/components/maps/google-map";

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
  { id: "FURNISHED_BED", label: "Bed & Mattress", icon: LuBed },
  { id: "STUDY_DESK", label: "Study Desk & Chair", icon: LuBookOpen },
  { id: "WARDROBE", label: "Fitted Wardrobe", icon: LuLock },
  { id: "MINI_FRIDGE", label: "In-Room Fridge", icon: LuLayers },
  { id: "AIRCON_HEATER", label: "Aircon / Heater", icon: LuWind },
  { id: "BALCONY", label: "Private Balcony", icon: LuBuilding2 },
  { id: "PREPAID_ELEC", label: "Prepaid Meter", icon: LuZap },
  { id: "WIFI_AP", label: "WiFi Access Point", icon: LuWifi },
  { id: "KEYLESS_LOCK", label: "Smart Lock", icon: LuKey },
  { id: "ENSUITE_BATH", label: "Ensuite Bathroom", icon: LuBath },
];

export const ROOM_TYPE_PRESETS = [
  {
    name: "Commune Standard",
    description: "Mix of standard singles and 2-sharing rooms",
    rooms: [
      {
        id: "preset-1",
        name: "Standard Single",
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
        name: "Single Ensuite",
        type: "SINGLE_ENSUITE" as const,
        quantity: 1,
        bedsPerRoom: 1,
        bathroomType: "ENSUITE" as const,
        monthlyPrice: 5600,
        deposit: 5600,
        sizeSqm: "18",
        isNsfasCapped: false,
        availabilityStatus: "AVAILABLE_NOW" as const,
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "ENSUITE_BATH", "WIFI_AP"],
        photos: [],
        isExpanded: false,
      },
      {
        id: "preset-3",
        name: "2-Sharing Room",
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
    name: "Purpose-Built Block",
    description: "Ensuite single rooms and cluster apartments",
    rooms: [
      {
        id: "preset-pb-1",
        name: "Studio Single Ensuite",
        type: "SINGLE_ENSUITE" as const,
        quantity: 6,
        bedsPerRoom: 1,
        bathroomType: "ENSUITE" as const,
        monthlyPrice: 5800,
        deposit: 5800,
        sizeSqm: "16",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW" as const,
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "ENSUITE_BATH", "WIFI_AP"],
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
    name: "NSFAS Direct Mix",
    description: "Rooms aligned to national student funding caps",
    rooms: [
      {
        id: "preset-nsfas-1",
        name: "NSFAS 2-Sharing Bed",
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
  // When provided, the builder runs in edit mode: it pre-fills every step from the
  // existing residence and saves via PATCH instead of creating a new listing.
  initialProperty?: any;
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
    category: "Power & Load-Shedding Resilience",
    items: [
      { id: "BACKUP_POWER", label: "Solar Inverter / Battery UPS (WiFi & Lights during outages)", icon: LuZap },
      { id: "GENERATOR", label: "Full Complex Backup Generator", icon: LuZap },
    ],
  },
  {
    category: "Water & Utilities",
    items: [
      { id: "BACKUP_WATER", label: "Backup JoJo Water Tanks + Pressure Booster Pump", icon: LuDroplets },
      { id: "SOLAR_GEYSER", label: "Solar / Heat Pump Central Hot Water", icon: LuSun },
      { id: "WATER_INCLUDED", label: "Water Included in Rent", icon: LuBath },
      { id: "ELEC_INCLUDED", label: "Electricity Quota Included", icon: LuZap },
    ],
  },
  {
    category: "Connectivity & Academic Study",
    items: [
      { id: "WIFI", label: "Uncapped High-Speed Fibre WiFi (100Mbps+)", icon: LuWifi },
      { id: "STUDY_ROOM", label: "Dedicated Quiet Study Center with Workstations", icon: LuBookOpen },
      { id: "COMPUTER_LAB", label: "Computer Lab & Printing Station", icon: LuLaptop },
    ],
  },
  {
    category: "Security & Access Control",
    items: [
      { id: "BIOMETRIC", label: "Biometric Turnstiles / Fingerprint Access", icon: LuKey },
      { id: "CCTV", label: "24/7 Monitored CCTV Surveillance", icon: LuEye },
      { id: "ARMED_RESPONSE", label: "Electric Perimeter Fencing & Armed Response Link", icon: LuShieldCheck },
      { id: "GUARD_SECURITY", label: "24-Hour On-Site Security Guard / Caretaker", icon: LuShieldCheck },
    ],
  },
  {
    category: "Living, Social & Facilities",
    items: [
      { id: "FURNISHED", label: "Fully Furnished Rooms (Bed, Desk, Wardrobe)", icon: LuBed },
      { id: "LAUNDRY", label: "On-Site Free Laundry Facility (Washers & Dryers)", icon: LuLayers },
      { id: "KITCHEN_COMMUNAL", label: "Equipped Communal Kitchens (Stoves, Microwaves, Fridges)", icon: LuUtensils },
      { id: "TV_LOUNGE", label: "Student Social Lounge / TV Room", icon: LuTv },
      { id: "OUTDOOR_BRAAI", label: "Outdoor Courtyard / Braai Area", icon: LuFlame },
      { id: "FITNESS_GYM", label: "On-Site Student Fitness Gym", icon: LuDumbbell },
      { id: "SWIMMING_POOL", label: "Swimming Pool & Deck Area", icon: LuWaves },
      { id: "GAMES_ROOM", label: "Games Lounge (Pool Table, Table Tennis)", icon: LuLayers },
      { id: "PARKING", label: "Secure Student Parking (Vehicle & Bicycle)", icon: LuCar },
      { id: "CLEANING_SERVICE", label: "Daily Communal Area Cleaning & Waste Removal", icon: LuSparkles },
      { id: "ACCESSIBILITY", label: "Wheelchair Ramp & Universal Access", icon: LuAccessibility },
    ],
  },
];

export default function ResidenceBuilderPage({ user, initialProperty }: ResidenceBuilderPageProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialProperty?.id);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Active Tab View within Builder
  const [activeTab, setActiveTab] = useState<"basics" | "capacity" | "amenities" | "safety" | "media">("basics");

  // Basic Info Form State (Start blank for new listings; prefill in edit mode)
  const [basics, setBasics] = useState(() => {
    if (!initialProperty) {
      return {
        title: "",
        buildingType: "STUDENT_BLOCK",
        institution: "",
        campus: "",
        distanceToCampus: "",
        transitMode: "WALKING",
        streetAddress: "",
        suburb: "",
        city: "",
        province: "Gauteng",
        postalCode: "",
        description: "",
      };
    }
    return {
      title: initialProperty.title || "",
      buildingType: "STUDENT_BLOCK",
      institution: "",
      campus: "",
      distanceToCampus: initialProperty.distanceToCampus ? String(initialProperty.distanceToCampus) : "",
      transitMode: "WALKING",
      streetAddress: initialProperty.address || "",
      suburb: initialProperty.suburb || "",
      city: initialProperty.city || "",
      province: "Gauteng",
      postalCode: "",
      description: extractBaseDescription(initialProperty.description),
    };
  });
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);

  // Live Student Public URL State (Clean slug: /residences/name)
  const [copiedUrl, setCopiedUrl] = useState(false);

  const publicListingSlug = useMemo(() => {
    const title = (basics.title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return title ? `/residences/${title}` : "/residences/your-residence-name";
  }, [basics.title]);

  const publicListingUrl = useMemo(() => {
    return `https://campusnest.co.za${publicListingSlug}`;
  }, [publicListingSlug]);

  const handleCopyUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(publicListingUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  // Room Configuration & Capacity State (Start with 1 blank room; prefill from
  // the residence's current configuration in edit mode)
  const [rooms, setRooms] = useState<RoomTypeItem[]>(() => {
    if (!initialProperty) {
      return [
        {
          id: "room-1",
          name: "",
          type: "SINGLE_STANDARD",
          quantity: 1,
          bedsPerRoom: 1,
          bathroomType: "SHARED_1_2",
          monthlyPrice: 0,
          deposit: 0,
          sizeSqm: "",
          isNsfasCapped: false,
          availabilityStatus: "AVAILABLE_NOW",
          features: [],
          photos: [],
          isExpanded: true,
        },
      ];
    }

    const parsed = extractRoomsFromProperty(initialProperty).map((r) => ({
      id: `${initialProperty.id}-edit-${r.id}`,
      name: r.name,
      type: (["SINGLE_STANDARD", "SINGLE_ENSUITE", "DOUBLE_SHARING", "TRIPLE_SHARING", "QUAD_SHARING", "STUDIO_BACHELOR", "ONE_BED_APARTMENT", "CUSTOM"].includes(r.type)
        ? r.type
        : "SINGLE_STANDARD") as RoomTypeItem["type"],
      quantity: r.quantity,
      bedsPerRoom: r.bedsPerRoom,
      bathroomType: r.bathroomType,
      monthlyPrice: r.monthlyPrice,
      deposit: r.deposit,
      sizeSqm: r.sizeSqm || "",
      isNsfasCapped: r.isNsfasCapped,
      availabilityStatus: r.availabilityStatus === "OCCUPIED" ? "LIMITED_BEDS" : r.availabilityStatus,
      features: [...r.features],
      photos: [...r.photos],
      isExpanded: false,
    }));

    return parsed.length > 0
      ? parsed
      : [
          {
            id: "room-1",
            name: "",
            type: "SINGLE_STANDARD",
            quantity: 1,
            bedsPerRoom: 1,
            bathroomType: "SHARED_1_2",
            monthlyPrice: 0,
            deposit: 0,
            sizeSqm: "",
            isNsfasCapped: false,
            availabilityStatus: "AVAILABLE_NOW",
            features: [],
            photos: [],
            isExpanded: true,
          },
        ];
  });

  const [isNsfasAccredited, setIsNsfasAccredited] = useState<boolean>(() => {
    if (!initialProperty) return false;
    const amenities: string[] = initialProperty.amenities || [];
    const parsed = extractRoomsFromProperty(initialProperty);
    return amenities.includes("NSFAS_ACCREDITED") || parsed.some((r) => r.isNsfasCapped);
  });
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
      totalBeds: Math.max(0, totalBeds),
      totalBedrooms: Math.max(0, totalBedrooms),
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
        name: "",
        type: "SINGLE_STANDARD",
        quantity: 1,
        bedsPerRoom: 1,
        bathroomType: "SHARED_1_2",
        monthlyPrice: 0,
        deposit: 0,
        sizeSqm: "",
        isNsfasCapped: false,
        availabilityStatus: "AVAILABLE_NOW",
        features: [],
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
      name: existing.name ? `${existing.name} (Copy)` : "",
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

    // Provide instant local object URL preview for immediate visual feedback
    const localPreviewUrl = URL.createObjectURL(file);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, photos: [...r.photos, localPreviewUrl] } : r
      )
    );

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

      // Replace local preview URL with persistent uploaded URL
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? {
                ...r,
                photos: r.photos.map((p) => (p === localPreviewUrl ? data.url : p)),
              }
            : r
        )
      );

      setPhotos((prev) => (prev.includes(data.url) ? prev : [...prev, data.url]));
    } catch (err: any) {
      // Revert local preview if upload failed
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? { ...r, photos: r.photos.filter((p) => p !== localPreviewUrl) }
            : r
        )
      );
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

  // Selected Amenities (Starts completely empty; prefill in edit mode)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    if (!initialProperty) return [];
    return (initialProperty.amenities || []).filter((a: string) => a !== "NSFAS_ACCREDITED");
  });

  // 13-Point Checklist State (ALL start as null / unanswered; prefill with the
  // landlord's existing answers in edit mode, keeping the checklistItem ids)
  const [checklistAnswers, setChecklistAnswers] = useState<
    Array<{
      id?: string;
      category: ChecklistTemplateItem["category"];
      label: string;
      weight: number;
      passed: boolean | null;
      notes?: string;
    }>
  >(() => {
    if (initialProperty?.checklistItems?.length) {
      return initialProperty.checklistItems.map((item: any) => ({
        id: item.id,
        category: item.category,
        label: item.label,
        weight: item.weight,
        passed: item.passed ?? null,
        notes: item.notes || "",
      }));
    }
    return STANDARD_CHECKLIST.map((item) => ({
      category: item.category,
      label: item.label,
      weight: item.weight,
      passed: null,
      notes: "",
    }));
  });

  // Media and Document State
  const [photos, setPhotos] = useState<string[]>(() =>
    initialProperty?.images?.length ? initialProperty.images.filter(Boolean) : []
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Live Safety Score Calculation (Only when evaluated)
  const liveSafetyScore = useMemo(() => {
    return calculateSafetyScore(checklistAnswers);
  }, [checklistAnswers]);

  const checklistAnsweredCount = useMemo(() => {
    return checklistAnswers.filter((item) => item.passed !== null).length;
  }, [checklistAnswers]);

  // Selected University Campuses
  const currentUniversityCampuses = useMemo(() => {
    const uni = SA_UNIVERSITIES.find((u) => u.name === basics.institution);
    return uni ? uni.campuses : [];
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

    // Instant local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setPhotos((prev) => [...prev, localPreviewUrl]);

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

      setPhotos((prev) => prev.map((p) => (p === localPreviewUrl ? data.url : p)));
    } catch (err: any) {
      setPhotos((prev) => prev.filter((p) => p !== localPreviewUrl));
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
      (r) =>
        r.name.trim().length > 0 &&
        Number(r.quantity) >= 1 &&
        Number(r.monthlyPrice) > 0 &&
        Number(r.bedsPerRoom) >= 1
    );

  const isFormValid = isBasicsValid && isCapacityValid;

  const handlePublish = async () => {
    if (!isFormValid) {
      setError("Please fill in the required residence details and room configurations.");
      if (!isBasicsValid) setActiveTab("basics");
      else if (!isCapacityValid) setActiveTab("capacity");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const basePrice = buildingMetrics.minPrice || 0;

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
        ).toLocaleString()}/mo per bed (${r.quantity} unit${
          r.quantity > 1 ? "s" : ""
        }, ${r.quantity * r.bedsPerRoom} total bed${
          r.quantity * r.bedsPerRoom > 1 ? "s" : ""
        })${r.isNsfasCapped ? " [NSFAS Capped]" : ""}`;
      });

      const detailedDescription = basics.description
        ? `${basics.description}\n\n🏠 Room Inventory & Rates:\n${roomSummaryLines.join(
            "\n"
          )}`
        : `Student housing located in ${basics.suburb}, ${basics.city}.${
            basics.institution ? ` Nearest institution: ${basics.institution} (${basics.campus}).` : ""
          }\n\n🏠 Room Inventory & Rates:\n${roomSummaryLines.join("\n")}`;

      // Collect all room photos and property photos
      const allRoomPhotos = rooms.flatMap((r) => r.photos);
      const combinedPhotos = Array.from(new Set([...photos, ...allRoomPhotos]));

      // In edit mode, attach existing checklistItem ids so the PATCH route can
      // update the exact inventory answers (and recompute the safety score).
      // For new listings the full checklist is submitted for creation.
      const checklistPayload = isEditMode
        ? checklistAnswers
            .map((a) => ({ id: a.id, passed: a.passed, notes: a.notes || "" }))
            .filter((a) => a.id)
        : checklistAnswers;

      const payload = {
        title: basics.title,
        address: `${basics.streetAddress}${basics.postalCode ? `, ${basics.postalCode}` : ""}`,
        suburb: basics.suburb,
        city: basics.city,
        latitude: mapLocation?.latitude,
        longitude: mapLocation?.longitude,
        priceMonthly: basePrice,
        bedrooms: buildingMetrics.totalBedrooms || 1,
        bathrooms: isEditMode ? initialProperty.bathrooms || 1 : 1,
        maxOccupants: buildingMetrics.totalBeds || 1,
        description: detailedDescription,
        amenities: isNsfasAccredited
          ? Array.from(new Set([...selectedAmenities, "NSFAS_ACCREDITED"]))
          : selectedAmenities,
        distanceToCampus: basics.distanceToCampus
          ? Number(basics.distanceToCampus)
          : isEditMode
          ? null
          : undefined,
        images: combinedPhotos,
        checklistAnswers: checklistPayload,
      };

      const res = await fetch(isEditMode ? `/api/properties/${initialProperty.id}` : "/api/properties", {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : isEditMode
            ? "Failed to update residence listing"
            : "Failed to create residence listing"
        );
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(isEditMode ? `/landlord/properties/${initialProperty.id}` : "/landlord/properties");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create residence listing.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-poppins">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/landlord/properties"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <LuChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Residences</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">
              {isEditMode ? "Edit Listing" : "New Listing"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {basics.title
              ? basics.title
              : isEditMode
              ? "Edit Student Residence"
              : "Add New Student Residence"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEditMode
              ? "Update property details, room configurations, amenities, utilities, and safety inspection for this residence."
              : "Provide property details, room configurations, living amenities, utilities, and safety inspection."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={saving || success}
            onClick={handlePublish}
            className="inline-flex items-center gap-2 rounded-lg bg-[#005F56] hover:bg-[#004d46] disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEditMode ? "Saving Changes..." : "Publishing Listing..."}</span>
              </>
            ) : success ? (
              <>
                <LuCheck className="w-4 h-4" />
                <span>{isEditMode ? "Changes Saved!" : "Listing Published!"}</span>
              </>
            ) : (
              <>
                {isEditMode ? <LuSave className="w-4 h-4" /> : <LuSparkles className="w-4 h-4" />}
                <span>{isEditMode ? "Save Changes" : "Publish Residence"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <LuInfo className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Modern High-Contrast Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
        {[
          { id: "basics" as const, label: "1. Identity & URL", icon: LuBuilding2 },
          { id: "capacity" as const, label: "2. Room Types & Rates", icon: LuBed },
          { id: "amenities" as const, label: "3. Amenities & Utilities", icon: LuZap },
          { id: "safety" as const, label: "4. Safety Audit", icon: LuShieldCheck },
          { id: "media" as const, label: "5. Photos & Media", icon: LuUpload },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#005F56] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: IDENTITY & LOCATION ================= */}
      {activeTab === "basics" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Residence Identity &amp; Location</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your property title, classification, location, and student application link.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Residence / Building Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={basics.title}
                onChange={(e) => setBasics({ ...basics, title: e.target.value })}
                placeholder="e.g. Yale Village, Apex Student Manor"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Property Classification
              </label>
              <select
                value={basics.buildingType}
                onChange={(e) => setBasics({ ...basics, buildingType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white"
              >
                <option value="STUDENT_BLOCK">Dedicated Student Apartment Block</option>
                <option value="COMMUNE">Student Commune / House</option>
                <option value="COMPLEX">Residential Complex</option>
                <option value="HOSTEL">Student Residence / Hostel</option>
              </select>
            </div>
          </div>

          {/* Student Public URL Preview Card */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <LuLink className="w-3.5 h-3.5 text-[#005F56]" />
                Public Student Application URL
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:border-[#005F56] hover:text-[#005F56] transition-all cursor-pointer"
              >
                {copiedUrl ? (
                  <>
                    <LuCheck className="w-3.5 h-3.5 text-[#005F56]" />
                    <span className="text-[#005F56]">Copied</span>
                  </>
                ) : (
                  <>
                    <LuCopy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-2.5 rounded-md bg-white border border-slate-300 font-mono text-xs text-slate-900 select-all overflow-x-auto break-all">
              {publicListingUrl}
            </div>
            <p className="text-[11px] text-slate-500">
              Students and university bursars will access this live link to view available rooms, facilities, and submit direct applications.
            </p>
          </div>

          {/* Institution Selection */}
          <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Campus Proximity &amp; Transit Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Nearest Higher Education Institution
                </label>
                <select
                  value={basics.institution}
                  onChange={(e) => {
                    const uni = SA_UNIVERSITIES.find((u) => u.name === e.target.value);
                    setBasics({
                      ...basics,
                      institution: e.target.value,
                      campus: uni && uni.campuses.length > 0 ? uni.campuses[0] : "",
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white"
                >
                  <option value="">-- Select Institution (Optional) --</option>
                  {SA_UNIVERSITIES.map((u) => (
                    <option key={u.name} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Campus / Faculty Location
                </label>
                <select
                  value={basics.campus}
                  disabled={!basics.institution}
                  onChange={(e) => setBasics({ ...basics, campus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white disabled:opacity-50"
                >
                  <option value="">-- Select Campus --</option>
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
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Distance to Campus Gates (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={basics.distanceToCampus}
                  onChange={(e) => setBasics({ ...basics, distanceToCampus: e.target.value })}
                  placeholder="e.g. 0.8"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Commute Access Mode
                </label>
                <select
                  value={basics.transitMode}
                  onChange={(e) => setBasics({ ...basics, transitMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white"
                >
                  <option value="WALKING">Walking Distance (&lt; 1.5 km)</option>
                  <option value="SHUTTLE">University Shuttle Route</option>
                  <option value="TAXI">Public Transit / Bus Route</option>
                  <option value="PRIVATE_SHUTTLE">Residence Shuttle Service</option>
                </select>
              </div>
            </div>
          </div>

          {/* Physical Address Details */}
          <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Physical Location &amp; Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Street Address &amp; Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={basics.streetAddress}
                    onChange={(e) => setBasics({ ...basics, streetAddress: e.target.value })}
                    placeholder="e.g. 45 Juta Street"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900"
                  />
                  <LuMapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Suburb / Area <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={basics.suburb}
                  onChange={(e) => setBasics({ ...basics, suburb: e.target.value })}
                  placeholder="e.g. Braamfontein, Parktown, Hatfield"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={basics.city}
                  onChange={(e) => setBasics({ ...basics, city: e.target.value })}
                  placeholder="e.g. Johannesburg, Pretoria, Cape Town"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Province
                </label>
                <select
                  value={basics.province}
                  onChange={(e) => setBasics({ ...basics, province: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white"
                >
                  {SA_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={basics.postalCode}
                  onChange={(e) => setBasics({ ...basics, postalCode: e.target.value })}
                  placeholder="e.g. 2001"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-[#005F56]/15 bg-white p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Pin residence on map</p>
                <p className="mt-1 text-xs text-slate-500">Confirm the building location so students can find it and get directions.</p>
              </div>
              <GoogleMap
                address={`${basics.streetAddress}, ${basics.suburb}, ${basics.city}`}
                interactive
                location={mapLocation}
                onLocationChange={setMapLocation}
                className="h-64"
              />
              <p className="text-[11px] text-slate-500">Drag the marker to the exact entrance. The location is optional until a Google Maps key is configured.</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveTab("capacity")}
              className="px-6 py-2.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Continue to Room Types &amp; Rates →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ROOM TYPES & RATES ================= */}
      {activeTab === "capacity" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-7">
          
          {/* Header & Overview */}
          <div className="border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Room Configurations &amp; Rates</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define room layouts, interior amenities, per-bed rental pricing, and deposit amounts.
              </p>
            </div>

            {/* Presets Bar */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Presets:
              </span>
              {ROOM_TYPE_PRESETS.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  title={preset.description}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:text-[#005F56] hover:border-[#005F56] rounded border border-slate-300 transition-all cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Building Capacity Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <LuBed className="w-3.5 h-3.5 text-[#005F56]" /> Total Beds
              </span>
              <span className="text-xl font-bold text-slate-900 block">
                {buildingMetrics.totalBeds} Beds
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <LuLayers className="w-3.5 h-3.5 text-[#005F56]" /> Room Units
              </span>
              <span className="text-xl font-bold text-slate-900 block">
                {buildingMetrics.totalBedrooms} Rooms
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <LuDollarSign className="w-3.5 h-3.5 text-[#005F56]" /> Starting Rate
              </span>
              <span className="text-xl font-bold text-[#005F56] block">
                {buildingMetrics.minPrice > 0 ? `R ${buildingMetrics.minPrice.toLocaleString()}` : "--"}
                <span className="text-[10px] font-normal text-slate-500"> / bed</span>
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <LuUsers className="w-3.5 h-3.5 text-[#005F56]" /> Gross Potential
              </span>
              <span className="text-xl font-bold text-slate-900 block">
                {buildingMetrics.grossRevenue > 0 ? `R ${buildingMetrics.grossRevenue.toLocaleString()}` : "--"}
                <span className="text-[10px] font-normal text-slate-500"> / mo</span>
              </span>
            </div>
          </div>

          {/* Rooms List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <LuSlidersHorizontal className="w-3.5 h-3.5 text-[#005F56]" />
                Configured Room Layouts ({rooms.length})
              </h3>
              <button
                type="button"
                onClick={addRoom}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#005F56] text-white text-xs font-bold transition-all cursor-pointer hover:bg-[#004d46]"
              >
                <LuPlus className="w-3.5 h-3.5" />
                <span>Add Room Layout</span>
              </button>
            </div>

            <div className="space-y-4">
              {rooms.map((room, idx) => {
                const totalBedsInThisType = (Number(room.quantity) || 1) * (Number(room.bedsPerRoom) || 1);
                const isUploading = uploadingRoomPhotoId === room.id;

                return (
                  <div
                    key={room.id}
                    className="rounded-lg border border-slate-300 bg-white overflow-hidden shadow-xs"
                  >
                    {/* Room Header Strip */}
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-[#005F56] text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {room.name || `Untitled Room Layout ${idx + 1}`}
                            </h4>
                            {room.isNsfasCapped && (
                              <span className="text-[10px] font-bold text-[#005F56] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                NSFAS Capped
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {room.quantity} unit{room.quantity > 1 ? "s" : ""} • {totalBedsInThisType} bed{totalBedsInThisType > 1 ? "s" : ""} • {room.bathroomType.replace("_", " ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 block">
                            R {Number(room.monthlyPrice || 0).toLocaleString()}
                            <span className="text-[10px] font-normal text-slate-500"> / bed</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
                          <button
                            type="button"
                            onClick={() => duplicateRoom(room.id)}
                            title="Duplicate room layout"
                            className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <LuCopy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeRoom(room.id)}
                            disabled={rooms.length <= 1}
                            title="Remove room layout"
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition-colors cursor-pointer"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleRoomExpand(room.id)}
                            className="p-1.5 rounded text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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

                    {/* Room Body */}
                    {room.isExpanded && (
                      <div className="p-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Room Type Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={room.name}
                              onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                              placeholder="e.g. Standard Single, 2-Sharing Ensuite"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Layout Category
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
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] font-medium"
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
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Number of Identical Units <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              min={1}
                              required
                              value={room.quantity}
                              onChange={(e) => updateRoom(room.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Beds Per Unit
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={room.bedsPerRoom}
                              onChange={(e) => updateRoom(room.id, { bedsPerRoom: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Monthly Rent per Bed (ZAR) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R</span>
                              <input
                                type="number"
                                step="10"
                                min={0}
                                required
                                value={room.monthlyPrice || ""}
                                onChange={(e) => updateRoom(room.id, { monthlyPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                                placeholder="4800"
                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Security Deposit (ZAR)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R</span>
                              <input
                                type="number"
                                step="10"
                                min={0}
                                value={room.deposit || ""}
                                onChange={(e) => updateRoom(room.id, { deposit: Math.max(0, parseFloat(e.target.value) || 0) })}
                                placeholder="4800"
                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Bathroom Arrangement
                            </label>
                            <select
                              value={room.bathroomType}
                              onChange={(e) => updateRoom(room.id, { bathroomType: e.target.value as RoomTypeItem["bathroomType"] })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] font-medium"
                            >
                              <option value="ENSUITE">Private In-Room Ensuite</option>
                              <option value="SHARED_1_2">Semi-Private (Shared 1:2)</option>
                              <option value="SHARED_COMMUNAL">Communal Floor Bathrooms</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Floor Area (m²) (Optional)
                            </label>
                            <input
                              type="text"
                              value={room.sizeSqm || ""}
                              onChange={(e) => updateRoom(room.id, { sizeSqm: e.target.value })}
                              placeholder="e.g. 16"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-800 mb-1">
                              Availability Status
                            </label>
                            <select
                              value={room.availabilityStatus}
                              onChange={(e) => updateRoom(room.id, { availabilityStatus: e.target.value as RoomTypeItem["availabilityStatus"] })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] font-medium"
                            >
                              <option value="AVAILABLE_NOW">Available Immediately</option>
                              <option value="NEXT_SEMESTER">Available Next Academic Semester</option>
                              <option value="LIMITED_BEDS">Limited Beds Remaining</option>
                              <option value="WAITLIST">Waitlist Only</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-300">
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">NSFAS Allowance Cap</span>
                              <span className="text-[10px] text-slate-500 block">Aligned with student bursary grant</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={room.isNsfasCapped}
                              onChange={(e) => updateRoom(room.id, { isNsfasCapped: e.target.checked })}
                              className="w-4 h-4 text-[#005F56] accent-[#005F56] rounded cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Room Inclusions */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                            In-Room Furnishings &amp; Items
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {ROOM_FEATURE_OPTIONS.map((feat) => {
                              const isChecked = room.features.includes(feat.id);
                              const Icon = feat.icon;
                              return (
                                <button
                                  key={feat.id}
                                  type="button"
                                  onClick={() => toggleRoomFeature(room.id, feat.id)}
                                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                                    isChecked
                                      ? "border-[#005F56] bg-[#005F56]/10 text-[#005F56] font-bold border-2"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                  }`}
                                >
                                  <Icon className="w-4 h-4 shrink-0" />
                                  <span className="truncate flex-1 text-[11px]">{feat.label}</span>
                                  {isChecked && <LuCheck className="w-3.5 h-3.5 text-[#005F56] shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Room Photos */}
                        <div className="pt-3 border-t border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <LuImage className="w-3.5 h-3.5 text-[#005F56]" />
                              Interior Photos for this Room ({room.photos.length})
                            </span>

                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#005F56] border border-[#005F56] text-xs font-bold cursor-pointer hover:bg-[#005F56]/10 transition-colors">
                              <LuUpload className="w-3.5 h-3.5" />
                              <span>{isUploading ? "Uploading..." : "Add Room Photo"}</span>
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
                            <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
                              <p className="text-xs text-slate-500">
                                No room photos uploaded yet.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                              {room.photos.map((url, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="relative rounded-lg overflow-hidden border border-slate-300 group aspect-square bg-slate-100"
                                >
                                  <img
                                    src={getPublicMediaUrl(url)}
                                    alt={`${room.name} photo ${pIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeRoomPhoto(room.id, pIdx)}
                                    className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
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

            <button
              type="button"
              onClick={addRoom}
              className="w-full py-3.5 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#005F56] bg-slate-50 hover:bg-[#005F56]/5 text-slate-700 hover:text-[#005F56] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LuPlus className="w-4 h-4" />
              <span>Add Another Room Layout</span>
            </button>
          </div>

          {/* NSFAS Accreditation Toggle */}
          <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                NSFAS Accreditation Status
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Is this residence officially accredited to accept NSFAS-funded students?
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNsfasAccredited((prev) => !prev)}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isNsfasAccredited
                  ? "bg-[#005F56] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400"
              }`}
            >
              <LuShieldCheck className="w-4 h-4" />
              <span>{isNsfasAccredited ? "NSFAS Accredited Residence" : "Not NSFAS Accredited"}</span>
            </button>
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("basics")}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              ← Back to Identity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("amenities")}
              className="px-6 py-2.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Continue to Amenities &amp; Utilities →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LIVING AMENITIES ================= */}
      {activeTab === "amenities" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Living Amenities &amp; Utilities</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the building features and utilities provided at this residence.
            </p>
          </div>

          <div className="space-y-6">
            {AMENITY_CATEGORIES.map((group) => (
              <div key={group.category} className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {group.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.items.map((item) => {
                    const isSelected = selectedAmenities.includes(item.id);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleAmenity(item.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#005F56] bg-[#005F56]/10 text-[#005F56] font-bold border-2"
                            : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0 text-[#005F56]" />
                        <span className="flex-1 leading-snug">{item.label}</span>
                        {isSelected && <LuCheck className="w-4 h-4 text-[#005F56] shrink-0" />}
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
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("safety")}
              className="px-6 py-2.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Continue to Safety Audit →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 4: 13-POINT SAFETY AUDIT ================= */}
      {activeTab === "safety" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">13-Point Municipal Safety Checklist</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete the standard municipal health &amp; safety inspection for this residence.
              </p>
            </div>

            {/* Safety Score Status */}
            <div className="p-3 px-4 rounded-lg bg-slate-100 border border-slate-200 flex items-center gap-3 shrink-0">
              <LuShieldCheck className="w-5 h-5 text-[#005F56] shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Safety Rating
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {liveSafetyScore !== null
                    ? `${liveSafetyScore.toFixed(1)} / 10 (${checklistAnsweredCount}/13 completed)`
                    : `Pending Audit (0 of 13 evaluated)`}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist Items list */}
          <div className="space-y-3">
            {checklistAnswers.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <div className="flex-1">
                  <span className="font-bold text-slate-900 block text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Category: {item.category.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setChecklistAnswer(idx, true)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      item.passed === true
                        ? "bg-[#005F56] text-white border border-[#005F56]"
                        : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-[#005F56]/10 hover:text-[#005F56]"
                    }`}
                  >
                    <LuCheck className="w-3.5 h-3.5" /> Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setChecklistAnswer(idx, false)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      item.passed === false
                        ? "bg-rose-600 text-white border border-rose-600"
                        : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-rose-50 hover:text-rose-700"
                    }`}
                  >
                    <LuX className="w-3.5 h-3.5" /> Fail
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("amenities")}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className="px-6 py-2.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              Continue to Photos &amp; Compliance →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 5: PHOTOS & COMPLIANCE ================= */}
      {activeTab === "media" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Property Photos &amp; Compliance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload photos of the building facade, common areas, and security features.
            </p>
          </div>

          {/* Photos Upload Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">General Gallery ({photos.length} uploaded)</span>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#005F56] text-white text-xs font-bold cursor-pointer hover:bg-[#004d46] transition-colors">
                <LuUpload className="w-3.5 h-3.5" />
                <span>{uploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
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
              <div className="p-8 rounded-lg border-2 border-dashed border-slate-300 text-center space-y-2">
                <LuUpload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-700 font-semibold">No property images uploaded yet</p>
                <p className="text-[11px] text-slate-500">Upload exterior photos, study areas, kitchen, and entrance security.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-300 group aspect-video bg-slate-100">
                    <img
                      src={getPublicMediaUrl(url)}
                      alt={`Residence photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Complete Bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LuShieldCheck className="w-5 h-5 text-[#005F56]" />
              <span className="text-xs text-slate-600">
                {isEditMode
                  ? "Ready to save your residence changes."
                  : "Ready to publish your student residence listing."}
              </span>
            </div>

            <button
              type="button"
              disabled={saving || success || !isFormValid}
              onClick={handlePublish}
              className="px-8 py-3 rounded-lg bg-[#005F56] hover:bg-[#004d46] disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? "Saving Changes..." : "Publishing Listing..."}</span>
                </>
              ) : success ? (
                <>
                  <LuCheck className="w-4 h-4" />
                  <span>{isEditMode ? "Changes Saved!" : "Published Successfully!"}</span>
                </>
              ) : (
                <>
                  {isEditMode ? <LuSave className="w-4 h-4" /> : <LuSparkles className="w-4 h-4" />}
                  <span>{isEditMode ? "Save Residence Changes" : "Complete &amp; Publish Listing"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
