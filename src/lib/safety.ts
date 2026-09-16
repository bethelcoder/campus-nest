import type { ChecklistCategory } from "@prisma/client";

export interface ChecklistTemplateItem {
  category: ChecklistCategory;
  label: string;
  weight: number;
}

// The standard checklist every new property is seeded with. Landlords
// answer pass/fail on each; the safety score is a weighted percentage of
// items passed, so a missing fire extinguisher (weight 3) hurts the score
// more than a missing bike rack (weight 1).
export const STANDARD_CHECKLIST: ChecklistTemplateItem[] = [
  { category: "SECURITY", label: "Property has a working perimeter gate or fence", weight: 2 },
  { category: "SECURITY", label: "All external doors have functioning locks", weight: 3 },
  { category: "SECURITY", label: "Adequate exterior lighting at entrances", weight: 2 },
  { category: "FIRE_SAFETY", label: "Working smoke detector(s) installed", weight: 3 },
  { category: "FIRE_SAFETY", label: "Accessible fire extinguisher or fire blanket", weight: 3 },
  { category: "FIRE_SAFETY", label: "Clear, unobstructed emergency exit route", weight: 3 },
  { category: "UTILITIES", label: "Stable electricity supply (no exposed wiring)", weight: 3 },
  { category: "UTILITIES", label: "Reliable running water and functioning plumbing", weight: 2 },
  { category: "UTILITIES", label: "Backup water storage or generator (load-shedding resilience)", weight: 1 },
  { category: "BUILDING_STRUCTURE", label: "No visible structural cracks or water damage", weight: 3 },
  { category: "BUILDING_STRUCTURE", label: "Windows and doors are weatherproof and secure", weight: 2 },
  { category: "LOCATION_RISK", label: "Located in an area with acceptable crime risk", weight: 2 },
  { category: "LOCATION_RISK", label: "Reasonable proximity to public transport/campus shuttle", weight: 1 },
];

/**
 * Weighted percentage of checklist items marked `passed`, scaled to 0-10.
 * Items that haven't been answered yet (`passed === null`) are excluded
 * from the calculation entirely, rather than counted as failed — a
 * half-completed checklist should show as "incomplete", not "unsafe".
 */
export function calculateSafetyScore(
  items: Array<{ passed: boolean | null; weight: number }>
): number | null {
  const answered = items.filter((i) => i.passed !== null);
  if (answered.length === 0) return null;

  const totalWeight = answered.reduce((sum, i) => sum + i.weight, 0);
  const passedWeight = answered.reduce(
    (sum, i) => sum + (i.passed ? i.weight : 0),
    0
  );
  if (totalWeight === 0) return null;

  const score = (passedWeight / totalWeight) * 10;
  return Math.round(score * 10) / 10; // one decimal place
}

export function isChecklistComplete(
  items: Array<{ passed: boolean | null }>
): boolean {
  return items.length > 0 && items.every((i) => i.passed !== null);
}
