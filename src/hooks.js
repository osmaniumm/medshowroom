// ═══════════════════════════════════════════════════════════════════
// FIREBASE HOOKS — Echtzeit-Datenzugriff für alle Nutzer
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, setDoc,
  onSnapshot, query, orderBy, Timestamp, getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase.js";

// ─── Bookings Hook (Echtzeit-Synchronisation) ───────────────────────
export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("start", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        start: d.data().start?.toDate?.() || new Date(d.data().start),
        end:   d.data().end?.toDate?.()   || new Date(d.data().end),
      }));
      setBookings(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore bookings error:", err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const addBooking = useCallback(async (booking) => {
    const docRef = await addDoc(collection(db, "bookings"), {
      ...booking,
      start: Timestamp.fromDate(new Date(booking.start)),
      end:   Timestamp.fromDate(new Date(booking.end)),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }, []);

  const updateBooking = useCallback(async (id, updates) => {
    const r = doc(db, "bookings", id);
    const data = { ...updates, updatedAt: Timestamp.now() };
    if (data.start) data.start = Timestamp.fromDate(new Date(data.start));
    if (data.end)   data.end   = Timestamp.fromDate(new Date(data.end));
    await updateDoc(r, data);
  }, []);

  const removeBooking = useCallback(async (id) => {
    await deleteDoc(doc(db, "bookings", id));
  }, []);

  return { bookings, loading, addBooking, updateBooking, removeBooking };
}

// ─── Activity Log Hook (Audit Trail) ────────────────────────────────
export function useActivityLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "activity_log"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.slice(0, 100).map((d) => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate?.() || new Date(),
      })));
    });
    return unsub;
  }, []);

  const logActivity = useCallback(async (entry) => {
    await addDoc(collection(db, "activity_log"), {
      ...entry,
      timestamp: Timestamp.now(),
    });
  }, []);

  return { logs, logActivity };
}

// ─── Online Users Hook ──────────────────────────────────────────────
export function useOnlineUsers(currentUser) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const registerPresence = async () => {
      try {
        const r = doc(db, "online_users", currentUser.id);
        await setDoc(r, {
          name: currentUser.name,
          role: currentUser.role,
          lastSeen: Timestamp.now(),
        });
      } catch (e) { console.error("Presence error:", e); }
    };
    registerPresence();
    const interval = setInterval(registerPresence, 60000);
    const unsub = onSnapshot(collection(db, "online_users"), (snapshot) => {
      const now = Date.now();
      const users = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data(), lastSeen: d.data().lastSeen?.toDate?.() }))
        .filter((u) => u.lastSeen && (now - u.lastSeen.getTime()) < 120000);
      setOnlineUsers(users);
    });
    return () => { clearInterval(interval); unsub(); };
  }, [currentUser]);

  return onlineUsers;
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN HOOKS
// ═══════════════════════════════════════════════════════════════════

// ─── Devices (aus Firebase statt constants.js) ──────────────────────
export function useDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "devices"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.num || 0) - (b.num || 0));
      setDevices(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const addDevice = useCallback(async (device) => {
    const docRef = await addDoc(collection(db, "devices"), {
      ...device,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }, []);

  const updateDevice = useCallback(async (id, updates) => {
    await updateDoc(doc(db, "devices", id), { ...updates, updatedAt: Timestamp.now() });
  }, []);

  const removeDevice = useCallback(async (id) => {
    await deleteDoc(doc(db, "devices", id));
  }, []);

  return { devices, loading, addDevice, updateDevice, removeDevice };
}

// ─── Documents (Metadaten in Firestore, Dateien in Storage) ─────────
export function useDocuments() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "documents"), (snapshot) => {
      setDocuments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const uploadDocument = useCallback(async (file, metadata) => {
    // Upload file to Firebase Storage
    const path = `documents/${metadata.deviceId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    const docRef = await addDoc(collection(db, "documents"), {
      ...metadata,
      fileName: file.name,
      fileSize: file.size,
      storagePath: path,
      downloadURL,
      uploadedAt: Timestamp.now(),
    });
    return docRef.id;
  }, []);

  const removeDocument = useCallback(async (docData) => {
    // Delete from Storage
    if (docData.storagePath) {
      try {
        await deleteObject(ref(storage, docData.storagePath));
      } catch (e) { console.warn("Storage delete error:", e); }
    }
    // Delete from Firestore
    await deleteDoc(doc(db, "documents", docData.id));
  }, []);

  const updateDocument = useCallback(async (id, updates) => {
    await updateDoc(doc(db, "documents", id), { ...updates, updatedAt: Timestamp.now() });
  }, []);

  return { documents, uploadDocument, removeDocument, updateDocument };
}

// ─── Managed Users (Admin kann Nutzer sperren) ─────────────────────
export function useManagedUsers() {
  const [managedUsers, setManagedUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "managed_users"), (snapshot) => {
      setManagedUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const blockUser = useCallback(async (userName) => {
    await setDoc(doc(db, "managed_users", userName.replace(/[^a-zA-Z0-9]/g, "_")), {
      name: userName,
      blocked: true,
      blockedAt: Timestamp.now(),
    });
  }, []);

  const unblockUser = useCallback(async (userName) => {
    const id = userName.replace(/[^a-zA-Z0-9]/g, "_");
    await deleteDoc(doc(db, "managed_users", id));
  }, []);

  return { managedUsers, blockUser, unblockUser };
}

// ─── Custom Roles (Admin kann Rollen verwalten) ─────────────────────
export function useCustomRoles(defaultRoles) {
  const [customRoles, setCustomRoles] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "roles"), (snapshot) => {
      if (snapshot.exists()) {
        setCustomRoles(snapshot.data().roles);
      } else {
        setCustomRoles(null);
      }
    });
    return unsub;
  }, []);

  const saveRoles = useCallback(async (roles) => {
    await setDoc(doc(db, "settings", "roles"), { roles, updatedAt: Timestamp.now() });
  }, []);

  return { roles: customRoles || defaultRoles, customRoles, saveRoles };
}

// ─── Seed initial devices (einmalig beim ersten Admin-Login) ────────
export async function seedDevicesIfEmpty(defaultDevices) {
  const snapshot = await getDocs(collection(db, "devices"));
  if (snapshot.empty) {
    for (const device of defaultDevices) {
      await addDoc(collection(db, "devices"), {
        ...device,
        createdAt: Timestamp.now(),
      });
    }
    return true;
  }
  return false;
}
