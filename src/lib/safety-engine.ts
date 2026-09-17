/**
 * Student-Centric Safety Score Matrix & Municipal Bylaw Engine
 * 
 * Evaluates student accommodation compliance mapped to South African National Standards (SANS 10400)
 * and the Department of Higher Education and Training (DHET) Gazetted Minimum Norms & Standards
 * for Student Housing.
 */

export type SafetyGrade = "Grade A" | "Grade B" | "Grade C" | "Grade D" | "Grade E";

export interface SafetyCheckpoint {
  id: string;
  category: "FIRE_SAFETY" | "SECURITY" | "STRUCTURAL_HEALTH" | "UTILITIES" | "LOCATION_RISK";
  bylawReference: string; // e.g., "SANS 10400-T: Fire Protection", "SANS 1475-1"
  label: string;
  description: string;
  weight: number; // 1 to 5 relative risk coefficient
  mandatoryForDHET: boolean; // Critical fail condition
}

export interface CheckpointResult {
  checkpointId: string;
  passed: boolean | null;
  notes?: string;
  verifiedAt?: string;
  inspectorId?: string;
}

export interface SafetyEvaluationOutput {
  rawScore: number; // 0 to 100
  grade: SafetyGrade;
  isDHETCompliant: boolean;
  statusLabel: string;
  categoryBreakdown: Record<
    string,
    {
      categoryName: string;
      score: number; // 0 - 100
      passedItems: number;
      totalItems: number;
    }
  >;
  criticalFails: string[];
  recommendations: string[];
}

export const MUNICIPAL_BYLAW_CHECKPOINTS: SafetyCheckpoint[] = [
  // Fire Safety (SANS 10400-T & SANS 1475)
  {
    id: "fire_smoke_detectors",
    category: "FIRE_SAFETY",
    bylawReference: "SANS 10400-T (4.12)",
    label: "Interlinked Photoelectric Smoke Alarms",
    description: "Operational optical smoke detectors present in all communal hallways and student bedrooms.",
    weight: 4,
    mandatoryForDHET: true,
  },
  {
    id: "fire_extinguishers_tagged",
    category: "FIRE_SAFETY",
    bylawReference: "SANS 1475-1:2010",
    label: "Certified Fire Extinguishers & Fire Blankets",
    description: "Visible dry-powder fire extinguishers with valid annual service tags and kitchen fire blankets.",
    weight: 4,
    mandatoryForDHET: true,
  },
  {
    id: "fire_emergency_exits",
    category: "FIRE_SAFETY",
    bylawReference: "SANS 10400-T (4.16)",
    label: "Unobstructed Emergency Escape Routes",
    description: "Illuminated exit signage and fail-safe unlock exit doors with at least 1.1m passage clearance.",
    weight: 4,
    mandatoryForDHET: true,
  },

  // Security & Access Control (SANS 10400-A)
  {
    id: "sec_biometric_perimeter",
    category: "SECURITY",
    bylawReference: "DHET Standard Sec 4.2",
    label: "Biometric / Tag Access & Perimeter Boundary",
    description: "Secure perimeter fencing (minimum 1.8m height) with electronic access control at all ingress points.",
    weight: 5,
    mandatoryForDHET: true,
  },
  {
    id: "sec_window_locks_burglar_bars",
    category: "SECURITY",
    bylawReference: "SANS 10400-A",
    label: "Window Burglar Proofing & Functional Locks",
    description: "All ground-floor and accessible opening windows equipped with fixed steel burglar bars.",
    weight: 3,
    mandatoryForDHET: true,
  },
  {
    id: "sec_cctv_perimeter_lighting",
    category: "SECURITY",
    bylawReference: "DHET Standard Sec 4.5",
    label: "24/7 CCTV & High-Lumen Perimeter Lighting",
    description: "Infrared CCTV monitoring main entryways and adequate night illumination on walkways.",
    weight: 3,
    mandatoryForDHET: false,
  },

  // Structural & Weatherproofing (SANS 10400-B, C, K)
  {
    id: "struct_integrity_dampness",
    category: "STRUCTURAL_HEALTH",
    bylawReference: "SANS 10400-B",
    label: "Structural Integrity & Rising Damp Proofing",
    description: "No hazardous structural cracking, active water ingress, ceiling sagging, or black mold spores.",
    weight: 4,
    mandatoryForDHET: true,
  },
  {
    id: "struct_ventilation_natural_light",
    category: "STRUCTURAL_HEALTH",
    bylawReference: "SANS 10400-O (Lighting & Ventilation)",
    label: "Natural Ventilation & Glazing Standards",
    description: "Glazing area of at least 10% of floor space and openable ventilation area exceeding 5%.",
    weight: 2,
    mandatoryForDHET: false,
  },

  // Utilities & Resilience (SANS 10142-1)
  {
    id: "util_electrical_coc",
    category: "UTILITIES",
    bylawReference: "SANS 10142-1 (Wiring Code)",
    label: "Valid Electrical Certificate of Compliance (CoC)",
    description: "Current electrical CoC issued within 24 months, with earth leakage and no exposed wiring.",
    weight: 5,
    mandatoryForDHET: true,
  },
  {
    id: "util_potable_running_water",
    category: "UTILITIES",
    bylawReference: "National Building Reg Part P",
    label: "Continuous Potable Water & Sanitary Drainage",
    description: "Hot and cold pressurized water supply (minimum 1 shower and toilet per 4-5 students).",
    weight: 4,
    mandatoryForDHET: true,
  },
  {
    id: "util_loadshedding_resilience",
    category: "UTILITIES",
    bylawReference: "DHET Recommended Resil.",
    label: "Backup Power Inverter & Backup Water Tanks",
    description: "On-site backup electricity for WiFi/security lighting and JoJo water reservoir connection.",
    weight: 2,
    mandatoryForDHET: false,
  },

  // Location Risk & Transit Proximity
  {
    id: "loc_transit_campus_proximity",
    category: "LOCATION_RISK",
    bylawReference: "DHET Radius Guideline",
    label: "Transit Proximity to Campus / Shuttle Route",
    description: "Property is located within 2.5km of university campus or within 400m of official student bus route.",
    weight: 3,
    mandatoryForDHET: false,
  },
  {
    id: "loc_precinct_safety_risk",
    category: "LOCATION_RISK",
    bylawReference: "Municipal Zoning Bylaws",
    label: "Precinct Demarcation & Street Lighting",
    description: "Situated in an established residential or student-approved node with municipal street lighting.",
    weight: 2,
    mandatoryForDHET: false,
  },
];

/**
 * Calculates safety rating and grade based on municipal bylaw audit results.
 */
export function evaluateSafetyScore(
  results: CheckpointResult[],
  checkpoints: SafetyCheckpoint[] = MUNICIPAL_BYLAW_CHECKPOINTS
): SafetyEvaluationOutput {
  const checkpointMap = new Map<string, SafetyCheckpoint>(checkpoints.map((c) => [c.id, c]));

  let totalPossibleWeight = 0;
  let earnedWeight = 0;
  const criticalFails: string[] = [];
  const recommendations: string[] = [];

  const categoryTotals: Record<
    string,
    { categoryName: string; totalWeight: number; earnedWeight: number; passedCount: number; totalCount: number }
  > = {
    FIRE_SAFETY: { categoryName: "Fire Safety & Extinguishers", totalWeight: 0, earnedWeight: 0, passedCount: 0, totalCount: 0 },
    SECURITY: { categoryName: "Perimeter & Biometric Security", totalWeight: 0, earnedWeight: 0, passedCount: 0, totalCount: 0 },
    STRUCTURAL_HEALTH: { categoryName: "Structural Health & Ventilation", totalWeight: 0, earnedWeight: 0, passedCount: 0, totalCount: 0 },
    UTILITIES: { categoryName: "Utilities & Electrical CoC", totalWeight: 0, earnedWeight: 0, passedCount: 0, totalCount: 0 },
    LOCATION_RISK: { categoryName: "Transit & Precinct Risk", totalWeight: 0, earnedWeight: 0, passedCount: 0, totalCount: 0 },
  };

  for (const checkpoint of checkpoints) {
    const res = results.find((r) => r.checkpointId === checkpoint.id);
    const passed = res?.passed === true;

    totalPossibleWeight += checkpoint.weight;
    const cat = categoryTotals[checkpoint.category];
    if (cat) {
      cat.totalWeight += checkpoint.weight;
      cat.totalCount += 1;
      if (passed) {
        cat.earnedWeight += checkpoint.weight;
        cat.passedCount += 1;
      }
    }

    if (passed) {
      earnedWeight += checkpoint.weight;
    } else {
      if (checkpoint.mandatoryForDHET) {
        criticalFails.push(`Mandatory Failure: ${checkpoint.label} (${checkpoint.bylawReference})`);
      }
      recommendations.push(`Remediate: ${checkpoint.label} - ${checkpoint.description}`);
    }
  }

  const rawPercentage = totalPossibleWeight > 0 ? (earnedWeight / totalPossibleWeight) * 100 : 0;
  const rawScore = Math.round(rawPercentage);

  // Grade Mapping
  let grade: SafetyGrade = "Grade E";
  let statusLabel = "Non-Compliant";

  if (rawScore >= 90 && criticalFails.length === 0) {
    grade = "Grade A";
    statusLabel = "DHET Gold Standard - Fully Accredited";
  } else if (rawScore >= 80 && criticalFails.length === 0) {
    grade = "Grade B";
    statusLabel = "DHET Compliant - Standard Accreditation";
  } else if (rawScore >= 70) {
    grade = "Grade C";
    statusLabel = "Conditionally Compliant - Minor Remediation Required";
  } else if (rawScore >= 60) {
    grade = "Grade D";
    statusLabel = "High Caution - Action Plan Mandated";
  } else {
    grade = "Grade E";
    statusLabel = "Non-Compliant - Accreditation Withheld";
  }

  const categoryBreakdown: SafetyEvaluationOutput["categoryBreakdown"] = {};
  for (const [key, data] of Object.entries(categoryTotals)) {
    const catScore = data.totalWeight > 0 ? Math.round((data.earnedWeight / data.totalWeight) * 100) : 0;
    categoryBreakdown[key] = {
      categoryName: data.categoryName,
      score: catScore,
      passedItems: data.passedCount,
      totalItems: data.totalCount,
    };
  }

  return {
    rawScore,
    grade,
    isDHETCompliant: criticalFails.length === 0 && rawScore >= 80,
    statusLabel,
    categoryBreakdown,
    criticalFails,
    recommendations,
  };
}
