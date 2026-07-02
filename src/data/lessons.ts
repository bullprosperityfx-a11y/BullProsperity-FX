export type Lesson = {
  id: number;
  module: string;
  title: string;
  description: string;
  focus: string;
  videoId?: string;
  videoTitle?: string;
  tags: string[];
};

export const lessons: Lesson[] = [
  {
    id: 1,
    module: "Modul 1 - Einführung",
    title: "Willkommen bei BullProsperity",
    description: "Überblick über Aufbau, Lernweg und Plattformlogik.",
    focus: "Struktur verstehen, bevor du tiefer in Trading einsteigst.",
    tags: ["Start", "Plattform", "Workflow"]
  },
  {
    id: 2,
    module: "Modul 1 - Einführung",
    title: "Wie du diese Plattform richtig nutzt",
    description: "Kursreihenfolge, Notizen, Tools und saubere Umsetzung.",
    focus: "Mit System lernen statt wahllos Inhalte konsumieren.",
    tags: ["Lernplan", "Notizen", "Routine"]
  },
  {
    id: 3,
    module: "Modul 1 - Einführung",
    title: "Risikoaufklärung & wichtiger Hinweis",
    description: "Risikoverständnis, Eigenverantwortung und klare Erwartungen.",
    focus: "Trading seriös betrachten und keine Gewinnversprechen erwarten.",
    videoId: "1184948123",
    videoTitle: "Risikoaufklärung & wichtiger Hinweis",
    tags: ["Risiko", "Verantwortung", "Hinweis"]
  },
  {
    id: 4,
    module: "Modul 2 - Trading Grundlagen",
    title: "Was ist Trading wirklich",
    description: "Trading als Prozess statt Hype oder schnelles Geld.",
    focus: "Ein realistisches Bild vom Markt entwickeln.",
    tags: ["Grundlagen", "Mindset"]
  },
  {
    id: 5,
    module: "Modul 2 - Trading Grundlagen",
    title: "Warum Retail Trader verlieren",
    description: "Typische Denkfehler, Stopps, Geduld und Retail-Verhalten.",
    focus: "Schwache Muster erkennen und strukturierter handeln.",
    videoId: "1173678522",
    tags: ["Retail", "Fehler", "Smart Money"]
  },
  {
    id: 6,
    module: "Modul 2 - Trading Grundlagen",
    title: "Die wichtigsten Märkte erklärt",
    description: "Forex, Indizes, Gold und Marktunterschiede.",
    focus: "Märkte sauber einordnen.",
    videoId: "1206409841",
    videoTitle: "Die wichtigsten Märkte erklärt",
    tags: ["Märkte", "XAUUSD", "Indizes"]
  },
  {
    id: 7,
    module: "Modul 2 - Trading Grundlagen",
    title: "Was du zum Traden brauchst",
    description: "Broker, Charting, Notizen, Routine und Setup.",
    focus: "Die richtige Infrastruktur aufbauen.",
    videoId: "1206410379",
    videoTitle: "Was du zum Traden brauchst",
    tags: ["Broker", "Charting", "Setup"]
  },
  {
    id: 8,
    module: "Modul 3 - Chart & Struktur",
    title: "Grundlagen der Chartanalyse",
    description: "Kerzen, Zonen, Struktur und saubere Chart-Lesbarkeit.",
    focus: "Charts klarer und ruhiger lesen.",
    tags: ["Chart", "Kerzen", "Struktur"]
  },
  {
    id: 9,
    module: "Modul 3 - Chart & Struktur",
    title: "Marktstruktur verstehen",
    description: "HH, HL, LH, LL und Strukturwechsel.",
    focus: "Marktphasen bewusst erkennen.",
    tags: ["HH", "HL", "BOS"]
  },
  {
    id: 10,
    module: "Modul 3 - Chart & Struktur",
    title: "Trend, Range und Impuls",
    description: "Bewegungsarten und Kontext im Chart.",
    focus: "Nicht jeden Move gleich behandeln.",
    tags: ["Trend", "Range", "Impuls"]
  },
  {
    id: 11,
    module: "Modul 3 - Chart & Struktur",
    title: "Support & Resistance",
    description: "Preisbereiche, Reaktionen und saubere Marktzonen.",
    focus: "Zonen ohne Chart-Chaos verwenden.",
    tags: ["Support", "Resistance", "Zonen"]
  },
  {
    id: 12,
    module: "Modul 4 - Liquidity",
    title: "Liquidity Grundlagen",
    description: "Liquidität, Stopps und Marktlogik.",
    focus: "Warum Märkte bestimmte Bereiche anlaufen.",
    tags: ["Liquidity", "Stops"]
  },
  {
    id: 13,
    module: "Modul 4 - Liquidity",
    title: "Warum Märkte Liquidität suchen",
    description: "Orderflow, Stop-Loss-Bereiche und Reaktionszonen.",
    focus: "Liquidität als Kontext nutzen.",
    tags: ["Orderflow", "Sweep"]
  },
  {
    id: 14,
    module: "Modul 4 - Liquidity",
    title: "Marktbewegungen verstehen",
    description: "Impuls, Korrektur, Sweep und Struktur.",
    focus: "Bewegungen nicht isoliert bewerten.",
    tags: ["Korrektur", "Sweep", "Kontext"]
  },
  {
    id: 15,
    module: "Modul 4 - Liquidity",
    title: "Institutionelle Marktteilnehmer",
    description: "Wie große Akteure Liquidität und Preisbereiche nutzen.",
    focus: "Den Markt aus größerer Perspektive betrachten.",
    tags: ["Institutionell", "SMC"]
  },
  {
    id: 16,
    module: "Modul 5 - Timing & Entries",
    title: "Timing & Trading Sessions",
    description: "London, New York und wichtige Tageszeiten.",
    focus: "Setups zur richtigen Zeit suchen.",
    tags: ["London", "New York", "Timing"]
  },
  {
    id: 17,
    module: "Modul 5 - Timing & Entries",
    title: "Entries verstehen",
    description: "Entry-Logik, Geduld und Bestätigung.",
    focus: "Nicht blind in den Markt springen.",
    tags: ["Entry", "Confirmation"]
  },
  {
    id: 18,
    module: "Modul 5 - Timing & Entries",
    title: "Confirmation Signale",
    description: "Wann eine Idee handelbar wird.",
    focus: "Von Idee zu Plan kommen.",
    tags: ["Confirmation", "Plan"]
  },
  {
    id: 19,
    module: "Modul 5 - Timing & Entries",
    title: "Beispielanalysen",
    description: "Charts lesen, Szenarien entwickeln, Entscheidungen vorbereiten.",
    focus: "Analyse in Praxis übersetzen.",
    tags: ["Analyse", "Praxis"]
  },
  {
    id: 20,
    module: "Modul 6 - Risk Management",
    title: "Risk Management Grundlagen",
    description: "Kapital schützen und Risiko planen.",
    focus: "Prozess vor Ergebnis.",
    videoId: "1206409947",
    videoTitle: "Risikomanagement im Trading",
    tags: ["Risiko", "Kapital"]
  },
  {
    id: 21,
    module: "Modul 6 - Risk Management",
    title: "Positionsgröße berechnen",
    description: "Positionsgröße anhand Risiko und Stop-Loss planen.",
    focus: "Keine zufällige Lot Size.",
    videoId: "1206409313",
    videoTitle: "Positionsgröße berechnen",
    tags: ["Lot Size", "Risiko"]
  },
  {
    id: 22,
    module: "Modul 6 - Risk Management",
    title: "Risk-Reward Verhältnis",
    description: "Chance und Risiko sauber einordnen.",
    focus: "CRV realistisch betrachten.",
    tags: ["CRV", "Reward"]
  },
  {
    id: 23,
    module: "Modul 6 - Risk Management",
    title: "Drawdown Kontrolle",
    description: "Verlustphasen, Grenzen und Stabilität.",
    focus: "Drawdown aktiv begrenzen.",
    videoId: "1206409595",
    videoTitle: "Drawdown Kontrolle",
    tags: ["Drawdown", "Kontrolle"]
  },
  {
    id: 24,
    module: "Modul 7 - Psychologie & Routine",
    title: "Trading Psychologie",
    description: "Emotionen, Druck und Erwartungsmanagement.",
    focus: "Psychologie als Teil des Systems behandeln.",
    videoId: "1206409773",
    videoTitle: "Trading Psychologie",
    tags: ["Psychologie", "Mindset"]
  },
  {
    id: 25,
    module: "Modul 7 - Psychologie & Routine",
    title: "Emotionen im Trading",
    description: "FOMO, Angst, Gier und Ungeduld erkennen.",
    focus: "Emotionen dokumentieren statt verdrängen.",
    tags: ["FOMO", "Emotionen"]
  },
  {
    id: 26,
    module: "Modul 7 - Psychologie & Routine",
    title: "Disziplin entwickeln",
    description: "Regeln, Wiederholung und Prozessstabilität.",
    focus: "Disziplin praktisch trainieren.",
    videoId: "1206410192",
    videoTitle: "Kontinuierliche Verbesserung",
    tags: ["Disziplin", "Regeln"]
  },
  {
    id: 27,
    module: "Modul 7 - Psychologie & Routine",
    title: "Tagesablauf eines Traders",
    description: "Vorbereitung, Session, Nachbereitung.",
    focus: "Den Tag als Ablauf planen.",
    tags: ["Routine", "Tagesplan"]
  },
  {
    id: 28,
    module: "Modul 7 - Psychologie & Routine",
    title: "Trading Journal",
    description: "Trades, Emotionen und Learnings dokumentieren.",
    focus: "Aus Daten lernen.",
    tags: ["Journal", "Review"]
  },
  {
    id: 29,
    module: "Modul 7 - Psychologie & Routine",
    title: "Kontinuierliche Verbesserung",
    description: "Wöchentliche Reviews und Prozessentwicklung.",
    focus: "Kleine Verbesserungen messbar machen.",
    tags: ["Review", "Fortschritt"]
  },
  {
    id: 30,
    module: "Modul 8 - BullProsperity SMC Strategie",
    title: "Das BullProsperity Marktmodell",
    description: "Die zentrale Marktlogik der Plattform.",
    focus: "Ein klares Modell statt Einzelsignale.",
    tags: ["SMC", "Marktmodell"]
  },
  {
    id: 31,
    module: "Modul 8 - BullProsperity SMC Strategie",
    title: "Institutionelle Preiszonen",
    description: "Preisbereiche mit institutionellem Kontext.",
    focus: "Zonen im Gesamtbild bewerten.",
    tags: ["Preiszone", "Institutionell"]
  },
  {
    id: 32,
    module: "Modul 8 - BullProsperity SMC Strategie",
    title: "Das BullProsperity Entry Modell",
    description: "Der strukturierte Weg von Bias zu Entry.",
    focus: "Entry nur mit vollständigem Kontext.",
    tags: ["Entry Modell", "Bias"]
  },
  {
    id: 33,
    module: "Modul 8 - BullProsperity SMC Strategie",
    title: "Live Setup Beispiele",
    description: "Praxisbeispiele aus dem BullProsperity Workflow.",
    focus: "Strategie an echten Situationen verstehen.",
    tags: ["Live Setups", "Praxis"]
  }
];

export const publishedVideoLessonIds = new Set(
  lessons.filter((lesson) => lesson.videoId).map((lesson) => lesson.id)
);

export function getLesson(id: number) {
  return lessons.find((lesson) => lesson.id === id);
}

export function getAdjacentLesson(id: number) {
  const previous = lessons.find((lesson) => lesson.id === id - 1);
  const next = lessons.find((lesson) => lesson.id === id + 1);
  return { previous, next };
}
