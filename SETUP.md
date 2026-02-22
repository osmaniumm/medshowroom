# MedShowroom — Setup-Anleitung

## Überblick

MedShowroom ist eine Web-Anwendung für das Management und die Buchung von Medizinprodukten in Ihrem Showroom. Die App läuft in der Cloud und ist über einen Link für alle 100+ Mitarbeiter erreichbar — ohne Passwort, nur mit Name und Abteilung.

**Technik-Stack:**
- **Frontend:** React + Vite (schnell, modern)
- **Datenbank:** Firebase Firestore (Echtzeit-Sync, kostenlos bis 50.000 Lese-/Schreibvorgänge pro Tag)
- **Hosting:** Vercel (kostenlos, automatisches Deployment)

---

## Schritt 1: Firebase einrichten (10 Minuten)

### 1.1 Firebase-Projekt erstellen

1. Gehen Sie zu **https://console.firebase.google.com**
2. Klicken Sie auf **„Projekt hinzufügen"**
3. Projektname: `medshowroom` (oder Ihr Wunschname)
4. Google Analytics: Können Sie deaktivieren (nicht benötigt)
5. Klicken Sie **„Projekt erstellen"**

### 1.2 Firestore-Datenbank aktivieren

1. Im Firebase-Dashboard: Linkes Menü → **„Firestore Database"**
2. Klicken Sie **„Datenbank erstellen"**
3. Wählen Sie **„Im Produktionsmodus starten"**
4. Standort: **europe-west1** (Frankfurt) oder **europe-west3**
5. Klicken Sie **„Aktivieren"**

### 1.3 Sicherheitsregeln setzen

Gehen Sie zu **Firestore → Regeln** und ersetzen Sie den Inhalt mit:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Buchungen: Alle dürfen lesen und schreiben
    match /bookings/{bookingId} {
      allow read, write: if true;
    }
    // Aktivitätslog: Alle dürfen lesen und schreiben
    match /activity_log/{logId} {
      allow read, write: if true;
    }
    // Online-Status: Alle dürfen lesen und schreiben
    match /online_users/{userId} {
      allow read, write: if true;
    }
  }
}
```

> **Hinweis:** Diese Regeln erlauben offenen Zugriff, was für ein Intranet-Tool ohne Login passend ist. Für höhere Sicherheit können Sie später Firebase Authentication hinzufügen.

Klicken Sie **„Veröffentlichen"**.

### 1.4 Web-App registrieren

1. Gehen Sie zur **Projektübersicht** (Startseite)
2. Klicken Sie auf das **Web-Symbol** (`</>`)
3. App-Name: `MedShowroom`
4. Firebase Hosting: **Nicht** aktivieren (wir nutzen Vercel)
5. Klicken Sie **„App registrieren"**
6. **Kopieren Sie die Konfigurationsdaten** — Sie sehen etwas wie:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "medshowroom-xxxxx.firebaseapp.com",
  projectId: "medshowroom-xxxxx",
  storageBucket: "medshowroom-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

### 1.5 Konfiguration in der App eintragen

Öffnen Sie die Datei `src/firebase.js` und ersetzen Sie die Platzhalter:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSyB...",           // ← Ihre Werte hier
  authDomain:        "medshowroom-xxxxx.firebaseapp.com",
  projectId:         "medshowroom-xxxxx",
  storageBucket:     "medshowroom-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef...",
};
```

---

## Schritt 2: Projekt lokal testen (5 Minuten)

### Voraussetzung: Node.js installiert
Falls nicht vorhanden: **https://nodejs.org** → LTS-Version herunterladen

### Befehle ausführen:

```bash
# In den Projektordner wechseln
cd medshowroom

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App ist jetzt unter **http://localhost:5173** erreichbar.

**Testen Sie:**
1. Geben Sie Ihren Namen ein
2. Wählen Sie eine Abteilung
3. Erstellen Sie eine Buchung
4. Öffnen Sie einen zweiten Browser-Tab → Sie sehen die Buchung in Echtzeit!

---

## Schritt 3: Auf Vercel deployen (5 Minuten)

### 3.1 Code auf GitHub/GitLab hochladen

```bash
# Git initialisieren (falls noch nicht geschehen)
git init
git add .
git commit -m "MedShowroom v1.0"

# Repository auf GitHub erstellen und pushen
# (Erstellen Sie ein neues Repo auf github.com)
git remote add origin https://github.com/IHR-USERNAME/medshowroom.git
git push -u origin main
```

### 3.2 Vercel verbinden

1. Gehen Sie zu **https://vercel.com** → Kostenlos registrieren
2. Klicken Sie **„New Project"**
3. Verbinden Sie Ihr GitHub-Konto
4. Wählen Sie das `medshowroom`-Repository
5. Framework: **Vite** (wird automatisch erkannt)
6. Klicken Sie **„Deploy"**

### 3.3 Fertig!

Nach 1-2 Minuten erhalten Sie eine URL wie:

```
https://medshowroom.vercel.app
```

**Diese URL teilen Sie mit allen 100 Mitarbeitern.** Jeder kann sie im Browser öffnen, seinen Namen eingeben und sofort loslegen.

### 3.4 Eigene Domain (optional)

In den Vercel-Projekteinstellungen können Sie unter **„Domains"** eine eigene Domain hinzufügen, z.B.:

```
showroom.ihre-firma.de
```

---

## Projektstruktur

```
medshowroom/
├── index.html              # HTML-Einstiegspunkt
├── package.json            # Abhängigkeiten
├── vite.config.js          # Build-Konfiguration
├── SETUP.md                # Diese Anleitung
└── src/
    ├── main.jsx            # React-Einstiegspunkt
    ├── App.jsx             # Hauptanwendung (alle Views)
    ├── firebase.js         # ⚠️ Firebase-Konfiguration (HIER IHRE DATEN EINTRAGEN)
    ├── constants.js        # Geräte, Rollen, Dokumente
    ├── hooks.js            # Firebase-Echtzeit-Hooks
    └── utils.js            # Hilfsfunktionen
```

---

## Anpassungen

### Geräte ändern/hinzufügen

In `src/constants.js` → `DEVICES`-Array bearbeiten:

```javascript
export const DEVICES = [
  { id: "device-1", num: 1, name: "Ihr Gerätenname", type: "Typ", location: "Raum X" },
  // Weitere Geräte hinzufügen...
];
```

### Rollen anpassen

In `src/constants.js` → `ROLES`-Objekt. Dort können Sie Berechtigungen, Farben und Buchungslimits ändern.

### Buchungszwecke ändern

In `src/constants.js` → `BOOKING_PURPOSES` pro Rolle anpassen.

### Dokumente ändern

In `src/constants.js` → `DOCUMENTS`-Objekt. Für echte Datei-Downloads müssten Sie die Dateien auf Firebase Storage hochladen.

---

## Häufige Fragen

**Wie viel kostet das?**
Firebase Free Tier: 50.000 Lesevorgänge + 20.000 Schreibvorgänge pro Tag — das reicht für 100 Nutzer locker. Vercel ist ebenfalls kostenlos für diesen Anwendungsfall.

**Was passiert, wenn 2 Leute gleichzeitig buchen?**
Firebase synchronisiert in Echtzeit. Die Konfliktprüfung läuft beim Erstellen der Buchung. Doppelbuchungen werden erkannt und verhindert.

**Kann jemand Buchungen anderer löschen?**
Aktuell ja — da kein Passwort-System existiert. Über das Aktivitätslog ist aber nachvollziehbar, wer was getan hat. Für mehr Sicherheit kann Firebase Authentication ergänzt werden.

**Funktioniert das auf dem Handy?**
Ja, die App ist responsiv und funktioniert auf Desktop, Tablet und Smartphone.

**Wie sichere ich die Daten?**
Firebase erstellt automatische Backups. Zusätzlich können Sie unter Firebase Console → Firestore → Export manuelle Exports erstellen.

---

## Support

Bei Problemen oder Erweiterungswünschen:
- Firebase-Dokumentation: https://firebase.google.com/docs
- Vercel-Dokumentation: https://vercel.com/docs
