// src/utils/formatDate.ts
type DateStyle = 'long' | 'medium' | 'short' | 'compact';

const dateStyles: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  long: { dateStyle: 'long' },
  medium: { dateStyle: 'medium' },
  short: { dateStyle: 'short' },
  compact: { year: 'numeric', month: '2-digit' },
};

// "4–16 sierpnia 1914", "28 lipca – 6 sierpnia 1914" or "23 sierpnia 1914".
export function formatDateRange(start: Date, end: Date) {
  const sameDay = start.getTime() === end.getTime();
  if (sameDay) return formatDate(start);

  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();
  if (sameMonth) return `${start.getUTCDate()}–${formatDate(end)}`;

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const startLabel = sameYear
    ? formatDate(start, 'long', { dateStyle: undefined, day: 'numeric', month: 'long' })
    : formatDate(start);
  return `${startLabel} – ${formatDate(end)}`;
}

export function formatDate(
  date: Date,
  style: DateStyle = 'long',
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'UTC',
    ...dateStyles[style],
    ...options,
  }).format(date);
}
