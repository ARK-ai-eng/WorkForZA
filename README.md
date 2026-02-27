# WorkforZA

**Die Arbeitsplattform für Personaldienstleister.**

WorkforZA ist ein B2B-SaaS-Tool für Personaldisponenten — mit Stellensuche, Marktanalyse, KI-Matching, Kandidaten-Pipeline und direktem Firmenkontakt.

## Features

- **Stellensuche** — Über 3,49 Mio. Stellenanzeigen aus 5 Quellen (StepStone, Indeed, LinkedIn, XING, BA) mit Filtern für Staplerschein, §34a/FSK, Führerscheinklassen, Schichtbereitschaft, Quelle (HR intern / Recruiter / PDL) und Repost-Tracking
- **Marktanalyse** — Rankings der meistgesuchten Berufe, Branchen und Firmen nach Stadt und Zeitraum
- **KI-Matching** — Kandidatenprofil hochladen → KI findet passende Stellen → Profil direkt an Firma senden
- **Kandidaten-Pipeline** — Statusverwaltung (Aktiv, In Vermittlung, Platziert, Pausiert) mit Verfügbarkeitsdatum
- **CSV-Export** — Gefilterte Suchergebnisse und Listen als CSV exportieren
- **Tages-Briefing** — Beim Login sofort sehen: neue Stellen, kritische Repost-Raten, ablaufende Kandidaten

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4 + shadcn/ui
- **Routing:** Wouter
- **Charts:** Recharts
- **Icons:** Lucide React

## Lokale Entwicklung

```bash
pnpm install
pnpm dev
```

## Design

"Focused Slate" — Slate-Sidebar, Teal-Akzent (#0D9488), DM Sans — optimiert für 5–6h Tagesnutzung durch Personaldisponenten.
