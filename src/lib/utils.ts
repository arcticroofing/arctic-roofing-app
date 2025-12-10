import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateUTC(date?: string | null | Date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return d.toLocaleDateString(undefined, { timeZone: 'UTC' });
  } catch (e) {
    return d.toLocaleDateString();
  }
}
