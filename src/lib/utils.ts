import { feature, neighbors as topoNeighbors } from "topojson-client";
import { geoCentroid } from "d3-geo";

export interface TopologyLike {
  objects: Record<string, any>;
  arcs: any[];
  transform?: any;
  type: string;
}

export const buildNeighbors = (topology: TopologyLike, objectKey: string): number[][] => {
  const object = topology.objects[objectKey];
  return topoNeighbors((object.geometries || object?.objects?.geometries) ?? []);
};

export const buildCentroids = (topology: TopologyLike, objectKey: string) => {
  const object = topology.objects[objectKey];
  const geojson = feature(topology as any, object as any);
  const geometries = (geojson as any).features as Array<any>;
  return geometries.map((f) => ({
    id: f.id ?? f.properties?.ISO_A3 ?? f.properties?.iso_a3 ?? f.properties?.ADMIN ?? f.properties?.NAME,
    name: f.properties?.NAME ?? f.properties?.ADMIN,
    centroid: geoCentroid(f)
  }));
};

export const greatCircleDistanceKm = (a: [number, number], b: [number, number]) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
};

export const bearingDirection = (a: [number, number], b: [number, number]) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let brng = (toDeg(Math.atan2(y, x)) + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(brng / 45) % 8;
  return dirs[idx];
};

export const toTemperatureHint = (km: number) => {
  if (km < 500) return "perfect";
  if (km < 1500) return "hot";
  if (km < 3000) return "warm";
  return "cold";
};

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate reading time in minutes based on word count
 * Uses standard reading speed of 200 words per minute
 * @param content - The text content to calculate reading time for
 * @returns Reading time in minutes (minimum 1 minute)
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  
  // Count words by splitting on whitespace and filtering out empty strings
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Standard reading speed: 200 words per minute
  const readingSpeed = 200;
  const readingTime = Math.ceil(wordCount / readingSpeed);
  
  // Return minimum of 1 minute
  return Math.max(1, readingTime);
}

/**
 * Calculate reading time from word count
 * @param wordCount - Number of words
 * @returns Reading time in minutes (minimum 1 minute)
 */
export function calculateReadingTimeFromWordCount(wordCount: number): number {
  const readingSpeed = 200;
  const readingTime = Math.ceil(wordCount / readingSpeed);
  return Math.max(1, readingTime);
}
