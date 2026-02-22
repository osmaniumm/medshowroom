// ═══════════════════════════════════════════════════════════════════
// KONSTANTEN & KONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const DEVICES = [
  { id: "device-1", num: 1, name: "Ultraschall-Diagnostik Pro",  type: "Diagnostik",  location: "Raum A1" },
  { id: "device-2", num: 2, name: "CT-Scanner Precision",        type: "Bildgebung",  location: "Raum A2" },
  { id: "device-3", num: 3, name: "MRT-Analysator Elite",        type: "Bildgebung",  location: "Raum B1" },
  { id: "device-4", num: 4, name: "Laboranalytik System X",      type: "Labor",       location: "Raum B2" },
  { id: "device-5", num: 5, name: "Endoskopie-Station Advanced", type: "Endoskopie",  location: "Raum C1" },
];

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
};

export const BOOKING_PURPOSES = {
  sales:       ["Produktdemo", "Kundenbesichtigung", "Vertriebspräsentation", "Messeplanung"],
  service:     ["Wartung", "Firmware-Update", "Reparatur", "IQ/OQ-Qualifikation", "Kalibrierung", "Sicherheitsprüfung"],
  application: ["Kundenschulung", "Interne Schulung", "Klinische Evaluierung", "Testprotokoll", "Applikationstest"],
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
