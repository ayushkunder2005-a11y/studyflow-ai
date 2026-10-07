// Date & Calendar Utility Functions

export function formatTime(isoStringOrTime) {
  if (!isoStringOrTime) return '';
  if (isoStringOrTime.length === 5 && isoStringOrTime.includes(':')) {
    // Already HH:MM
    const [h, m] = isoStringOrTime.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  }
  const date = new Date(isoStringOrTime);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function format24Time(isoString) {
  const d = new Date(isoString);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDayAndDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function isSameDay(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

export function isToday(d) {
  return isSameDay(d, new Date());
}

export function getWeekDays(referenceDate = new Date()) {
  const ref = new Date(referenceDate);
  const day = ref.getDay();
  // We treat Monday as first day (day = 1). If Sunday (0), distance is -6
  const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(ref.setDate(diff));
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

export function getRelativeDaysText(targetDateIso) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDateIso);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays > 7) return `In ${Math.round(diffDays / 7)} weeks`;
  return `${Math.abs(diffDays)} days ago`;
}

export function intervalsOverlap(startA, endA, startB, endB) {
  const a1 = new Date(startA).getTime();
  const a2 = new Date(endA).getTime();
  const b1 = new Date(startB).getTime();
  const b2 = new Date(endB).getTime();
  return a1 < b2 && a2 > b1;
}

export function addMinutesToIso(isoStr, minutes) {
  const d = new Date(isoStr);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}
