export interface ParsedRoom {
  id: string;
  name: string;
  type: string;
  typeName: string;
  quantity: number;
  bedsPerRoom: number;
  totalBeds: number;
  monthlyPrice: number;
  deposit: number;
  bathroomType: "ENSUITE" | "SHARED_1_2" | "SHARED_COMMUNAL";
  bathroomLabel: string;
  isNsfasCapped: boolean;
  sizeSqm?: string;
  availabilityStatus: "AVAILABLE_NOW" | "OCCUPIED" | "LIMITED_BEDS" | "WAITLIST";
  features: string[];
  photos: string[];
  occupiedBeds?: number;
}

export const AMENITY_METADATA: Record<string, { label: string; icon: string; category: string; description: string }> = {
  BACKUP_POWER: {
    label: "Solar Inverter / Battery UPS",
    icon: "⚡",
    category: "Power & Load-Shedding",
    description: "Powers high-speed WiFi, study desk sockets, and hallway lighting during load-shedding cycles.",
  },
  GENERATOR: {
    label: "Complex Backup Diesel Generator",
    icon: "🔋",
    category: "Power & Load-Shedding",
    description: "Heavy-duty full building power backup system.",
  },
  BACKUP_WATER: {
    label: "Backup JoJo Tanks + Pressure Pump",
    icon: "💧",
    category: "Water & Utilities",
    description: "Automated municipal water interruption reserve tanks guaranteeing uninterrupted hot water.",
  },
  SOLAR_GEYSER: {
    label: "Solar / Heat Pump Hot Water",
    icon: "☀️",
    category: "Water & Utilities",
    description: "Energy-efficient continuous hot water supply.",
  },
  WATER_INCLUDED: {
    label: "Water Included in Monthly Rent",
    icon: "🚿",
    category: "Water & Utilities",
    description: "Free unlimited domestic water usage for students.",
  },
  ELEC_INCLUDED: {
    label: "Electricity / Monthly Quota Included",
    icon: "💡",
    category: "Water & Utilities",
    description: "Generous monthly kilowatt allowance included in base rent.",
  },
  WIFI: {
    label: "Uncapped High-Speed Fibre WiFi",
    icon: "📶",
    category: "Connectivity & Study",
    description: "100Mbps+ low-latency commercial fibre connection with full residence mesh coverage.",
  },
  STUDY_ROOM: {
    label: "Dedicated Quiet Study Center",
    icon: "📚",
    category: "Connectivity & Study",
    description: "Sound-insulated 24/7 student study lab with ergonomic workstations & power points.",
  },
  COMPUTER_LAB: {
    label: "Student Computer & Print Station",
    icon: "💻",
    category: "Connectivity & Study",
    description: "On-site networked PCs and wireless document printing.",
  },
  BIOMETRIC: {
    label: "Biometric Fingerprint / Facial Access",
    icon: "🔒",
    category: "Security & Access",
    description: "High-security anti-tailgating turnstiles and keyless entry logs.",
  },
  CCTV: {
    label: "24/7 Monitored CCTV Surveillance",
    icon: "📹",
    category: "Security & Access",
    description: "Comprehensive camera coverage of perimeter, hallways, common areas & parking.",
  },
  ARMED_RESPONSE: {
    label: "Electric Fencing & Armed Response Link",
    icon: "🚨",
    category: "Security & Access",
    description: "Zoned perimeter electric barrier linked to 24/7 rapid armed response dispatch.",
  },
  GUARD_SECURITY: {
    label: "24-Hour On-Site Security Guard",
    icon: "👮",
    category: "Security & Access",
    description: "Trained security personnel stationed at main entrance 24/7.",
  },
  FURNISHED: {
    label: "Fully Furnished Rooms",
    icon: "🛏️",
    category: "Living & Facilities",
    description: "Comfortable quality bed, mattress, fitted study desk, ergonomic chair, and wardrobe.",
  },
  LAUNDRY: {
    label: "On-Site Laundry Facility",
    icon: "🧺",
    category: "Living & Facilities",
    description: "Commercial speed-queen washing machines and tumble dryers.",
  },
  KITCHEN_COMMUNAL: {
    label: "Fully Equipped Communal Kitchen",
    icon: "🍳",
    category: "Living & Facilities",
    description: "Gas/electric stoves, microwaves, lockable food cupboards, and large refrigeration.",
  },
  TV_LOUNGE: {
    label: "Student Social & TV Lounge",
    icon: "📺",
    category: "Living & Facilities",
    description: "Communal chill area with Smart TV, DSTV, Netflix, and couches.",
  },
  OUTDOOR_BRAAI: {
    label: "Outdoor Courtyard & Braai Area",
    icon: "🍖",
    category: "Living & Facilities",
    description: "Landscaped outdoor garden with built-in braai stands and benches.",
  },
  FITNESS_GYM: {
    label: "On-Site Student Gym & Weights",
    icon: "🏋️",
    category: "Living & Facilities",
    description: "Cardio machines, free weights, and stretching mats on premises.",
  },
};

export const ROOM_FEATURE_LABELS: Record<string, { label: string; icon: string }> = {
  FURNISHED_BED: { label: "Bed & Quality Mattress", icon: "🛏️" },
  STUDY_DESK: { label: "Study Desk & Chair", icon: "📝" },
  WARDROBE: { label: "Lockable Fitted Wardrobe", icon: "🚪" },
  MINI_FRIDGE: { label: "In-Room Mini / Bar Fridge", icon: "🧊" },
  AIRCON_HEATER: { label: "Air Conditioning / Heater", icon: "❄️" },
  BALCONY: { label: "Private Balcony / View", icon: "🌅" },
  PREPAID_ELEC: { label: "Prepaid Electricity Meter", icon: "⚡" },
  WIFI_AP: { label: "High-Speed WiFi / Ethernet AP", icon: "📶" },
  KEYLESS_LOCK: { label: "Smart Keyless Lock", icon: "🔐" },
  ENSUITE_BATH: { label: "Private Ensuite Bathroom", icon: "🚿" },
};

/**
 * Extracts and normalizes structured room listings from a property record.
 * Supports both modern structured descriptions and graceful intelligent fallbacks.
 */
export function extractRoomsFromProperty(property: {
  id: string;
  title: string;
  bedrooms: number;
  maxOccupants?: number | null;
  priceMonthly: number | any;
  depositAmount?: number | any | null;
  description?: string | null;
  images?: string[];
  amenities?: string[];
}): ParsedRoom[] {
  const desc = property.description || "";
  const rooms: ParsedRoom[] = [];
  const basePrice = Number(property.priceMonthly) || 4500;
  const baseDeposit = Number(property.depositAmount) || basePrice;
  const propertyImages = property.images && property.images.length > 0 ? property.images : [];

  // Check if description has structured room breakdown
  const roomSectionMatch = desc.match(/🏠 Room (?:Configurations|Inventory) & Rates:([\s\S]*)/i);

  if (roomSectionMatch && roomSectionMatch[1]) {
    const lines = roomSectionMatch[1].trim().split("\n");
    lines.forEach((line, index) => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
      if (!cleanLine) return;

      // Pattern: Name (Type, Bath): RPrice/mo per bed (X rooms, Y total beds) [NSFAS...]
      const priceMatch = cleanLine.match(/R\s*([\d,\.]+)/i);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : basePrice;

      const qtyMatch = cleanLine.match(/(\d+)\s*room/i);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

      const bedsMatch = cleanLine.match(/(\d+)\s*total bed/i);
      const totalBeds = bedsMatch ? parseInt(bedsMatch[1], 10) : qty;
      const bedsPerRoom = Math.max(1, Math.round(totalBeds / qty));

      const isEnsuite = /ensuite/i.test(cleanLine);
      const isShared12 = /shared \(1:2\)|semi-private/i.test(cleanLine);
      const isNsfas = /nsfas/i.test(cleanLine);

      // Extract Name
      const namePart = cleanLine.split("(")[0].trim() || `Room Type ${index + 1}`;

      let typeCode = "SINGLE_STANDARD";
      let typeName = "Single Room (Private)";
      if (isEnsuite && bedsPerRoom === 1) {
        typeCode = "SINGLE_ENSUITE";
        typeName = "Single Room (Private Ensuite)";
      } else if (bedsPerRoom === 2) {
        typeCode = "DOUBLE_SHARING";
        typeName = "2-Sharing (Double Room)";
      } else if (bedsPerRoom === 3) {
        typeCode = "TRIPLE_SHARING";
        typeName = "3-Sharing (Triple Room)";
      } else if (bedsPerRoom >= 4) {
        typeCode = "QUAD_SHARING";
        typeName = "4-Sharing (Quad Room / Dorm)";
      } else if (/studio|bachelor/i.test(cleanLine)) {
        typeCode = "STUDIO_BACHELOR";
        typeName = "Studio / Bachelor Flatlet";
      }

      // Assign room images from property images slice
      const roomPhotos = propertyImages.slice(index * 2, index * 2 + 3);

      rooms.push({
        id: `${property.id}-room-${index + 1}`,
        name: namePart,
        type: typeCode,
        typeName,
        quantity: qty,
        bedsPerRoom,
        totalBeds: qty * bedsPerRoom,
        monthlyPrice: price,
        deposit: baseDeposit,
        bathroomType: isEnsuite ? "ENSUITE" : isShared12 ? "SHARED_1_2" : "SHARED_COMMUNAL",
        bathroomLabel: isEnsuite ? "Private Ensuite" : isShared12 ? "Semi-Private (1:2)" : "Communal Bathroom",
        isNsfasCapped: isNsfas,
        availabilityStatus: "AVAILABLE_NOW",
        features: [
          "FURNISHED_BED",
          "STUDY_DESK",
          "WARDROBE",
          "WIFI_AP",
          ...(isEnsuite ? ["ENSUITE_BATH"] : []),
          ...(price > 5200 ? ["MINI_FRIDGE"] : []),
        ],
        photos: roomPhotos.length > 0 ? roomPhotos : propertyImages,
      });
    });
  }

  // Fallback if no structured breakdown was found
  if (rooms.length === 0) {
    const totalBedrooms = Math.max(1, property.bedrooms || 1);
    const maxBeds = Math.max(totalBedrooms, property.maxOccupants || totalBedrooms);

    if (totalBedrooms === 1 && maxBeds === 1) {
      rooms.push({
        id: `${property.id}-room-1`,
        name: "Standard Private Bedroom",
        type: "SINGLE_STANDARD",
        typeName: "Single Room (Private)",
        quantity: 1,
        bedsPerRoom: 1,
        totalBeds: 1,
        monthlyPrice: basePrice,
        deposit: baseDeposit,
        bathroomType: "SHARED_1_2",
        bathroomLabel: "Semi-Private (1:2)",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW",
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
        photos: propertyImages,
      });
    } else if (maxBeds > totalBedrooms) {
      // Mix of single and 2-sharing rooms
      const sharingRooms = Math.min(totalBedrooms, maxBeds - totalBedrooms);
      const singleRooms = Math.max(0, totalBedrooms - sharingRooms);

      if (singleRooms > 0) {
        rooms.push({
          id: `${property.id}-room-single`,
          name: "Standard Private Single",
          type: "SINGLE_STANDARD",
          typeName: "Single Room (Private)",
          quantity: singleRooms,
          bedsPerRoom: 1,
          totalBeds: singleRooms,
          monthlyPrice: basePrice + 400,
          deposit: baseDeposit,
          bathroomType: "SHARED_1_2",
          bathroomLabel: "Semi-Private (1:2)",
          isNsfasCapped: true,
          availabilityStatus: "AVAILABLE_NOW",
          features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
          photos: propertyImages.slice(0, 2),
        });
      }

      rooms.push({
        id: `${property.id}-room-double`,
        name: "2-Sharing Double Room",
        type: "DOUBLE_SHARING",
        typeName: "2-Sharing (Double Room)",
        quantity: sharingRooms,
        bedsPerRoom: 2,
        totalBeds: sharingRooms * 2,
        monthlyPrice: basePrice,
        deposit: baseDeposit,
        bathroomType: "SHARED_COMMUNAL",
        bathroomLabel: "Communal Floor Bathrooms",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW",
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
        photos: propertyImages.slice(2, 5).length > 0 ? propertyImages.slice(2, 5) : propertyImages,
      });
    } else {
      rooms.push({
        id: `${property.id}-room-standard`,
        name: "Single Standard Room",
        type: "SINGLE_STANDARD",
        typeName: "Single Room (Private)",
        quantity: totalBedrooms,
        bedsPerRoom: 1,
        totalBeds: totalBedrooms,
        monthlyPrice: basePrice,
        deposit: baseDeposit,
        bathroomType: "SHARED_COMMUNAL",
        bathroomLabel: "Communal Bathrooms",
        isNsfasCapped: true,
        availabilityStatus: "AVAILABLE_NOW",
        features: ["FURNISHED_BED", "STUDY_DESK", "WARDROBE", "WIFI_AP"],
        photos: propertyImages,
      });
    }
  }

  return rooms;
}
