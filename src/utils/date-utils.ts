export function formatDate(
  dateInput: Date | string | number,
  format: string = 'YYYY-MM-DD',
  locale: string = 'en-US'
): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';

  const pad = (n: number) => n.toString().padStart(2, '0');

  const map: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    YY: date.getFullYear().toString().slice(-2),
    MM: pad(date.getMonth() + 1),
    M: (date.getMonth() + 1).toString(),
    DD: pad(date.getDate()),
    D: date.getDate().toString(),
    HH: pad(date.getHours()),
    H: date.getHours().toString(),
    mm: pad(date.getMinutes()),
    m: date.getMinutes().toString(),
    ss: pad(date.getSeconds()),
    s: date.getSeconds().toString(),
    dddd: date.toLocaleDateString(locale, { weekday: 'long' }),
    ddd: date.toLocaleDateString(locale, { weekday: 'short' }),
    MMMM: date.toLocaleDateString(locale, { month: 'long' }),
    MMM: date.toLocaleDateString(locale, { month: 'short' }),
  };

  return format.replace(/YYYY|YY|MMMM|MMM|MM|M|DD|D|HH|H|mm|m|ss|s|dddd|ddd/g, (token) => map[token] || token);
}
