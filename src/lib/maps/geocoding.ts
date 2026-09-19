/**
 * Suburb coordinate lookups for South African student accommodation hubs.
 */
export const SA_STUDENT_SUBURBS: Record<
  string,
  { lat: number; lng: number; city: string; province: string }
> = {
  // Johannesburg
  "auckland park": { lat: -26.1833, lng: 28.0056, city: "Johannesburg", province: "Gauteng" },
  "melville": { lat: -26.1758, lng: 28.0039, city: "Johannesburg", province: "Gauteng" },
  "braamfontein": { lat: -26.1925, lng: 28.0347, city: "Johannesburg", province: "Gauteng" },
  "cottesloe": { lat: -26.1878, lng: 28.0139, city: "Johannesburg", province: "Gauteng" },
  "parktown": { lat: -26.1786, lng: 28.0417, city: "Johannesburg", province: "Gauteng" },
  "doornfontein": { lat: -26.1947, lng: 28.0569, city: "Johannesburg", province: "Gauteng" },
  "westdene": { lat: -26.1839, lng: 27.9903, city: "Johannesburg", province: "Gauteng" },
  "brixton": { lat: -26.1906, lng: 28.0022, city: "Johannesburg", province: "Gauteng" },
  "richmond": { lat: -26.1794, lng: 28.0167, city: "Johannesburg", province: "Gauteng" },
  "marshalltown": { lat: -26.2069, lng: 28.0417, city: "Johannesburg", province: "Gauteng" },
  "pimville": { lat: -26.2625, lng: 27.8681, city: "Soweto", province: "Gauteng" },

  // Pretoria / Tshwane
  "hatfield": { lat: -25.7511, lng: 28.2381, city: "Pretoria", province: "Gauteng" },
  "hillcrest": { lat: -25.7606, lng: 28.2439, city: "Pretoria", province: "Gauteng" },
  "brooklyn": { lat: -25.7717, lng: 28.2361, city: "Pretoria", province: "Gauteng" },
  "sunnyside": { lat: -25.7561, lng: 28.2083, city: "Pretoria", province: "Gauteng" },
  "arcadia": { lat: -25.7467, lng: 28.2194, city: "Pretoria", province: "Gauteng" },
  "groenkloof": { lat: -25.7733, lng: 28.2139, city: "Pretoria", province: "Gauteng" },
  "pretoria west": { lat: -25.7361, lng: 28.1611, city: "Pretoria", province: "Gauteng" },
  "muckleneuk": { lat: -25.7656, lng: 28.2167, city: "Pretoria", province: "Gauteng" },

  // Cape Town
  "rondebosch": { lat: -33.9625, lng: 18.4722, city: "Cape Town", province: "Western Cape" },
  "observatory": { lat: -33.9389, lng: 18.4694, city: "Cape Town", province: "Western Cape" },
  "rosebank": { lat: -33.9556, lng: 18.4764, city: "Cape Town", province: "Western Cape" },
  "mowbray": { lat: -33.9472, lng: 18.475, city: "Cape Town", province: "Western Cape" },
  "claremont": { lat: -33.9806, lng: 18.4667, city: "Cape Town", province: "Western Cape" },
  "bellville": { lat: -33.8944, lng: 18.6292, city: "Cape Town", province: "Western Cape" },
  "parow": { lat: -33.9056, lng: 18.5972, city: "Cape Town", province: "Western Cape" },

  // Stellenbosch
  "stellenbosch central": { lat: -33.9344, lng: 18.8611, city: "Stellenbosch", province: "Western Cape" },
  "universiteitsoord": { lat: -33.9317, lng: 18.8711, city: "Stellenbosch", province: "Western Cape" },
  "dalsig": { lat: -33.9489, lng: 18.8611, city: "Stellenbosch", province: "Western Cape" },

  // Durban
  "glenwood": { lat: -29.8667, lng: 30.9889, city: "Durban", province: "KwaZulu-Natal" },
  "westville": { lat: -29.8278, lng: 30.9333, city: "Durban", province: "KwaZulu-Natal" },
  "berea": { lat: -29.8528, lng: 31.0028, city: "Durban", province: "KwaZulu-Natal" },

  // Gqeberha / Port Elizabeth
  "summerstrand": { lat: -33.9917, lng: 25.6667, city: "Gqeberha", province: "Eastern Cape" },
  "humewood": { lat: -33.9778, lng: 25.65, city: "Gqeberha", province: "Eastern Cape" },

  // Bloemfontein
  "park west": { lat: -29.1139, lng: 26.2028, city: "Bloemfontein", province: "Free State" },
  "willows": { lat: -29.1194, lng: 26.2111, city: "Bloemfontein", province: "Free State" },
  "universitas": { lat: -29.1167, lng: 26.175, city: "Bloemfontein", province: "Free State" },
};

/**
 * Get coordinates for an address with fallback matching.
 */
export function getCoordinatesForAddress(
  address?: string | null,
  suburb?: string | null,
  city?: string | null
): { lat: number; lng: number } {
  const normSuburb = (suburb || "").toLowerCase().trim();
  const normAddress = (address || "").toLowerCase().trim();
  const normCity = (city || "").toLowerCase().trim();

  // 1. Direct match on suburb
  if (normSuburb && SA_STUDENT_SUBURBS[normSuburb]) {
    // Add a tiny random jitter based on address string hash so identical suburbs don't overlap completely
    const hash = (normAddress + normSuburb).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const jitterLat = ((hash % 100) - 50) * 0.00008;
    const jitterLng = (((hash * 7) % 100) - 50) * 0.00008;
    return {
      lat: SA_STUDENT_SUBURBS[normSuburb].lat + jitterLat,
      lng: SA_STUDENT_SUBURBS[normSuburb].lng + jitterLng,
    };
  }

  // 2. Partial match on suburb key in address
  for (const [key, coords] of Object.entries(SA_STUDENT_SUBURBS)) {
    if (normAddress.includes(key) || (normSuburb && normSuburb.includes(key))) {
      return { lat: coords.lat, lng: coords.lng };
    }
  }

  // 3. Match on City
  if (normCity.includes("cape town")) return { lat: -33.9577, lng: 18.4612 };
  if (normCity.includes("pretoria") || normCity.includes("tshwane")) return { lat: -25.7545, lng: 28.2314 };
  if (normCity.includes("durban")) return { lat: -29.8674, lng: 30.9818 };
  if (normCity.includes("stellenbosch")) return { lat: -33.9322, lng: 18.8644 };
  if (normCity.includes("gqeberha") || normCity.includes("port elizabeth")) return { lat: -34.0042, lng: 25.6713 };
  if (normCity.includes("bloemfontein")) return { lat: -29.1107, lng: 26.1837 };

  // Default: Auckland Park / Johannesburg (UJ Kingsway)
  return { lat: -26.1824, lng: 28.0004 };
}
