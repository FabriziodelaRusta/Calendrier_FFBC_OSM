/**
 * Formatting helpers for dates, distances, and text in French
 */

export function formatDateFrench(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateShortFrench(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getDisciplineColor(type: string): { bg: string; text: string; border: string; hex: string } {
  const t = type.toUpperCase();
  if (t.includes('VTT')) {
    return { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600', hex: '#059669' };
  }
  if (t.includes('GRAVEL')) {
    return { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600', hex: '#d97706' };
  }
  return { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700', hex: '#2563eb' };
}
