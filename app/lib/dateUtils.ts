// ================= GLOBAL DATE FORMAT =================

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDay(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
  });
}

// ================= VALIDATION =================

export function isPastDate(date: Date) {
  const today = new Date();
  today.setHours(0,0,0,0);
  return date < today;
}