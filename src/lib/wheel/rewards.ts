export interface WheelSegment {
  id: string;
  kind: "ORB" | "XP" | "STREAK_FREEZE";
  value: number;
  weight: number;
  label: string;
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: "ORB_1", kind: "ORB", value: 1, weight: 25, label: "+1 Orb" },
  { id: "ORB_2", kind: "ORB", value: 2, weight: 15, label: "+2 Orbs" },
  { id: "XP_25", kind: "XP", value: 25, weight: 22, label: "+25 XP" },
  { id: "XP_50", kind: "XP", value: 50, weight: 12, label: "+50 XP" },
  { id: "STREAK_1", kind: "STREAK_FREEZE", value: 1, weight: 8, label: "Streak Freeze" },
  { id: "ORB_3", kind: "ORB", value: 3, weight: 8, label: "+3 Orbs" },
  { id: "XP_75", kind: "XP", value: 75, weight: 6, label: "+75 XP" },
  { id: "STREAK_2", kind: "STREAK_FREEZE", value: 2, weight: 4, label: "Streak Freeze x2" }
];

/**
 * Pick a weighted random segment from the array
 * @param segments Array of segments with weights
 * @param randomFloat Random float between 0 and 1
 * @returns The selected segment and its index
 */
export function pickWeighted(segments: WheelSegment[], randomFloat: number): { segment: WheelSegment; index: number } {
  const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
  const randomValue = randomFloat * totalWeight;
  
  let currentWeight = 0;
  for (let i = 0; i < segments.length; i++) {
    currentWeight += segments[i].weight;
    if (randomValue <= currentWeight) {
      return { segment: segments[i], index: i };
    }
  }
  
  // Fallback to last segment (should never happen with proper random values)
  return { segment: segments[segments.length - 1], index: segments.length - 1 };
}

/**
 * Calculate the angle for a segment index (for wheel positioning)
 * @param index Segment index
 * @param totalSegments Total number of segments
 * @returns Angle in degrees
 */
export function getSegmentAngle(index: number, totalSegments: number): number {
  return (360 / totalSegments) * index;
}

/**
 * Calculate the center angle for a segment (for pointer alignment)
 * @param index Segment index
 * @param totalSegments Total number of segments
 * @returns Center angle in degrees
 */
export function getSegmentCenterAngle(index: number, totalSegments: number): number {
  const segmentAngle = 360 / totalSegments;
  return (segmentAngle * index) + (segmentAngle / 2);
}
