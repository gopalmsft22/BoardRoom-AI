export type ClassValue = string | number | false | null | undefined;

/** Tiny classnames helper (no dependency). */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
