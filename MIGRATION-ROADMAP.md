# BullProsperity Migrationsplan

## Zielarchitektur

- Frontend und Web-APIs: Next.js mit TypeScript auf Vercel.
- Datenbank und Auth-Daten: Supabase, weiterhin nur serverseitig mit Service-Role-Key.
- Mitgliedschaft: Whop OAuth und serverseitige Membership-Prüfung.
- Optionale Datenanalyse: Python/FastAPI nur für rechenintensive Trading- oder Reporting-Jobs.

## Warum nicht alles in Python

Python ersetzt nicht die Browseroberfläche. Ein kompletter Neuaufbau würde Navigation, Design und Whop-Sessions unnötig riskieren. Next.js übernimmt Komponenten, Routing, Fehlerseiten und APIs in einem Projekt und passt zum aktuellen Vercel-Betrieb.

## Sichere Reihenfolge

1. Aktuelle HTML-Version launchen und nur Fehlerkorrekturen zulassen.
2. Gemeinsame Navigation, Footer, Auth-Guard und Karten als React-Komponenten extrahieren.
3. Zuerst Home, Locked, 404 und Status auf Next.js portieren.
4. Danach Hub, Course und eine Lesson als Template migrieren.
5. Alle 33 Lessons aus einer strukturierten Datenquelle erzeugen.
6. Tools, Journal, Performance Lab und Adminbereich schrittweise portieren.
7. Bestehende API-Routen und Cookies unverändert übernehmen und mit Regressionstests absichern.
8. Alte URLs per Redirect erhalten, damit Links und Whop-Callbacks nicht brechen.
9. Erst nach vollständigem Paralleltest die statischen HTML-Dateien entfernen.

## Voraussetzung vor der Migration

- Launch-Checkliste vollständig bestanden.
- Supabase-Migrationen dokumentiert und gesichert.
- Whop Login, Logout und Rollen in automatisierten Tests abgedeckt.
- Desktop- und Mobile-Screenshots der aktuellen Referenzseiten vorhanden.
