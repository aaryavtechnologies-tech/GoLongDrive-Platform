import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeFormatDate(
  dateValue: string | number | Date | null | undefined,
  formatString: string = 'MMMM dd, yyyy',
  fallback: string = 'N/A'
): string {
  if (!dateValue) return fallback;
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? fallback : format(d, formatString);
}

export function getMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:')) return path;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.golongdrive.online/api/v1';
  const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
}


