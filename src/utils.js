// ═══════════════════════════════════════════════════════════════════
// HILFSFUNKTIONEN
// ═══════════════════════════════════════════════════════════════════

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

export const formatDateShort = (d) =>
  new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });

export const formatTime = (d) =>
  new Date(d).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

export const formatDateTime = (d) =>
  `${formatDate(d)}, ${formatTime(d)}`;

export const formatDateLong = (d) =>
  new Date(d).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const addHours = (date, hours) => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
};

export const isSameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export const getWeekDates = (baseDate) => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

export const generateUserId = (name) =>
  "user_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_") + "_" + Date.now().toString(36);

export const checkConflict = (bookings, deviceId, start, end, excludeId = null) => {
  const s = new Date(start);
  const e = new Date(end);
  return bookings.find(
    (b) => b.deviceId === deviceId &&
      b.id !== excludeId &&
      new Date(b.start) < e &&
      new Date(b.end) > s
  );
};

export const findAlternativeDevices = (bookings, devices, start, end, excludeDeviceId) => {
  const s = new Date(start);
  const e = new Date(end);
  return devices.filter((d) =>
    d.id !== excludeDeviceId &&
    !bookings.some((b) => b.deviceId === d.id && new Date(b.start) < e && new Date(b.end) > s)
  );
};

// 30-Minuten Zeitslots generieren (07:00 – 20:00)
export const TIME_SLOTS = Array.from({ length: 27 }, (_, i) => {
  const h = 7 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});
