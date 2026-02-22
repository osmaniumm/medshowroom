// ═══════════════════════════════════════════════════════════════════
// ADMIN PANEL — Geräte, Dokumente, Rollen & Nutzer verwalten
// ═══════════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { useDevices, useDocuments, useManagedUsers, seedDevicesIfEmpty } from "./hooks.js";
import { DEFAULT_DEVICES, ROLES as DEFAULT_ROLES, DEVICE_CATEGORIES } from "./constants.js";

// Admin-Passwort (ändern Sie dieses Passwort!)
const ADMIN_PASSWORD = "admin2025";

// ─── Icons (wiederverwendet) ─────────────────────────────────────────
const I = ({ d, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);
const PlusIcon = (p) => <I d="M12 5v14M5 12h14" {...p} />;
const TrashIcon = (p) => <I d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" {...p} />;
const EditIcon = (p) => <I d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...p} />;
const CheckIcon = (p) => <I d="M20 6L9 17l-5-5" {...p} />;
const CloseIcon = (p) => <I d="M18 6L6 18M6 6l12 12" {...p} />;
const UploadIcon = (p) => <I d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" {...p} />;
const ShieldIcon = (p) => <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p} />;
const UserXIcon = (p) => <I d={<><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="18" y1="8" x2="23" y2="13" /><line x1="23" y1="8" x2="18" y2="13" /></>} {...p} />;
const SettingsIcon = (p) => <I d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></>} {...p} />;

// ═══════════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════════
export function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Falsches Passwort");
      setPw("");
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "0 auto", paddingTop: 40 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: "var(--accent)",
            display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
          }}>
            <ShieldIcon size={22} style={{ color: "#fff" }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Admin-Zugang</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Passwort eingeben um fortzufahren
          </p>
        </div>
        <input
          type="password" className="input" value={pw}
          onChange={(e) => { setPw(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Admin-Passwort"
          autoFocus
          style={{ marginBottom: 12 }}
        />
        {error && (
          <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 12 }}>{error}</div>
        )}
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleLogin}>
          Anmelden
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN PANEL (Hauptkomponente)
// ═══════════════════════════════════════════════════════════════════
export default function AdminPanel({ notify, bookings, onlineUsers, logs }) {
  const [tab, setTab] = useState("devices");
  const { devices, addDevice, updateDevice, removeDevice } = useDevices();
  const { documents, uploadDocument, removeDocument, updateDocument } = useDocuments();
  const { managedUsers, blockUser, unblockUser } = useManagedUsers();

  const tabs = [
    { key: "devices",  label: "Geräte",    icon: <SettingsIcon size={15} /> },
    { key: "docs",     label: "Dokumente", icon: <UploadIcon size={15} /> },
    { key: "users",    label: "Nutzer",    icon: <UserXIcon size={15} /> },
  ];

  return (
    <div style={{ animation: "fadeIn .25s" }}>
      {/* Tab Bar */}
      <div className="card" style={{ padding: 4, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map((t) => (
            <button key={t.key} className="btn" style={{
              flex: 1, justifyContent: "center", borderRadius: 8, fontSize: 13,
              background: tab === t.key ? "var(--accent)" : "transparent",
              color: tab === t.key ? "#fff" : "var(--text-secondary)",
            }} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "devices" && (
        <DeviceManager devices={devices} addDevice={addDevice}
          updateDevice={updateDevice} removeDevice={removeDevice} notify={notify} />
      )}
      {tab === "docs" && (
        <DocumentManager devices={devices} documents={documents}
          uploadDocument={uploadDocument} removeDocument={removeDocument} notify={notify} />
      )}
      {tab === "users" && (
        <UserManager bookings={bookings} onlineUsers={onlineUsers} logs={logs}
          managedUsers={managedUsers} blockUser={blockUser} unblockUser={unblockUser} notify={notify} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DEVICE MANAGER
// ═══════════════════════════════════════════════════════════════════
function DeviceManager({ devices, addDevice, updateDevice, removeDevice, notify }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", type: "", location: "Showroom", category: "dissolution", linkedDevices: [] });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", type: "", location: "Showroom", category: "dissolution", linkedDevices: [] });
    setShowForm(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.name, type: d.type, location: d.location, category: d.category || "dissolution", linkedDevices: d.linkedDevices || [] });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { notify("Bitte Gerätenamen eingeben", "error"); return; }
    try {
      if (editing) {
        await updateDevice(editing.id, { ...form, num: editing.num });
        notify(`${form.name} aktualisiert`, "success");
      } else {
        const num = devices.length > 0 ? Math.max(...devices.map((d) => d.num || 0)) + 1 : 1;
        await addDevice({ ...form, num });
        notify(`${form.name} hinzugefügt`, "success");
      }
      setShowForm(false);
    } catch (e) { notify("Fehler: " + e.message, "error"); }
  };

  const handleDelete = async (d) => {
    if (!confirm(`Gerät "${d.name}" wirklich löschen?`)) return;
    try {
      await removeDevice(d.id);
      notify(`${d.name} gelöscht`, "info");
    } catch (e) { notify("Fehler: " + e.message, "error"); }
  };

  const handleSeed = async () => {
    const seeded = await seedDevicesIfEmpty(DEFAULT_DEVICES);
    if (seeded) notify("Standard-ERWEKA-Geräte wurden geladen", "success");
    else notify("Es existieren bereits Geräte in der Datenbank", "info");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Geräte verwalten ({devices.length})</h3>
        <div style={{ display: "flex", gap: 6 }}>
          {devices.length === 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleSeed}>
              ERWEKA-Standard laden
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <PlusIcon size={13} /> Gerät hinzufügen
          </button>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Keine Geräte vorhanden. Klicken Sie auf "ERWEKA-Standard laden" oder fügen Sie manuell Geräte hinzu.
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Typ</th><th>Standort</th><th>Kategorie</th><th>Verknüpft</th><th style={{ width: 100 }}>Aktionen</th></tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.num}</td>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.type}</td>
                  <td>{d.location}</td>
                  <td>
                    <span className="badge" style={{
                      background: d.category === "dissolution" ? "var(--info-bg)" : "var(--bg-active)",
                      color: d.category === "dissolution" ? "var(--info)" : "#7C3AED",
                    }}>
                      {d.category === "dissolution" ? "Dissolution" : "Physikalisch"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {d.linkedDevices?.length > 0
                      ? d.linkedDevices.map((lid) => devices.find((x) => x.id === lid)?.name || lid).join(", ")
                      : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}><EditIcon size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d)}><TrashIcon size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>{editing ? "Gerät bearbeiten" : "Neues Gerät"}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><CloseIcon size={16} /></button>
            </div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>Gerätename</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. DT 950 / DT 9510" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>Typ</label>
                <input className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="z.B. Dissolution, Härtetester" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>Standort</label>
                <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="z.B. Showroom" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>Kategorie</label>
                <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="dissolution">Dissolution Tester</option>
                  <option value="physical">Physikalische Tester</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>
                  Verknüpfte Geräte (automatisch mitbuchen)
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {devices.filter((d) => d.id !== editing?.id).map((d) => (
                    <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0" }}>
                      <input type="checkbox"
                        checked={form.linkedDevices.includes(d.id)}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            linkedDevices: e.target.checked
                              ? [...form.linkedDevices, d.id]
                              : form.linkedDevices.filter((x) => x !== d.id),
                          });
                        }}
                      />
                      {d.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Abbrechen</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <CheckIcon size={14} /> {editing ? "Speichern" : "Hinzufügen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT MANAGER
// ═══════════════════════════════════════════════════════════════════
function DocumentManager({ devices, documents, uploadDocument, removeDocument, notify }) {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ category: "manuals", version: "", description: "" });

  const filteredDocs = selectedDevice
    ? documents.filter((d) => d.deviceId === selectedDevice)
    : documents;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedDevice) { notify("Bitte zuerst ein Gerät wählen", "error"); return; }

    setUploading(true);
    try {
      await uploadDocument(file, {
        deviceId: selectedDevice,
        category: uploadForm.category,
        version: uploadForm.version || "v1.0",
        description: uploadForm.description || file.name,
      });
      notify(`${file.name} hochgeladen`, "success");
      setUploadForm({ category: "manuals", version: "", description: "" });
    } catch (err) {
      notify("Upload-Fehler: " + err.message, "error");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (d) => {
    if (!confirm(`Dokument "${d.description || d.fileName}" wirklich löschen?`)) return;
    try {
      await removeDocument(d);
      notify("Dokument gelöscht", "info");
    } catch (err) { notify("Fehler: " + err.message, "error"); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Dokumente verwalten ({documents.length})</h3>
      </div>

      {/* Device Filter + Upload */}
      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>Gerät</label>
            <select className="input" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
              <option value="">Alle Geräte</option>
              {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>Kategorie</label>
            <select className="input" value={uploadForm.category} onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}>
              <option value="manuals">Bedienungsanleitung</option>
              <option value="qualification">IQ/OQ-Qualifikation</option>
              <option value="software">Firmware & Software</option>
            </select>
          </div>
          <div style={{ minWidth: 100 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5 }}>Version</label>
            <input className="input" value={uploadForm.version} onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })} placeholder="z.B. v2.3" />
          </div>
          <div>
            <label className="btn btn-primary btn-sm" style={{ cursor: "pointer", opacity: uploading ? .6 : 1 }}>
              <UploadIcon size={14} /> {uploading ? "Lädt..." : "Datei hochladen"}
              <input type="file" accept=".pdf,.zip,.doc,.docx,.xlsx" style={{ display: "none" }} onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      {/* Document List */}
      {filteredDocs.length === 0 ? (
        <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {selectedDevice ? "Keine Dokumente für dieses Gerät." : "Noch keine Dokumente hochgeladen."}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr><th>Dateiname</th><th>Gerät</th><th>Kategorie</th><th>Version</th><th>Größe</th><th>Datum</th><th style={{ width: 100 }}>Aktionen</th></tr>
            </thead>
            <tbody>
              {filteredDocs.map((d) => {
                const device = devices.find((x) => x.id === d.deviceId);
                const catLabels = { manuals: "Manual", qualification: "IQ/OQ", software: "Software" };
                return (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                          background: d.fileName?.endsWith(".pdf") ? "var(--danger-bg)" : "var(--info-bg)",
                          color: d.fileName?.endsWith(".pdf") ? "var(--danger)" : "var(--info)",
                        }}>
                          {d.fileName?.split(".").pop() || "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{d.description || d.fileName}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{device?.name || "—"}</td>
                    <td><span className="badge" style={{ background: "var(--bg-active)" }}>{catLabels[d.category] || d.category}</span></td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{d.version || "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatSize(d.fileSize)}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {d.uploadedAt?.toDate ? new Date(d.uploadedAt.toDate()).toLocaleDateString("de-DE") : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {d.downloadURL && (
                          <a href={d.downloadURL} target="_blank" rel="noopener" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>
                            ↓
                          </a>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d)}><TrashIcon size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// USER MANAGER
// ═══════════════════════════════════════════════════════════════════
function UserManager({ bookings, onlineUsers, logs, managedUsers, blockUser, unblockUser, notify }) {
  // Collect unique users from bookings + online
  const allUsers = new Map();
  bookings.forEach((b) => {
    if (b.userName && !allUsers.has(b.userName)) {
      allUsers.set(b.userName, { name: b.userName, role: b.role, bookings: 0 });
    }
    if (allUsers.has(b.userName)) allUsers.get(b.userName).bookings++;
  });
  onlineUsers.forEach((u) => {
    if (!allUsers.has(u.name)) allUsers.set(u.name, { name: u.name, role: u.role, bookings: 0 });
  });
  const users = [...allUsers.values()].sort((a, b) => b.bookings - a.bookings);
  const blockedNames = new Set(managedUsers.filter((u) => u.blocked).map((u) => u.name));
  const onlineNames = new Set(onlineUsers.map((u) => u.name));

  const handleToggleBlock = async (userName, isBlocked) => {
    try {
      if (isBlocked) {
        await unblockUser(userName);
        notify(`${userName} entsperrt`, "success");
      } else {
        await blockUser(userName);
        notify(`${userName} gesperrt`, "info");
      }
    } catch (e) { notify("Fehler: " + e.message, "error"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Nutzer verwalten ({users.length})</h3>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {blockedNames.size} gesperrt · {onlineNames.size} online
        </div>
      </div>

      {users.length === 0 ? (
        <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Noch keine Nutzeraktivitäten. Nutzer erscheinen hier sobald sie die App verwenden.
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr><th>Nutzer</th><th>Rolle</th><th>Buchungen</th><th>Status</th><th style={{ width: 120 }}>Aktionen</th></tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isBlocked = blockedNames.has(u.name);
                const isOnline = onlineNames.has(u.name);
                const roleData = DEFAULT_ROLES[u.role];
                return (
                  <tr key={u.name} style={{ opacity: isBlocked ? .5 : 1 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 7, background: roleData?.color || "#94A3B8",
                          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, position: "relative",
                        }}>
                          {u.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          {isOnline && <div className="online-dot" style={{ position: "absolute", bottom: -1, right: -1 }} />}
                        </div>
                        <span style={{ fontWeight: 600, textDecoration: isBlocked ? "line-through" : "none" }}>{u.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: roleData?.bg, color: roleData?.color }}>
                        {roleData?.label || u.role}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{u.bookings}</td>
                    <td>
                      {isBlocked ? (
                        <span className="badge" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>Gesperrt</span>
                      ) : isOnline ? (
                        <span className="badge" style={{ background: "var(--success-bg)", color: "var(--success)" }}>Online</span>
                      ) : (
                        <span className="badge" style={{ background: "var(--bg-active)", color: "var(--text-muted)" }}>Offline</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`btn ${isBlocked ? "btn-outline" : "btn-danger"} btn-sm`}
                        onClick={() => handleToggleBlock(u.name, isBlocked)}
                      >
                        {isBlocked ? "Entsperren" : "Sperren"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
