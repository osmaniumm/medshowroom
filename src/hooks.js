// ═══════════════════════════════════════════════════════════════════
// FIREBASE HOOKS — Echtzeit-Datenzugriff für alle Nutzer
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, Timestamp, where,
} from "firebase/firestore";
import { db } from "./firebase.js";

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
    const ref = doc(db, "bookings", id);
    const data = { ...updates, updatedAt: Timestamp.now() };
    if (data.start) data.start = Timestamp.fromDate(new Date(data.start));
    if (data.end)   data.end   = Timestamp.fromDate(new Date(data.end));
    await updateDoc(ref, data);
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

// ─── Online Users Hook (wer ist gerade online) ─────────────────────
export function useOnlineUsers(currentUser) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // Register presence
    const registerPresence = async () => {
      try {
        const ref = doc(db, "online_users", currentUser.id);
        const { setDoc, serverTimestamp } = await import("firebase/firestore");
        await setDoc(ref, {
          name: currentUser.name,
          role: currentUser.role,
          lastSeen: serverTimestamp(),
        });
      } catch (e) {
        console.error("Presence error:", e);
      }
    };
    registerPresence();
    const interval = setInterval(registerPresence, 60000); // Heartbeat jede Minute

    // Listen to online users
    const unsub = onSnapshot(collection(db, "online_users"), (snapshot) => {
      const now = Date.now();
      const users = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data(), lastSeen: d.data().lastSeen?.toDate?.() }))
        .filter((u) => u.lastSeen && (now - u.lastSeen.getTime()) < 120000); // 2 min threshold
      setOnlineUsers(users);
    });

    return () => { clearInterval(interval); unsub(); };
  }, [currentUser]);

  return onlineUsers;
}
