// ═══════════════════════════════════════════════════════════════════
// MEDSHOWROOM — Hauptanwendung
// Medizinprodukte Showroom: Gerätemanagement & Buchungssystem
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { DEVICES, ROLES, BOOKING_PURPOSES, DOCUMENTS, LINKED_BOOKINGS, DEVICE_CATEGORIES } from "./constants.js";
import { useBookings, useActivityLog, useOnlineUsers, useDevices } from "./hooks.js";
import AdminPanel, { AdminLogin } from "./AdminPanel.jsx";
import {
  formatDate, formatDateShort, formatTime, formatDateTime, formatDateLong,
  addDays, addHours, isSameDay, getWeekDates, generateUserId,
  checkConflict, findAlternativeDevices, TIME_SLOTS,
} from "./utils.js";

// ═══════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    :root {
      --bg: #F4F5F7; --bg-card: #FFFFFF; --bg-hover: #F8F9FB; --bg-active: #EEF0F4;
      --border: #E4E7EC; --border-light: #F0F1F4;
      --text: #111827; --text-secondary: #6B7280; --text-muted: #9CA3AF;
      --accent: #0F172A; --accent-hover: #1E293B;
      --success: #059669; --success-bg: #D1FAE5;
      --warning: #D97706; --warning-bg: #FEF3C7;
      --danger: #DC2626; --danger-bg: #FEE2E2;
      --info: #0284C7; --info-bg: #E0F2FE;
      --radius: 10px; --radius-lg: 14px; --radius-sm: 6px;
      --shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
      --shadow-lg: 0 10px 40px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04);
      --shadow-xl: 0 20px 60px rgba(0,0,0,.12);
    }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }

    .card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow);
      transition: box-shadow .2s, border-color .2s;
    }
    .card:hover { border-color: #D1D5DB; }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: var(--radius); border: none;
      cursor: pointer; font: 500 13px/1 'Plus Jakarta Sans', sans-serif;
      transition: all .15s; white-space: nowrap;
    }
    .btn:active { transform: scale(.98); }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-ghost { background: transparent; color: var(--text-secondary); }
    .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
    .btn-outline { background: var(--bg-card); border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: var(--bg-hover); border-color: #D1D5DB; }
    .btn-danger { background: var(--danger-bg); color: var(--danger); }
    .btn-danger:hover { background: #FECACA; }
    .btn-sm { padding: 5px 10px; font-size: 12px; border-radius: var(--radius-sm); }

    .input {
      width: 100%; padding: 9px 12px; border-radius: var(--radius);
      border: 1px solid var(--border); font: 400 13px 'Plus Jakarta Sans', sans-serif;
      outline: none; transition: border .15s, box-shadow .15s; background: var(--bg-card);
      color: var(--text);
    }
    .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(15,23,42,.07); }
    .input::placeholder { color: var(--text-muted); }
    select.input {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 10px center; padding-right: 32px;
    }

    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 5px;
      font-size: 11px; font-weight: 600; letter-spacing: .02em;
    }

    .toast {
      animation: slideDown .3s ease;
      padding: 12px 16px; border-radius: var(--radius); background: var(--bg-card);
      box-shadow: var(--shadow-lg); font-size: 13px; display: flex; align-items: center; gap: 8px;
      border: 1px solid var(--border); max-width: 380px;
    }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.35); backdrop-filter: blur(4px);
      z-index: 100; display: flex; align-items: center; justify-content: center;
      animation: fadeIn .15s;
    }
    .modal-content {
      background: var(--bg-card); border-radius: 16px; width: calc(100% - 32px);
      max-width: 580px; max-height: 90vh; overflow-y: auto;
      box-shadow: var(--shadow-xl); animation: scaleIn .2s ease;
    }

    .sidebar-link {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 14px; border-radius: var(--radius); cursor: pointer;
      font-size: 13.5px; font-weight: 500; color: var(--text-secondary);
      transition: all .12s;
    }
    .sidebar-link:hover { background: var(--bg-hover); color: var(--text); }
    .sidebar-link.active { background: var(--accent); color: #fff; }

    .cal-slot {
      min-height: 44px; border-bottom: 1px solid var(--border-light);
      transition: background .1s; cursor: pointer; padding: 2px;
    }
    .cal-slot:hover { background: var(--bg-hover); }

    .stat-card { text-align: center; padding: 20px 16px; }
    .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -.04em; margin: 4px 0 2px; }
    .stat-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }

    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table th {
      padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600;
      color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em;
      background: var(--bg-hover); border-bottom: 1px solid var(--border);
    }
    .table td { padding: 12px 16px; border-bottom: 1px solid var(--border-light); }
    .table tr:hover td { background: var(--bg-hover); }

    .online-dot {
      width: 7px; height: 7px; border-radius: 50%; background: var(--success);
      box-shadow: 0 0 0 2px var(--bg-card), 0 0 6px rgba(5,150,105,.4);
    }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════════
// SVG ICONS (inline, minimal)
// ═══════════════════════════════════════════════════════════════════
const I = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const icons = {
  dashboard:  (p) => <I d="M3 12h18M3 6h18M3 18h18" {...p} />,
  calendar:   (p) => <I d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" {...p} />,
  device:     (p) => <I d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" {...p} />,
  doc:        (p) => <I d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6" {...p} />,
  users:      (p) => <I d={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>} {...p} />,
  plus:       (p) => <I d="M12 5v14M5 12h14" {...p} />,
  close:      (p) => <I d="M18 6L6 18M6 6l12 12" {...p} />,
  check:      (p) => <I d="M20 6L9 17l-5-5" {...p} />,
  alert:      (p) => <I d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" {...p} />,
  download:   (p) => <I d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" {...p} />,
  chevLeft:   (p) => <I d="M15 18l-6-6 6-6" {...p} />,
  chevRight:  (p) => <I d="M9 18l6-6-6-6" {...p} />,
  clock:      (p) => <I d={<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>} {...p} />,
  trash:      (p) => <I d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" {...p} />,
  edit:       (p) => <I d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...p} />,
  star:       (p) => <I d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" {...p} />,
  search:     (p) => <I d="M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35" {...p} />,
  logout:     (p) => <I d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p} />,
  info:       (p) => <I d={<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>} {...p} />,
  shield:     (p) => <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p} />,
  eye:        (p) => <I d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>} {...p} />,
  refresh:    (p) => <I d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" {...p} />,
};

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("medshowroom_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const loginUser = useCallback((user) => {
    localStorage.setItem("medshowroom_user", JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("medshowroom_user");
    setCurrentUser(null);
  }, []);

  if (!currentUser) {
    return <><GlobalStyles /><LoginScreen onLogin={loginUser} /></>;
  }

  return (
    <>
      <GlobalStyles />
      <MainApp currentUser={currentUser} onLogout={logoutUser} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LOGIN SCREEN — Name + Rolle, kein Passwort
// ═══════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [hoverRole, setHoverRole] = useState(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) { setError("Bitte geben Sie Ihren vollständigen Namen ein."); return; }
    if (!role) { setError("Bitte wählen Sie Ihre Abteilung."); return; }
    onLogin({
      id: generateUserId(trimmed),
      name: trimmed,
      role,
    });
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0B0F1A",
      backgroundImage: `
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(15,23,42,.9) 0%, transparent 70%),
        radial-gradient(circle at 20% 80%, rgba(2,132,199,.08) 0%, transparent 40%),
        radial-gradient(circle at 80% 20%, rgba(124,58,237,.06) 0%, transparent 40%)
      `,
    }}>
      <div style={{
        width: "100%", maxWidth: 440, padding: "0 20px",
        animation: "slideUp .5s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20, boxShadow: "0 8px 32px rgba(0,0,0,.3)",
          }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>M</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, letterSpacing: "-.04em" }}>
            MedShowroom
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginTop: 6 }}>
            Gerätemanagement & Buchungssystem
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: "rgba(255,255,255,.04)", borderRadius: 16,
          border: "1px solid rgba(255,255,255,.08)", padding: "32px 28px",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>
              Ihr Name
            </label>
            <input
              type="text" value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Vor- und Nachname"
              autoFocus
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)",
                color: "#fff", fontSize: 15, fontFamily: "inherit", outline: "none",
                transition: "border .15s",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(255,255,255,.25)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,.12)"}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94A3B8", marginBottom: 8 }}>
              Ihre Abteilung
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(ROLES).map(([key, r]) => (
                <button key={key}
                  onClick={() => { setRole(key); setError(""); }}
                  onMouseEnter={() => setHoverRole(key)}
                  onMouseLeave={() => setHoverRole(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                    border: role === key
                      ? `2px solid ${r.color}`
                      : "2px solid rgba(255,255,255,.08)",
                    background: role === key
                      ? `${r.color}15`
                      : hoverRole === key ? "rgba(255,255,255,.04)" : "transparent",
                    transition: "all .15s", textAlign: "left", fontFamily: "inherit",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: r.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0,
                  }}>
                    {r.label[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{r.description}</div>
                  </div>
                  {role === key && (
                    <div style={{ marginLeft: "auto" }}>
                      {icons.check({ size: 18, style: { color: r.color } })}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              padding: "10px 12px", borderRadius: 8, background: "rgba(220,38,38,.1)",
              border: "1px solid rgba(220,38,38,.2)", fontSize: 13, color: "#FCA5A5",
              marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
            }}>
              {icons.alert({ size: 15 })} {error}
            </div>
          )}

          <button onClick={handleSubmit} className="btn btn-primary" style={{
            width: "100%", padding: "12px", fontSize: 15, fontWeight: 600,
            justifyContent: "center", borderRadius: 10,
            background: name.trim() && role ? "var(--accent)" : "#1E293B",
            opacity: name.trim() && role ? 1 : .6,
          }}>
            Showroom betreten
          </button>
        </div>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 20 }}>
          Kein Passwort erforderlich — Zugang über Name & Abteilung
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP (nach Login)
// ═══════════════════════════════════════════════════════════════════
function MainApp({ currentUser, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const { bookings, loading, addBooking, updateBooking, removeBooking } = useBookings();
  const { logs, logActivity } = useActivityLog();
  const onlineUsers = useOnlineUsers(currentUser);
  const { devices: firebaseDevices } = useDevices();

  // Nutze Firebase-Geräte wenn vorhanden, sonst Fallback auf constants.js
  const activeDevices = firebaseDevices.length > 0 ? firebaseDevices : DEVICES;

  const role = ROLES[currentUser.role];

  const notify = useCallback((msg, type = "info") => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setNotifications((p) => [{ id, msg, type }, ...p].slice(0, 10));
    setTimeout(() => setNotifications((p) => p.filter((n) => n.id !== id)), 4500);
  }, []);

  const openNewBooking = useCallback((deviceId = null) => {
    setSelectedDevice(deviceId); setEditingBooking(null); setShowBookingModal(true);
  }, []);

  const openEditBooking = useCallback((booking) => {
    setEditingBooking(booking); setShowBookingModal(true);
  }, []);

  const handleBookingSave = useCallback(async (data) => {
    try {
      if (editingBooking) {
        await updateBooking(editingBooking.id, data);
        await logActivity({
          type: "booking_updated", user: currentUser.name, role: currentUser.role,
          deviceId: data.deviceId, detail: `${data.purpose}: ${formatDateTime(data.start)} – ${formatDateTime(data.end)}`,
        });
        notify("Buchung aktualisiert", "success");
      } else {
        // Hauptbuchung erstellen
        await addBooking(data);
        await logActivity({
          type: "booking_created", user: currentUser.name, role: currentUser.role,
          deviceId: data.deviceId, detail: `${data.purpose}: ${formatDateTime(data.start)} – ${formatDateTime(data.end)}`,
        });

        // Verknüpfte Geräte automatisch mitbuchen (z.B. Online System → DT 950 + HKP + Photometer)
        const linked = LINKED_BOOKINGS[data.deviceId];
        if (linked && linked.length > 0) {
          for (const linkedId of linked) {
            await addBooking({ ...data, deviceId: linkedId, notes: `Automatisch mitgebucht (Online System) — ${data.notes || ""}`.trim() });
            await logActivity({
              type: "booking_created", user: currentUser.name, role: currentUser.role,
              deviceId: linkedId, detail: `Automatisch mitgebucht via Online System: ${formatDateTime(data.start)} – ${formatDateTime(data.end)}`,
            });
          }
          const linkedNames = linked.map((id) => DEVICES.find((d) => d.id === id)?.name).filter(Boolean).join(", ");
          notify(`Online System gebucht inkl. ${linkedNames}`, "success");
        } else {
          notify(`Buchung für ${DEVICES.find((d) => d.id === data.deviceId)?.name} erstellt`, "success");
        }
      }
    } catch (err) {
      notify("Fehler beim Speichern: " + err.message, "error");
    }
    setShowBookingModal(false); setEditingBooking(null); setSelectedDevice(null);
  }, [editingBooking, addBooking, updateBooking, logActivity, currentUser, notify]);

  const handleBookingDelete = useCallback(async (id) => {
    try {
      const b = bookings.find((x) => x.id === id);
      await removeBooking(id);
      await logActivity({
        type: "booking_cancelled", user: currentUser.name, role: currentUser.role,
        deviceId: b?.deviceId, detail: `Storniert: ${b?.purpose}`,
      });
      notify("Buchung storniert", "info");
    } catch (err) {
      notify("Fehler beim Stornieren: " + err.message, "error");
    }
    setShowBookingModal(false); setEditingBooking(null);
  }, [bookings, removeBooking, logActivity, currentUser, notify]);

  const NAV = [
    { key: "dashboard", label: "Dashboard", icon: icons.dashboard },
    { key: "calendar",  label: "Kalender",  icon: icons.calendar },
    { key: "devices",   label: "Geräte",    icon: icons.device },
    { key: "documents", label: "Dokumente", icon: icons.doc },
    { key: "users",     label: "Benutzer",  icon: icons.users },
    { key: "admin",     label: "Admin",     icon: icons.shield },
  ];

  const viewTitles = {
    dashboard: "Dashboard", calendar: "Buchungskalender", devices: "Geräte-Übersicht",
    documents: "Dokumentenmanagement", users: "Benutzerverwaltung", admin: "Admin-Panel",
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", color: "var(--text)", overflow: "hidden" }}>
      {/* ─── SIDEBAR ──────────────────────────────────────────── */}
      <aside style={{
        width: sidebarCollapsed ? 62 : 230, background: "var(--bg-card)",
        borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column",
        transition: "width .2s ease", flexShrink: 0, overflow: "hidden", position: "relative",
      }}>
        {/* Brand */}
        <div style={{
          padding: sidebarCollapsed ? "18px 12px" : "18px 16px",
          borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10,
          minHeight: 62,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>M</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-.03em" }}>MedShowroom</div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: -1 }}>Showroom v1.0</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 1 }}>
          {NAV.map((n) => (
            <div key={n.key} className={`sidebar-link ${view === n.key ? "active" : ""}`}
              onClick={() => setView(n.key)} title={n.label}>
              {n.icon({ size: 17 })}
              {!sidebarCollapsed && <span>{n.label}</span>}
            </div>
          ))}
        </nav>

        {/* Online Users Indicator */}
        {!sidebarCollapsed && onlineUsers.length > 0 && (
          <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
              Online ({onlineUsers.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {onlineUsers.slice(0, 8).map((u) => (
                <div key={u.id} title={u.name} style={{
                  width: 26, height: 26, borderRadius: 7, fontSize: 10, fontWeight: 700,
                  background: ROLES[u.role]?.color || "#94A3B8", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {u.name?.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
              ))}
              {onlineUsers.length > 8 && (
                <div style={{
                  width: 26, height: 26, borderRadius: 7, fontSize: 10, fontWeight: 600,
                  background: "var(--bg-active)", color: "var(--text-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  +{onlineUsers.length - 8}
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Card */}
        {!sidebarCollapsed && (
          <div style={{ padding: "10px 10px 14px", borderTop: "1px solid var(--border)" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
              borderRadius: 10, background: "var(--bg-hover)",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, background: role.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11.5, fontWeight: 700, flexShrink: 0, position: "relative",
              }}>
                {currentUser.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                <div className="online-dot" style={{ position: "absolute", bottom: -1, right: -1 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentUser.name}
                </div>
                <span className="badge" style={{ background: role.bg, color: role.color, fontSize: 9.5, marginTop: 1 }}>
                  {role.label}
                </span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 6, fontSize: 11.5 }}
              onClick={onLogout}>
              {icons.logout({ size: 13 })} Abmelden
            </button>
          </div>
        )}

        {/* Collapse Toggle */}
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
          position: "absolute", right: -12, top: 72, width: 24, height: 24, borderRadius: "50%",
          background: "var(--bg-card)", border: "1px solid var(--border)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--shadow)", zIndex: 5, transition: "right .2s",
        }}>
          {sidebarCollapsed ? icons.chevRight({ size: 11 }) : icons.chevLeft({ size: 11 })}
        </button>
      </aside>

      {/* ─── MAIN ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{
          padding: "14px 24px", background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 62,
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.03em" }}>{viewTitles[view]}</h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
              {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {loading && <span style={{ animation: "pulse 1.5s infinite", marginLeft: 8 }}>⟳ Synchronisiere...</span>}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => openNewBooking()}>
            {icons.plus({ size: 15 })} Neue Buchung
          </button>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "18px 24px 32px" }}>
          {view === "dashboard" && (
            <Dashboard bookings={bookings} currentUser={currentUser}
              onlineUsers={onlineUsers} logs={logs}
              goCalendar={() => setView("calendar")}
              goDevices={() => setView("devices")}
              newBooking={openNewBooking} />
          )}
          {view === "calendar" && (
            <Calendar bookings={bookings} weekOffset={weekOffset} setWeekOffset={setWeekOffset}
              onSlotClick={openNewBooking} onBookingClick={openEditBooking} currentUser={currentUser} />
          )}
          {view === "devices" && (
            <DevicesGrid bookings={bookings}
              onBook={openNewBooking}
              onDocs={(id) => { setSelectedDevice(id); setView("documents"); }} />
          )}
          {view === "documents" && (
            <Documents currentUser={currentUser} selectedDevice={selectedDevice}
              setSelectedDevice={setSelectedDevice} notify={notify} />
          )}
          {view === "users" && (
            <Users bookings={bookings} onlineUsers={onlineUsers} logs={logs} />
          )}
          {view === "admin" && (
            adminUnlocked ? (
              <AdminPanel notify={notify} bookings={bookings} onlineUsers={onlineUsers} logs={logs} />
            ) : (
              <AdminLogin onLogin={() => setAdminUnlocked(true)} />
            )
          )}
        </div>
      </main>

      {/* ─── TOASTS ───────────────────────────────────────────── */}
      <div style={{ position: "fixed", top: 14, right: 14, zIndex: 200, display: "flex", flexDirection: "column", gap: 6 }}>
        {notifications.map((n) => (
          <div key={n.id} className="toast" style={{
            borderLeft: `3px solid ${n.type === "error" ? "var(--danger)" : n.type === "success" ? "var(--success)" : "var(--info)"}`,
          }}>
            {n.type === "success" && icons.check({ size: 15, style: { color: "var(--success)" } })}
            {n.type === "error" && icons.alert({ size: 15, style: { color: "var(--danger)" } })}
            {n.type === "info" && icons.info({ size: 15, style: { color: "var(--info)" } })}
            {n.msg}
          </div>
        ))}
      </div>

      {/* ─── BOOKING MODAL ────────────────────────────────────── */}
      {showBookingModal && (
        <BookingModal
          currentUser={currentUser} bookings={bookings}
          editing={editingBooking} preDevice={selectedDevice}
          onClose={() => { setShowBookingModal(false); setEditingBooking(null); setSelectedDevice(null); }}
          onSave={handleBookingSave} onDelete={handleBookingDelete} notify={notify}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════
function Dashboard({ bookings, currentUser, onlineUsers, logs, goCalendar, goDevices, newBooking }) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  const todayBookings = bookings.filter((b) => new Date(b.start) >= today && new Date(b.start) < tomorrow);
  const weekBookings = bookings.filter((b) => new Date(b.start) >= today && new Date(b.start) < nextWeek);
  const myBookings = bookings.filter((b) => b.userName === currentUser.name);

  return (
    <div style={{ animation: "fadeIn .25s" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Geräte", value: DEVICES.length, color: "var(--accent)" },
          { label: "Heute", value: todayBookings.length, color: "var(--info)" },
          { label: "Diese Woche", value: weekBookings.length, color: "#7C3AED" },
          { label: "Meine Buchungen", value: myBookings.length, color: "var(--success)" },
        ].map((s, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Today's Bookings */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Heute</h3>
            <button className="btn btn-ghost btn-sm" onClick={goCalendar}>Kalender →</button>
          </div>
          {todayBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)" }}>
              {icons.calendar({ size: 24, style: { opacity: .4 } })}
              <p style={{ fontSize: 13, marginTop: 8 }}>Keine Buchungen für heute</p>
            </div>
          ) : todayBookings.map((b) => <BookingRow key={b.id} b={b} />)}
        </div>

        {/* Device Status */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Gerätestatus</h3>
            <button className="btn btn-primary btn-sm" onClick={() => newBooking()}>
              {icons.plus({ size: 12 })} Buchen
            </button>
          </div>
          {DEVICES.map((d) => {
            const occupied = todayBookings.some((b) => b.deviceId === d.id);
            return (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                borderRadius: 8, marginBottom: 4, cursor: "pointer", transition: "background .1s",
              }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                onClick={() => newBooking(d.id)}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: occupied ? "var(--warning)" : "var(--success)",
                  boxShadow: `0 0 5px ${occupied ? "rgba(217,119,6,.4)" : "rgba(5,150,105,.4)"}`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.location}</div>
                </div>
                <span className="badge" style={{
                  background: occupied ? "var(--warning-bg)" : "var(--success-bg)",
                  color: occupied ? "var(--warning)" : "var(--success)",
                }}>
                  {occupied ? "Belegt" : "Frei"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: 18, gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Letzte Aktivitäten</h3>
          {logs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Noch keine Aktivitäten erfasst.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {logs.slice(0, 8).map((l) => (
                <div key={l.id} style={{
                  display: "flex", alignItems: "center", gap: 10, fontSize: 12.5,
                  padding: "6px 0", borderBottom: "1px solid var(--border-light)",
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: l.type?.includes("cancel") ? "var(--danger)"
                      : l.type?.includes("update") ? "var(--warning)" : "var(--success)",
                  }} />
                  <span style={{ fontWeight: 600, minWidth: 120 }}>{l.user}</span>
                  <span style={{ color: "var(--text-secondary)", flex: 1 }}>{l.detail}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 11, whiteSpace: "nowrap" }}>
                    {l.timestamp ? formatTime(l.timestamp) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Booking Row (compact) ───────────────────────────────────────────
function BookingRow({ b }) {
  const device = DEVICES.find((d) => d.id === b.deviceId);
  const rc = ROLES[b.role]?.color || "var(--text-muted)";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
      borderRadius: 8, background: "var(--bg-hover)", marginBottom: 6,
    }}>
      <div style={{ width: 3, height: 32, borderRadius: 2, background: rc, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{device?.name}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
          {formatTime(b.start)} – {formatTime(b.end)} · {b.userName} · {b.purpose}
        </div>
      </div>
      {b.priority && (
        <span className="badge" style={{ background: "var(--warning-bg)", color: "var(--warning)", fontSize: 10 }}>
          Priorität
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════════
function Calendar({ bookings, weekOffset, setWeekOffset, onSlotClick, onBookingClick, currentUser }) {
  const weekDates = getWeekDates(addDays(new Date(), weekOffset * 7));
  const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const hours = Array.from({ length: 12 }, (_, i) => 7 + i);
  const [filterDevice, setFilterDevice] = useState("");

  return (
    <div style={{ animation: "fadeIn .25s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setWeekOffset(weekOffset - 1)}>{icons.chevLeft({ size: 14 })}</button>
          <button className="btn btn-outline btn-sm" onClick={() => setWeekOffset(0)}>Heute</button>
          <button className="btn btn-outline btn-sm" onClick={() => setWeekOffset(weekOffset + 1)}>{icons.chevRight({ size: 14 })}</button>
          <span style={{ fontSize: 14, fontWeight: 700, marginLeft: 8 }}>
            {formatDateShort(weekDates[0])} – {formatDate(weekDates[6])}
          </span>
        </div>
        <select className="input" style={{ width: 200 }} value={filterDevice}
          onChange={(e) => setFilterDevice(e.target.value)}>
          <option value="">Alle Geräte</option>
          {DEVICES.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {/* Header Row */}
        <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)" }}>
          <div style={{ background: "var(--bg-hover)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: 8 }} />
          {weekDates.map((d, i) => {
            const isToday = isSameDay(d, new Date());
            return (
              <div key={i} style={{
                padding: "8px 6px", textAlign: "center",
                borderRight: i < 6 ? "1px solid var(--border-light)" : "none",
                borderBottom: "1px solid var(--border)",
                background: isToday ? "var(--info-bg)" : "var(--bg-hover)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>{dayNames[i]}</div>
                <div style={{
                  fontSize: 17, fontWeight: 800, letterSpacing: "-.02em",
                  color: isToday ? "var(--info)" : "var(--text)",
                }}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div style={{ maxHeight: 520, overflow: "auto" }}>
          {hours.map((hour) => (
            <div key={hour} style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)" }}>
              <div style={{
                padding: "4px 6px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500,
                borderRight: "1px solid var(--border)", textAlign: "right",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {`${hour}:00`}
              </div>
              {weekDates.map((date, di) => {
                const isToday = isSameDay(date, new Date());
                const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
                const dayEnd = addDays(dayStart, 1);
                const devs = filterDevice ? DEVICES.filter((d) => d.id === filterDevice) : DEVICES;
                const slotBookings = devs.flatMap((dev) =>
                  bookings.filter((b) => {
                    if (b.deviceId !== dev.id) return false;
                    const s = new Date(b.start);
                    return s.getHours() === hour && s >= dayStart && s < dayEnd;
                  }).map((b) => ({ ...b, deviceName: dev.name }))
                );

                return (
                  <div key={di} className="cal-slot"
                    style={{
                      borderRight: di < 6 ? "1px solid var(--border-light)" : "none",
                      background: isToday ? "rgba(2,132,199,.02)" : "transparent",
                    }}
                    onClick={() => onSlotClick(filterDevice || null)}>
                    {slotBookings.map((b) => {
                      const rc = ROLES[b.role]?.color || "#94A3B8";
                      const isOwn = b.userName === currentUser.name;
                      return (
                        <div key={b.id}
                          onClick={(e) => { e.stopPropagation(); onBookingClick(b); }}
                          style={{
                            padding: "3px 6px", borderRadius: 4, marginBottom: 2,
                            background: rc + "12", borderLeft: `3px solid ${rc}`,
                            fontSize: 10.5, cursor: "pointer", lineHeight: 1.3,
                            opacity: isOwn ? 1 : .8,
                          }}>
                          <div style={{ fontWeight: 600, color: rc }}>{b.deviceName || `Gerät`}</div>
                          <div style={{ color: "var(--text-secondary)" }}>
                            {formatTime(b.start)}–{formatTime(b.end)} · {b.userName?.split(" ")[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
        {Object.entries(ROLES).map(([k, r]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-secondary)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} />
            {r.label}
          </div>
        ))}
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
          Klicken Sie auf einen Slot zum Buchen oder auf eine Buchung zum Bearbeiten
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DEVICES GRID
// ═══════════════════════════════════════════════════════════════════
function DevicesGrid({ bookings, onBook, onDocs }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, animation: "fadeIn .25s" }}>
      {DEVICES.map((d) => {
        const dBookings = bookings.filter((b) => b.deviceId === d.id);
        const now = new Date();
        const occupied = dBookings.some((b) => new Date(b.start) <= now && new Date(b.end) >= now);
        const next = dBookings.filter((b) => new Date(b.start) > now).sort((a, b) => new Date(a.start) - new Date(b.start))[0];

        return (
          <div key={d.id} className="card" style={{ overflow: "hidden" }}>
            <div style={{
              padding: "18px 18px 14px", borderBottom: "1px solid var(--border-light)",
              background: occupied ? "rgba(217,119,6,.03)" : "rgba(5,150,105,.03)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>
                    Gerät {d.num}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{d.name}</div>
                </div>
                <span className="badge" style={{
                  background: occupied ? "var(--warning-bg)" : "var(--success-bg)",
                  color: occupied ? "var(--warning)" : "var(--success)",
                }}>
                  {occupied ? "Belegt" : "Frei"}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                {d.type} · {d.location}
              </div>
            </div>

            <div style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                {dBookings.length} Buchung{dBookings.length !== 1 ? "en" : ""} gesamt
              </div>

              {next && (
                <div style={{
                  padding: "8px 10px", borderRadius: 8, background: "var(--bg-hover)",
                  fontSize: 12, marginBottom: 12,
                }}>
                  <span style={{ color: "var(--text-muted)" }}>Nächste: </span>
                  <strong>{formatDateTime(next.start)}</strong>
                  <div style={{ color: "var(--text-secondary)", marginTop: 2 }}>
                    {next.purpose} — {next.userName}
                  </div>
                </div>
              )}

              <div style={{
                padding: "6px 10px", borderRadius: 6, background: "var(--bg-active)",
                fontSize: 11.5, display: "flex", justifyContent: "space-between", marginBottom: 12,
              }}>
                <span style={{ color: "var(--text-secondary)" }}>Firmware</span>
                <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>v1.5.2</span>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => onBook(d.id)}>
                  {icons.calendar({ size: 13 })} Buchen
                </button>
                <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => onDocs(d.id)}>
                  {icons.doc({ size: 13 })} Dokumente
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════════
function Documents({ currentUser, selectedDevice, setSelectedDevice, notify }) {
  const [tab, setTab] = useState("manuals");
  const role = ROLES[currentUser.role];
  const device = DEVICES.find((d) => d.id === selectedDevice);

  const tabs = [
    { key: "manuals",       label: "Bedienungsanleitungen", icon: "📘" },
    { key: "qualification", label: "IQ/OQ-Qualifikation",  icon: "📋" },
    { key: "software",      label: "Firmware & Software",   icon: "💾" },
  ];

  const hasAccess = (k) => role.docAccess.includes(k);

  return (
    <div style={{ animation: "fadeIn .25s" }}>
      {/* Device selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {DEVICES.map((d) => (
          <button key={d.id} className={`btn ${selectedDevice === d.id ? "btn-primary" : "btn-outline"} btn-sm`}
            onClick={() => setSelectedDevice(d.id)}>
            Gerät {d.num}
          </button>
        ))}
      </div>

      {!selectedDevice ? (
        <div className="card" style={{ padding: "50px 20px", textAlign: "center" }}>
          {icons.doc({ size: 32, style: { color: "var(--text-muted)", opacity: .4 } })}
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 10 }}>
            Bitte wählen Sie ein Gerät, um Dokumente anzuzeigen.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="card" style={{ padding: 4, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {tabs.map((t) => {
                const ok = hasAccess(t.key);
                return (
                  <button key={t.key}
                    onClick={() => ok ? setTab(t.key) : notify("Zugriff verweigert für " + role.label, "error")}
                    className="btn" style={{
                      flex: 1, justifyContent: "center", borderRadius: 8, fontSize: 12.5,
                      background: tab === t.key && ok ? "var(--accent)" : "transparent",
                      color: !ok ? "var(--text-muted)" : tab === t.key ? "#fff" : "var(--text-secondary)",
                      cursor: ok ? "pointer" : "not-allowed", opacity: ok ? 1 : .5,
                    }}>
                    {t.icon} {t.label} {!ok && "🔒"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doc List */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>
                {device?.name} — {tabs.find((t) => t.key === tab)?.label}
              </h3>
              {role.canEditDocs && (
                <button className="btn btn-outline btn-sm">
                  {icons.plus({ size: 12 })} Hochladen
                </button>
              )}
            </div>

            {!hasAccess(tab) ? (
              <div style={{ textAlign: "center", padding: "36px 0" }}>
                {icons.shield({ size: 28, style: { color: "var(--danger)", opacity: .4 } })}
                <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 8 }}>
                  Zugriff verweigert für Rolle „{role.label}"
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {DOCUMENTS[tab]?.map((doc, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    borderRadius: 8, background: "var(--bg-hover)",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 8, display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 10.5,
                      fontWeight: 700, textTransform: "uppercase",
                      background: doc.ext === "pdf" ? "var(--danger-bg)" : "var(--info-bg)",
                      color: doc.ext === "pdf" ? "var(--danger)" : "var(--info)",
                    }}>
                      {doc.ext}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {doc.version} · {doc.size} · {doc.date}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => notify(`Download: ${doc.name} ${doc.version}`, "success")}>
                      {icons.download({ size: 14 })}
                    </button>
                    {role.canEditDocs && (
                      <button className="btn btn-ghost btn-sm" onClick={() => notify(`Bearbeite: ${doc.name}`, "info")}>
                        {icons.edit({ size: 14 })}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// USERS VIEW
// ═══════════════════════════════════════════════════════════════════
function Users({ bookings, onlineUsers, logs }) {
  // Build unique users from bookings + online
  const allUsers = useMemo(() => {
    const map = new Map();
    bookings.forEach((b) => {
      if (b.userName && !map.has(b.userName)) {
        map.set(b.userName, { name: b.userName, role: b.role, bookings: 0 });
      }
      if (map.has(b.userName)) map.get(b.userName).bookings++;
    });
    onlineUsers.forEach((u) => {
      if (!map.has(u.name)) map.set(u.name, { name: u.name, role: u.role, bookings: 0 });
    });
    return [...map.values()].sort((a, b) => b.bookings - a.bookings);
  }, [bookings, onlineUsers]);

  const onlineNames = new Set(onlineUsers.map((u) => u.name));

  return (
    <div style={{ animation: "fadeIn .25s" }}>
      <div className="card" style={{ overflow: "hidden", marginBottom: 14 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Benutzer</th><th>Rolle</th><th>Buchungen</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: 30 }}>
                Noch keine Benutzeraktivitäten
              </td></tr>
            ) : allUsers.map((u) => {
              const r = ROLES[u.role];
              return (
                <tr key={u.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, background: r?.color || "#94A3B8",
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, position: "relative",
                      }}>
                        {u.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        {onlineNames.has(u.name) && <div className="online-dot" style={{ position: "absolute", bottom: -1, right: -1 }} />}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: r?.bg, color: r?.color }}>{r?.label || u.role}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.bookings}</td>
                  <td>
                    <span className="badge" style={{
                      background: onlineNames.has(u.name) ? "var(--success-bg)" : "var(--bg-active)",
                      color: onlineNames.has(u.name) ? "var(--success)" : "var(--text-muted)",
                    }}>
                      {onlineNames.has(u.name) ? "Online" : "Offline"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Permissions Matrix */}
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Berechtigungsmatrix</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Berechtigung</th>
              {Object.values(ROLES).map((r) => (
                <th key={r.label} style={{ textAlign: "center" }}>
                  <span className="badge" style={{ background: r.bg, color: r.color }}>{r.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Kurzbuchung (≤1 Tag)", true, true, true],
              ["Langzeitbuchung (>1 Woche)", false, true, true],
              ["Prioritätsbuchung", false, true, false],
              ["Manuals einsehen", true, true, true],
              ["IQ/OQ einsehen", false, true, true],
              ["Dokumente bearbeiten", false, true, false],
              ["Firmware aktualisieren", false, true, false],
              ["Testprotokolle hochladen", false, false, true],
            ].map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{row[0]}</td>
                {[row[1], row[2], row[3]].map((v, j) => (
                  <td key={j} style={{ textAlign: "center" }}>
                    {v ? icons.check({ size: 15, style: { color: "var(--success)" } }) : icons.close({ size: 13, style: { color: "var(--border)" } })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BOOKING MODAL
// ═══════════════════════════════════════════════════════════════════
function BookingModal({ currentUser, bookings, editing, preDevice, onClose, onSave, onDelete, notify }) {
  const [deviceId, setDeviceId] = useState(editing?.deviceId || preDevice || DEVICES[0].id);
  const [purpose, setPurpose] = useState(editing?.purpose || "");
  const [startDate, setStartDate] = useState(
    editing ? new Date(editing.start).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState(editing ? formatTime(editing.start) : "09:00");
  const [endDate, setEndDate] = useState(
    editing ? new Date(editing.end).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [endTime, setEndTime] = useState(editing ? formatTime(editing.end) : "10:00");
  const [notes, setNotes] = useState(editing?.notes || "");
  const [priority, setPriority] = useState(editing?.priority || false);

  const role = ROLES[currentUser.role];
  const purposes = BOOKING_PURPOSES[currentUser.role] || BOOKING_PURPOSES.sales;

  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  const valid = !isNaN(start) && !isNaN(end) && end > start;

  const conflict = useMemo(() => {
    if (!valid) return null;
    return checkConflict(bookings, deviceId, start, end, editing?.id);
  }, [bookings, deviceId, startDate, startTime, endDate, endTime, editing, valid]);

  const alternatives = useMemo(() => {
    if (!conflict || !valid) return [];
    return findAlternativeDevices(bookings, DEVICES, start, end, deviceId);
  }, [conflict, bookings, start, end, deviceId, valid]);

  const handleSave = () => {
    if (!purpose) { notify("Bitte Buchungszweck wählen.", "error"); return; }
    if (!valid) { notify("Ungültiger Zeitraum.", "error"); return; }

    const durationDays = (end - start) / 86400000;
    if (durationDays > role.maxBookingDaysNoApproval) {
      notify(`${role.label} darf max. ${role.maxBookingDaysNoApproval} Tag(e) ohne Freigabe buchen.`, "error");
      return;
    }
    if (conflict && !priority) {
      notify("Konflikt! Bitte anderen Zeitraum oder Gerät wählen.", "error");
      return;
    }

    const durationH = (end - start) / 3600000;
    onSave({
      deviceId, purpose, notes,
      start, end,
      type: durationH <= 4 ? "short" : durationDays <= 5 ? "day" : "long",
      userName: currentUser.name, role: currentUser.role,
      priority: priority && role.canPriorityBook,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: "18px 22px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>
            {editing ? "Buchung bearbeiten" : "Neue Buchung"}
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>{icons.close({ size: 16 })}</button>
        </div>

        {/* Form */}
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Device */}
          <Field label="Gerät">
            <select className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
              {DEVICES.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.location})</option>)}
            </select>
          </Field>

          {/* Linked Devices Info */}
          {LINKED_BOOKINGS[deviceId] && (
            <div style={{
              padding: "10px 14px", borderRadius: 8, background: "var(--info-bg)",
              border: "1px solid #BAE6FD", display: "flex", gap: 8, alignItems: "flex-start",
            }}>
              {icons.info({ size: 16, style: { color: "var(--info)", flexShrink: 0, marginTop: 1 } })}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0369A1" }}>Automatische Mitbuchung</div>
                <div style={{ fontSize: 12, color: "#0C4A6E", marginTop: 2 }}>
                  Folgende Geräte werden automatisch mitgebucht:{" "}
                  <strong>{LINKED_BOOKINGS[deviceId].map((id) => DEVICES.find((d) => d.id === id)?.name).filter(Boolean).join(", ")}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Purpose */}
          <Field label="Buchungszweck">
            <select className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              <option value="">— Bitte auswählen —</option>
              {purposes.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          {/* Date/Time Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Startdatum">
              <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="Startzeit">
              <select className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Enddatum">
              <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
            <Field label="Endzeit">
              <select className="input" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          {/* Priority */}
          {role.canPriorityBook && (
            <label style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, background: "var(--warning-bg)", cursor: "pointer",
            }}>
              <input type="checkbox" checked={priority} onChange={(e) => setPriority(e.target.checked)}
                style={{ accentColor: "var(--warning)" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>Prioritätsbuchung (Service)</div>
                <div style={{ fontSize: 11.5, color: "#A16207" }}>Überschreibt bestehende Buchungen</div>
              </div>
            </label>
          )}

          {/* Conflict */}
          {conflict && (
            <div style={{
              padding: "12px 14px", borderRadius: 8, background: "var(--danger-bg)",
              border: "1px solid #FECACA",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)", display: "flex", alignItems: "center", gap: 6 }}>
                {icons.alert({ size: 15 })} Konflikt erkannt
              </div>
              <div style={{ fontSize: 12, color: "#991B1B", marginTop: 4 }}>
                Bereits gebucht von {conflict.userName} ({formatDateTime(conflict.start)} – {formatDateTime(conflict.end)})
              </div>
              {alternatives.length > 0 && (
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
                  Verfügbare Alternativen: {alternatives.map((d) => (
                    <button key={d.id} className="btn btn-sm" style={{
                      background: "#fff", margin: "2px 3px", fontSize: 11, padding: "2px 8px",
                    }} onClick={() => setDeviceId(d.id)}>
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <Field label="Notizen (optional)">
            <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Zusätzliche Informationen..." style={{ resize: "vertical" }} />
          </Field>

          {/* Role info */}
          <div style={{
            padding: "8px 12px", borderRadius: 8, background: "var(--bg-hover)",
            fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: role.color }} />
            Gebucht als <strong style={{ color: role.color }}>{role.label}</strong> · {currentUser.name}
            {currentUser.role === "sales" && " · Max. 1 Tag"}
            {currentUser.role === "application" && " · Max. 2 Wochen"}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 22px", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between",
        }}>
          <div>
            {editing && (
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(editing.id)}>
                {icons.trash({ size: 13 })} Stornieren
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-outline" onClick={onClose}>Abbrechen</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {icons.check({ size: 14 })} {editing ? "Aktualisieren" : "Buchen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field helper ────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
