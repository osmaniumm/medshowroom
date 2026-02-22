// ═══════════════════════════════════════════════════════════════════
// KONSTANTEN & KONFIGURATION — ERWEKA Showroom
// ═══════════════════════════════════════════════════════════════════

export const DEVICES = [
  // ─── Dissolution Tester ────────────────────────────────────────
  { id: "dt-950",       num: 1,  name: "DT 950 / DT 9510",          type: "Dissolution",    location: "Showroom", category: "dissolution" },
  { id: "robodis",      num: 2,  name: "RoboDis II+",               type: "Dissolution",    location: "Showroom", category: "dissolution" },
  { id: "hkp",          num: 3,  name: "Hubkolbenpumpe (HKP)",      type: "Dissolution",    location: "Showroom", category: "dissolution" },
  { id: "photometer",   num: 4,  name: "Shimadzu Photometer",       type: "Dissolution",    location: "Showroom", category: "dissolution" },
  { id: "online",       num: 5,  name: "Online System",             type: "Dissolution",    location: "Showroom", category: "dissolution",
    // Wenn Online System gebucht wird, werden automatisch diese Geräte mitgebucht:
    linkedDevices: ["dt-950", "hkp", "photometer"],
  },
  { id: "mediprep",     num: 6,  name: "MediPrep",                  type: "Medienvorbereitung", location: "Showroom", category: "dissolution" },

  // ─── Physikalische Tester ──────────────────────────────────────
  { id: "multicheck",   num: 7,  name: "MultiCheck 6 / EasyCheck",  type: "Bruchfestigkeit",  location: "Showroom", category: "physical" },
  { id: "tbh2",         num: 8,  name: "TBH II",                    type: "Härtetester",      location: "Showroom", category: "physical" },
  { id: "zt732",        num: 9,  name: "ZT 732",                    type: "Zerfallszeit",     location: "Showroom", category: "physical" },
  { id: "tar2",         num: 10, name: "TAR II",                    type: "Friabilität",      location: "Showroom", category: "physical" },
  { id: "svm2",         num: 11, name: "SVM II",                    type: "Stampfvolumeter",  location: "Showroom", category: "physical" },
  { id: "gtl",          num: 12, name: "GTL / GT / GTB",            type: "Granulatfluss",    location: "Showroom", category: "physical" },
  { id: "vdt",          num: 13, name: "VDT/S",                     type: "Vakuum-Dichtigkeit", location: "Showroom", category: "physical" },
];

// Alias für Admin-Seed-Funktion
export const DEFAULT_DEVICES = DEVICES;

// Geräte-IDs die automatisch mitgebucht werden beim Online System
export const LINKED_BOOKINGS = {
  "online": ["dt-950", "hkp", "photometer"],
};

export const DEVICE_CATEGORIES = {
  dissolution: { label: "Dissolution Tester", color: "#0284C7" },
  physical:    { label: "Physikalische Tester", color: "#7C3AED" },
};

export const ROLES = {
  sales: {
    label: "Sales",
    color: "#0284C7",
    bg: "#E0F2FE",
    maxBookingDaysNoApproval: 1,
    canEditDocs: false,
    docAccess: ["manuals"],
    canPriorityBook: false,
    maxWeeksNoApproval: 0,
    description: "Produktdemos & Kundentermine",
  },
  service: {
    label: "Service",
    color: "#7C3AED",
    bg: "#EDE9FE",
    maxBookingDaysNoApproval: 365,
    canEditDocs: true,
    docAccess: ["manuals", "qualification", "software"],
    canPriorityBook: true,
    maxWeeksNoApproval: 52,
    description: "Wartung, Firmware & IQ/OQ",
  },
  application: {
    label: "Application",
    color: "#059669",
    bg: "#D1FAE5",
    maxBookingDaysNoApproval: 14,
    canEditDocs: false,
    docAccess: ["manuals", "qualification", "software"],
    canPriorityBook: false,
    maxWeeksNoApproval: 2,
    description: "Schulungen & Evaluierungen",
  },
  montage: {
    label: "Montage",
    color: "#D97706",
    bg: "#FEF3C7",
    maxBookingDaysNoApproval: 365,
    canEditDocs: true,
    docAccess: ["manuals", "qualification", "software"],
    canPriorityBook: true,
    maxWeeksNoApproval: 52,
    description: "Montage & Geräteaufbau",
  },
  rnd: {
    label: "R&D",
    color: "#DC2626",
    bg: "#FEE2E2",
    maxBookingDaysNoApproval: 365,
    canEditDocs: true,
    docAccess: ["manuals", "qualification", "software"],
    canPriorityBook: true,
    maxWeeksNoApproval: 52,
    description: "Forschung & Entwicklung",
  },
};

export const BOOKING_PURPOSES = {
  sales:       ["Produktdemo", "Kundenbesichtigung", "Vertriebspräsentation", "Messeplanung"],
  service:     ["Wartung", "Firmware-Update", "Reparatur", "IQ/OQ-Qualifikation", "Kalibrierung", "Sicherheitsprüfung"],
  application: ["Kundenschulung", "Interne Schulung", "Klinische Evaluierung", "Testprotokoll", "Applikationstest"],
  montage:     ["Geräteaufbau", "Montage", "Inbetriebnahme", "Umbau", "Demontage"],
  rnd:         ["Produktentwicklung", "Prototypentest", "Validierung", "Machbarkeitsstudie", "Langzeittest"],
};

export const DOCUMENTS = {
  manuals: [
    { name: "Bedienungsanleitung",  version: "v2.3", size: "4.2 MB", date: "2024-11-15", ext: "pdf" },
    { name: "Kurzanleitung",        version: "v2.3", size: "1.1 MB", date: "2024-11-15", ext: "pdf" },
    { name: "Sicherheitshinweise",  version: "v1.8", size: "0.8 MB", date: "2024-09-20", ext: "pdf" },
  ],
  qualification: [
    { name: "IQ-Protokoll",  version: "2024", size: "2.8 MB", date: "2024-10-20", ext: "pdf" },
    { name: "OQ-Protokoll",  version: "2024", size: "3.1 MB", date: "2024-10-22", ext: "pdf" },
    { name: "PQ-Protokoll",  version: "2024", size: "2.4 MB", date: "2024-10-25", ext: "pdf" },
  ],
  software: [
    { name: "Firmware",       version: "v1.5.2", size: "156 MB",  date: "2024-12-01", ext: "zip" },
    { name: "Release Notes",  version: "v1.5.2", size: "0.3 MB",  date: "2024-12-01", ext: "pdf" },
    { name: "Treiber-Paket",  version: "v3.0.1", size: "42 MB",   date: "2024-11-10", ext: "zip" },
  ],
};
