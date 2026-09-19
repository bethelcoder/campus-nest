export interface CampusLocation {
  id: string;
  universityName: string;
  campusName: string;
  shortCode: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  address: string;
  mainGate: string;
}

export const SA_CAMPUSES: CampusLocation[] = [
  // University of Johannesburg (UJ)
  {
    id: "uj-apk",
    universityName: "University of Johannesburg",
    campusName: "Auckland Park Kingsway Campus (APK)",
    shortCode: "UJ APK",
    city: "Johannesburg",
    province: "Gauteng",
    lat: -26.1824,
    lng: 28.0004,
    address: "Kingsway Ave & University Rd, Auckland Park, Johannesburg, 2092",
    mainGate: "Kingsway Ave Main Gate",
  },
  {
    id: "uj-apb",
    universityName: "University of Johannesburg",
    campusName: "Auckland Park Bunting Road Campus (APB)",
    shortCode: "UJ APB",
    city: "Johannesburg",
    province: "Gauteng",
    lat: -26.1884,
    lng: 28.0163,
    address: "Bunting Rd, Cottesloe, Johannesburg, 2092",
    mainGate: "Bunting Road Main Entrance",
  },
  {
    id: "uj-dfc",
    universityName: "University of Johannesburg",
    campusName: "Doornfontein Campus (DFC)",
    shortCode: "UJ DFC",
    city: "Johannesburg",
    province: "Gauteng",
    lat: -26.1925,
    lng: 28.0577,
    address: "Beit St, Doornfontein, Johannesburg, 2028",
    mainGate: "Currey Street Entrance",
  },
  {
    id: "uj-swc",
    universityName: "University of Johannesburg",
    campusName: "Soweto Campus (SWC)",
    shortCode: "UJ SWC",
    city: "Johannesburg",
    province: "Gauteng",
    lat: -26.2575,
    lng: 27.8631,
    address: "Chris Hani Rd, Pimville, Soweto, 1809",
    mainGate: "Old Potchefstroom Rd Entrance",
  },

  // University of the Witwatersrand (Wits)
  {
    id: "wits-east",
    universityName: "University of the Witwatersrand",
    campusName: "Braamfontein East Campus",
    shortCode: "Wits East",
    city: "Johannesburg",
    province: "Gauteng",
    lat: -26.1912,
    lng: 28.0302,
    address: "1 Jan Smuts Ave, Braamfontein, Johannesburg, 2000",
    mainGate: "Jan Smuts Main Gate",
  },
  {
    id: "wits-west",
    universityName: "University of the Witwatersrand",
    campusName: "Braamfontein West Campus",
    shortCode: "Wits West",
    city: "Johannesburg",
    province: "Gauteng",
    lat: -26.1878,
    lng: 28.0245,
    address: "Enoch Sontonga Ave, Braamfontein, Johannesburg, 2000",
    mainGate: "Empire Road Overpass Gate",
  },
  {
    id: "wits-health",
    universityName: "University of the Witwatersrand",
    campusName: "Parktown Health Sciences Campus",
    shortCode: "Wits Health",
    city: "Johannesburg",
    province: "Gauteng",
    lat: -26.1772,
    lng: 28.0441,
    address: "7 York Rd, Parktown, Johannesburg, 2193",
    mainGate: "York Road Medical Gate",
  },

  // University of Pretoria (UP)
  {
    id: "up-hatfield",
    universityName: "University of Pretoria",
    campusName: "Hatfield Main Campus",
    shortCode: "UP Hatfield",
    city: "Pretoria",
    province: "Gauteng",
    lat: -25.7545,
    lng: 28.2314,
    address: "Lynnwood Rd, Hatfield, Pretoria, 0002",
    mainGate: "University Rd / Prospect St Gate",
  },
  {
    id: "up-groenkloof",
    universityName: "University of Pretoria",
    campusName: "Groenkloof Education Campus",
    shortCode: "UP Groenkloof",
    city: "Pretoria",
    province: "Gauteng",
    lat: -25.7709,
    lng: 28.2104,
    address: "George Storrar Dr, Groenkloof, Pretoria, 0181",
    mainGate: "Leyds Street Gate",
  },
  {
    id: "up-prinsshof",
    universityName: "University of Pretoria",
    campusName: "Prinshof Health Sciences Campus",
    shortCode: "UP Prinshof",
    city: "Pretoria",
    province: "Gauteng",
    lat: -25.7329,
    lng: 28.1994,
    address: "Dr Savage Rd, Prinshof, Pretoria, 0084",
    mainGate: "Dr Savage Road Entrance",
  },

  // Tshwane University of Technology (TUT)
  {
    id: "tut-main",
    universityName: "Tshwane University of Technology",
    campusName: "Pretoria Main Campus",
    shortCode: "TUT Main",
    city: "Pretoria",
    province: "Gauteng",
    lat: -25.7314,
    lng: 28.1624,
    address: "Staatsartillerie Rd, Pretoria West, Pretoria, 0183",
    mainGate: "Staatsartillerie Road Main Gate",
  },
  {
    id: "tut-arcadia",
    universityName: "Tshwane University of Technology",
    campusName: "Arcadia Campus",
    shortCode: "TUT Arcadia",
    city: "Pretoria",
    province: "Gauteng",
    lat: -25.7483,
    lng: 28.2045,
    address: "175 Nelson Mandela Dr, Arcadia, Pretoria, 0007",
    mainGate: "Nelson Mandela Drive Gate",
  },

  // University of Cape Town (UCT)
  {
    id: "uct-upper",
    universityName: "University of Cape Town",
    campusName: "Upper Campus",
    shortCode: "UCT Upper",
    city: "Cape Town",
    province: "Western Cape",
    lat: -33.9577,
    lng: 18.4612,
    address: "Rondebosch, Cape Town, 7700",
    mainGate: "University Avenue / North Lane Gate",
  },
  {
    id: "uct-middle-lower",
    universityName: "University of Cape Town",
    campusName: "Middle & Lower Campus",
    shortCode: "UCT Lower",
    city: "Cape Town",
    province: "Western Cape",
    lat: -33.9535,
    lng: 18.4698,
    address: "Woolsack Dr, Rondebosch, Cape Town, 7700",
    mainGate: "Main Road / Tugwell Gate",
  },
  {
    id: "uct-med",
    universityName: "University of Cape Town",
    campusName: "Medical Health Sciences Campus",
    shortCode: "UCT Medical",
    city: "Cape Town",
    province: "Western Cape",
    lat: -33.9419,
    lng: 18.4638,
    address: "Anzio Rd, Observatory, Cape Town, 7925",
    mainGate: "Anzio Road Entrance",
  },

  // University of the Western Cape (UWC)
  {
    id: "uwc-bellville",
    universityName: "University of the Western Cape",
    campusName: "Bellville Main Campus",
    shortCode: "UWC Bellville",
    city: "Cape Town",
    province: "Western Cape",
    lat: -33.9329,
    lng: 18.6288,
    address: "Robert Sobukwe Rd, Bellville, Cape Town, 7535",
    mainGate: "Robert Sobukwe Road Gate",
  },

  // Stellenbosch University
  {
    id: "su-main",
    universityName: "Stellenbosch University",
    campusName: "Stellenbosch Main Campus",
    shortCode: "SU Main",
    city: "Stellenbosch",
    province: "Western Cape",
    lat: -33.9322,
    lng: 18.8644,
    address: "Victoria St, Stellenbosch Central, Stellenbosch, 7600",
    mainGate: "Victoria Street Hub",
  },
  {
    id: "su-tygerberg",
    universityName: "Stellenbosch University",
    campusName: "Tygerberg Medical Campus",
    shortCode: "SU Tygerberg",
    city: "Cape Town",
    province: "Western Cape",
    lat: -33.9069,
    lng: 18.6133,
    address: "Francie Van Zijl Dr, Tygerberg, Cape Town, 7505",
    mainGate: "Francie Van Zijl Entrance",
  },

  // University of KwaZulu-Natal (UKZN)
  {
    id: "ukzn-howard",
    universityName: "University of KwaZulu-Natal",
    campusName: "Howard College Campus",
    shortCode: "UKZN Howard",
    city: "Durban",
    province: "KwaZulu-Natal",
    lat: -29.8674,
    lng: 30.9818,
    address: "Mazisi Kunene Rd, Glenwood, Durban, 4041",
    mainGate: "Gate 1 Mazisi Kunene",
  },
  {
    id: "ukzn-westville",
    universityName: "University of KwaZulu-Natal",
    campusName: "Westville Campus",
    shortCode: "UKZN Westville",
    city: "Durban",
    province: "KwaZulu-Natal",
    lat: -29.8178,
    lng: 30.9427,
    address: "University Rd, Westville, Durban, 3629",
    mainGate: "Main Access Gate 1",
  },

  // Nelson Mandela University (NMU)
  {
    id: "nmu-south",
    universityName: "Nelson Mandela University",
    campusName: "South Campus",
    shortCode: "NMU South",
    city: "Gqeberha",
    province: "Eastern Cape",
    lat: -34.0042,
    lng: 25.6713,
    address: "University Way, Summerstrand, Gqeberha, 6001",
    mainGate: "University Way Gate",
  },

  // University of the Free State (UFS)
  {
    id: "ufs-bloem",
    universityName: "University of the Free State",
    campusName: "Bloemfontein Campus",
    shortCode: "UFS Main",
    city: "Bloemfontein",
    province: "Free State",
    lat: -29.1107,
    lng: 26.1837,
    address: "205 Nelson Mandela Dr, Park West, Bloemfontein, 9301",
    mainGate: "DF Malherbe Gate",
  },
];

/**
 * Calculate great-circle distance between two coordinates in kilometers (Haversine formula).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Commute estimate breakdown based on distance in kilometers.
 */
export interface CommuteEstimate {
  distanceKm: number;
  walkingMinutes: number;
  cyclingMinutes: number;
  transitMinutes: number;
  drivingMinutes: number;
  isWalkable: boolean;
}

export function estimateCommute(distanceKm: number): CommuteEstimate {
  // Walking avg speed ~ 4.8 km/h + 2 min buffer
  const walkingMinutes = Math.max(2, Math.round((distanceKm / 4.8) * 60));
  // Cycling avg speed ~ 14 km/h + 2 min buffer
  const cyclingMinutes = Math.max(2, Math.round((distanceKm / 14) * 60));
  // Transit avg speed ~ 18 km/h + 5 min wait buffer
  const transitMinutes = Math.max(5, Math.round((distanceKm / 18) * 60 + 4));
  // Driving avg speed ~ 30 km/h + 3 min traffic
  const drivingMinutes = Math.max(3, Math.round((distanceKm / 30) * 60 + 2));

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    walkingMinutes,
    cyclingMinutes,
    transitMinutes,
    drivingMinutes,
    isWalkable: distanceKm <= 2.0,
  };
}

/**
 * Find the closest university campus given property coordinates.
 */
export function findNearestCampus(
  lat: number,
  lng: number
): { campus: CampusLocation; distanceKm: number } | null {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

  let nearest: CampusLocation | null = null;
  let minDistance = Infinity;

  for (const campus of SA_CAMPUSES) {
    const dist = calculateDistanceKm(lat, lng, campus.lat, campus.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = campus;
    }
  }

  if (!nearest) return null;
  return { campus: nearest, distanceKm: minDistance };
}

/**
 * Find campus by name or university name match.
 */
export function findCampusByName(
  universityName?: string | null,
  campusName?: string | null
): CampusLocation | null {
  if (!universityName && !campusName) return null;

  const normalizedUni = (universityName || "").toLowerCase().trim();
  const normalizedCamp = (campusName || "").toLowerCase().trim();

  // 1. Exact or contains match on both
  if (normalizedUni && normalizedCamp) {
    const match = SA_CAMPUSES.find(
      (c) =>
        c.universityName.toLowerCase().includes(normalizedUni) &&
        (c.campusName.toLowerCase().includes(normalizedCamp) ||
          normalizedCamp.includes(c.campusName.toLowerCase()))
    );
    if (match) return match;
  }

  // 2. Match campus name directly
  if (normalizedCamp) {
    const match = SA_CAMPUSES.find(
      (c) =>
        c.campusName.toLowerCase().includes(normalizedCamp) ||
        c.shortCode.toLowerCase().includes(normalizedCamp)
    );
    if (match) return match;
  }

  // 3. Match university name
  if (normalizedUni) {
    const match = SA_CAMPUSES.find((c) =>
      c.universityName.toLowerCase().includes(normalizedUni)
    );
    if (match) return match;
  }

  return null;
}
