// src/utils/formatDate.ts
type DateStyle = 'long' | 'medium' | 'short' | 'compact';

const dateStyles: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  long: { dateStyle: 'long' },
  medium: { dateStyle: 'medium' },
  short: { dateStyle: 'short' },
  compact: { year: 'numeric', month: '2-digit' },
};

// "4–16 sierpnia 1914", "28 lipca – 6 sierpnia 1914" or "23 sierpnia 1914".
// Locale "en-GB" gives "4–16 August 1914" for the English edition.
export function formatDateRange(start: Date, end: Date, locale = 'pl-PL') {
  const sameDay = start.getTime() === end.getTime();
  if (sameDay) return formatDate(start, 'long', undefined, locale);

  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth();
  if (sameMonth) return `${start.getUTCDate()}–${formatDate(end, 'long', undefined, locale)}`;

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const startLabel = sameYear
    ? formatDate(start, 'long', { dateStyle: undefined, day: 'numeric', month: 'long' }, locale)
    : formatDate(start, 'long', undefined, locale);
  return `${startLabel} – ${formatDate(end, 'long', undefined, locale)}`;
}

export function formatDate(
  date: Date,
  style: DateStyle = 'long',
  options?: Intl.DateTimeFormatOptions,
  locale = 'pl-PL',
) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    ...dateStyles[style],
    ...options,
  }).format(date);
}
