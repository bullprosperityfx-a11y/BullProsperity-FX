const fs = require("fs");
const path = require("path");

const lessons = [
  {
    number: 1,
    module: "Modul 1 – Einführung",
    titleWhite: "Willkommen bei",
    titleGold: "BullProsperity",
    lessonTitle: "Lesson 1 – Willkommen bei BullProsperity",
    description:
      "In dieser ersten Lesson erhältst du einen Überblick über die Plattform, den strukturierten Aufbau der Inhalte und die richtige Herangehensweise für deinen Lernweg innerhalb von BullProsperity.",
    summary:
      "Diese Lesson dient als Einstieg in deine Education Platform. Sie soll dir Orientierung geben, damit du die Inhalte nicht nur konsumierst, sondern sauber und mit System durcharbeitest.",
    learnPoints: [
      "Wie BullProsperity aufgebaut ist",
      "Wie du die Learning Modules richtig nutzt",
      "Warum die Reihenfolge der Lessons wichtig ist"
    ],
    focusPoints: [
      "Beginne immer mit Modul 1",
      "Arbeite dich strukturiert Lesson für Lesson durch",
      "Springe nicht direkt in spätere Themen"
    ],
    videoSrc: "https://player.vimeo.com/video/1173678522?badge=0&autopause=0&player_id=0&app_id=58479"
  },
  {
    number: 2,
    module: "Modul 1 – Einführung",
    titleWhite: "Wie du diese",
    titleGold: "Plattform richtig nutzt",
    lessonTitle: "Lesson 2 – Wie du diese Plattform richtig nutzt",
    description:
      "In dieser Lesson lernst du, wie du die Inhalte innerhalb der Plattform sinnvoll durcharbeitest und wie du den größten Mehrwert aus den Learning Modules ziehst.",
    summary:
      "Diese Lesson zeigt dir, wie du die Plattform sinnvoll nutzt, damit dein Lernprozess klar, strukturiert und nachhaltig bleibt.",
    learnPoints: [
      "Wie du Module in der richtigen Reihenfolge nutzt",
      "Wie du Lessons sinnvoll durcharbeitest",
      "Wie du Tools und Setup Room ergänzend einsetzt"
    ],
    focusPoints: [
      "Nicht wahllos zwischen Lessons springen",
      "Notizen zu wichtigen Inhalten machen",
      "Gelernte Inhalte direkt praktisch einordnen"
    ],
    videoSrc: ""
  },
  {
    number: 3,
    module: "Modul 1 – Einführung",
    titleWhite: "Risikoaufklärung &",
    titleGold: "wichtiger Hinweis",
    lessonTitle: "Lesson 3 – Risikoaufklärung & wichtiger Hinweis",
    description:
      "Diese Lesson erklärt den wichtigen rechtlichen und inhaltlichen Rahmen der Plattform. Alle Inhalte dienen ausschließlich Bildungszwecken.",
    summary:
      "Diese Lesson macht deutlich, dass BullProsperity eine Education Platform ist und keine Finanzberatung oder Handelsempfehlung darstellt.",
    learnPoints: [
      "Warum alle Inhalte nur zu Bildungszwecken dienen",
      "Warum Trading mit Risiken verbunden ist",
      "Warum Eigenverantwortung im Trading entscheidend ist"
    ],
    focusPoints: [
      "Keine Inhalte als Finanzberatung verstehen",
      "Risiko immer ernst nehmen",
      "Nur mit klarem Plan und Verantwortung handeln"
    ],
    videoSrc: ""
  },
  {
    number: 4,
    module: "Modul 1 – Einführung",
    titleWhite: "Warum die meisten",
    titleGold: "Trader scheitern",
    lessonTitle: "Lesson 4 – Warum die meisten Trader scheitern",
    description:
      "In dieser Lesson lernst du die häufigsten Ursachen kennen, warum viele Trader langfristig keinen Erfolg haben.",
    summary:
      "Diese Lesson zeigt dir typische Fehlerquellen im Trading und legt die Grundlage für ein realistischeres Verständnis des Marktes.",
    learnPoints: [
      "Welche Denkfehler viele Trader machen",
      "Warum fehlende Struktur gefährlich ist",
      "Weshalb Disziplin und Geduld so wichtig sind"
    ],
    focusPoints: [
      "Nicht ohne Plan handeln",
      "Emotionale Entscheidungen vermeiden",
      "Trading als Prozess verstehen"
    ],
    videoSrc: ""
  },
  {
    number: 5,
    module: "Modul 2 – Trading Grundlagen",
    titleWhite: "Was ist",
    titleGold: "Trading wirklich",
    lessonTitle: "Lesson 5 – Was ist Trading wirklich",
    description:
      "Diese Lesson erklärt dir, was Trading wirklich bedeutet und wie du den Markt realistischer einordnest.",
    summary:
      "Du erhältst ein klares Grundverständnis davon, was Trading ist und was es nicht ist.",
    learnPoints: [
      "Was Trading im Kern bedeutet",
      "Warum Trading kein schnelles Geld ist",
      "Welche Rolle Marktverständnis spielt"
    ],
    focusPoints: [
      "Trading nüchtern betrachten",
      "Keine falschen Erwartungen aufbauen",
      "Grundlagen zuerst verstehen"
    ],
    videoSrc: ""
  },
  {
    number: 6,
    module: "Modul 2 – Trading Grundlagen",
    titleWhite: "Warum Retail Trader",
    titleGold: "verlieren",
    lessonTitle: "Lesson 6 – Warum Retail Trader verlieren",
    description:
      "Diese Lesson zeigt dir, warum viele Retail Trader am Markt verlieren und welche Muster sich dabei immer wiederholen.",
    summary:
      "Du lernst, welche typischen Fehler Retail Trader machen und warum Marktverständnis, Disziplin und Risiko eine zentrale Rolle spielen.",
    learnPoints: [
      "Warum Retail Trader oft zu emotional handeln",
      "Welche typischen Fehler immer wieder vorkommen",
      "Warum Struktur und Risiko entscheidend sind"
    ],
    focusPoints: [
      "FOMO vermeiden",
      "Nicht impulsiv in den Markt springen",
      "Fehler erkennen und bewusst vermeiden"
    ],
    videoSrc: "PASTE_YOUR_EXISTING_RETAIL_TRADER_EMBED_LINK_HERE"
  },
  {
    number: 7,
    module: "Modul 2 – Trading Grundlagen",
    titleWhite: "Die wichtigsten",
    titleGold: "Märkte erklärt",
    lessonTitle: "Lesson 7 – Die wichtigsten Märkte erklärt",
    description:
      "Diese Lesson gibt dir einen Überblick über die wichtigsten Märkte wie Forex, Indizes, Rohstoffe und Krypto.",
    summary:
      "Du lernst die Unterschiede zwischen den Märkten kennen und bekommst ein klareres Verständnis dafür, worauf du dich fokussieren solltest.",
    learnPoints: [
      "Welche Märkte es gibt",
      "Wie sich Märkte unterscheiden",
      "Warum Fokus im Trading wichtig ist"
    ],
    focusPoints: [
      "Nicht zu viele Märkte gleichzeitig handeln",
      "Eigene Stärken erkennen",
      "Märkte gezielt auswählen"
    ],
    videoSrc: ""
  },
  {
    number: 8,
    module: "Modul 2 – Trading Grundlagen",
    titleWhite: "Was du zum",
    titleGold: "Traden brauchst",
    lessonTitle: "Lesson 8 – Was du zum Traden brauchst",
    description:
      "In dieser Lesson lernst du, welche Tools, Plattformen und Grundlagen du wirklich brauchst, um sauber zu starten.",
    summary:
      "Du erfährst, welche Ausrüstung und welche Software im Trading sinnvoll sind und worauf du am Anfang achten solltest.",
    learnPoints: [
      "Welche Tools sinnvoll sind",
      "Welche Plattformen du brauchst",
      "Warum ein sauberer Setup wichtig ist"
    ],
    focusPoints: [
      "Mit einem klaren Setup arbeiten",
      "Nicht zu viele unnötige Tools nutzen",
      "Funktional statt überladen aufbauen"
    ],
    videoSrc: ""
  },
  {
    number: 9,
    module: "Modul 3 – Chartanalyse",
    titleWhite: "Grundlagen der",
    titleGold: "Chartanalyse",
    lessonTitle: "Lesson 9 – Grundlagen der Chartanalyse",
    description:
      "Diese Lesson legt das Fundament für dein Verständnis von Preisbewegungen und Charts.",
    summary:
      "Du lernst, wie du Charts grundlegend liest und welche Basis du für spätere Analysen brauchst.",
    learnPoints: [
      "Wie Charts aufgebaut sind",
      "Wie Preisbewegung dargestellt wird",
      "Warum sauberes Lesen von Charts wichtig ist"
    ],
    focusPoints: [
      "Nicht nur Muster auswendig lernen",
      "Preisbewegung wirklich verstehen",
      "Grundlagen ernst nehmen"
    ],
    videoSrc: ""
  },
  {
    number: 10,
    module: "Modul 3 – Chartanalyse",
    titleWhite: "Marktstruktur",
    titleGold: "verstehen",
    lessonTitle: "Lesson 10 – Marktstruktur verstehen",
    description:
      "Diese Lesson zeigt dir, wie du Marktstruktur erkennst und warum sie für jede Analyse entscheidend ist.",
    summary:
      "Du lernst, wie sich Märkte strukturieren und wie du Bewegungen im größeren Kontext einordnest.",
    learnPoints: [
      "Was Marktstruktur bedeutet",
      "Wie Struktur im Chart sichtbar wird",
      "Warum Struktur für Entscheidungen wichtig ist"
    ],
    focusPoints: [
      "Nicht isoliert auf Kerzen schauen",
      "Marktbewegung im Kontext betrachten",
      "Struktur vor Entry analysieren"
    ],
    videoSrc: ""
  },
  {
    number: 11,
    module: "Modul 3 – Chartanalyse",
    titleWhite: "Trend, Range",
    titleGold: "und Impuls",
    lessonTitle: "Lesson 11 – Trend, Range und Impuls",
    description:
      "In dieser Lesson lernst du die Unterschiede zwischen Trend, Seitwärtsphase und impulsiven Bewegungen.",
    summary:
      "Du verstehst besser, in welcher Marktphase du dich befindest und wie sich das auf deine Analyse auswirkt.",
    learnPoints: [
      "Was einen Trend ausmacht",
      "Wie eine Range aussieht",
      "Wie Impulsbewegungen entstehen"
    ],
    focusPoints: [
      "Marktphasen unterscheiden",
      "Nicht jede Bewegung gleich bewerten",
      "Marktbedingungen anpassen"
    ],
    videoSrc: ""
  },
  {
    number: 12,
    module: "Modul 3 – Chartanalyse",
    titleWhite: "Support &",
    titleGold: "Resistance",
    lessonTitle: "Lesson 12 – Support & Resistance",
    description:
      "Diese Lesson erklärt dir die Grundlagen von Support- und Resistance-Bereichen im Chart.",
    summary:
      "Du lernst, wie wichtige Zonen im Markt erkannt und in deine Analyse eingebunden werden können.",
    learnPoints: [
      "Was Support und Resistance bedeuten",
      "Wie wichtige Zonen markiert werden",
      "Warum Reaktionsbereiche relevant sind"
    ],
    focusPoints: [
      "Zonen nicht zu präzise sehen",
      "Reaktionsbereiche im Kontext bewerten",
      "Mit Marktstruktur kombinieren"
    ],
    videoSrc: ""
  },
  {
    number: 13,
    module: "Modul 4 – Liquidität & Marktbewegung",
    titleWhite: "Liquidity",
    titleGold: "Grundlagen",
    lessonTitle: "Lesson 13 – Liquidity Grundlagen",
    description:
      "Diese Lesson führt dich in das Thema Liquidität ein und zeigt dir, warum sie im Markt eine große Rolle spielt.",
    summary:
      "Du lernst die Grundlagen von Liquidität kennen und verstehst besser, warum Märkte bestimmte Bereiche anlaufen.",
    learnPoints: [
      "Was Liquidität im Trading bedeutet",
      "Wo Liquidität häufig liegt",
      "Warum Liquidität Marktbewegung beeinflusst"
    ],
    focusPoints: [
      "Nicht nur Preis sehen, sondern auch Struktur",
      "Liquidität als Kontext nutzen",
      "Reaktionszonen bewusster wahrnehmen"
    ],
    videoSrc: ""
  },
  {
    number: 14,
    module: "Modul 4 – Liquidität & Marktbewegung",
    titleWhite: "Warum Märkte",
    titleGold: "Liquidität suchen",
    lessonTitle: "Lesson 14 – Warum Märkte Liquidität suchen",
    description:
      "In dieser Lesson geht es darum, warum der Markt oft in bestimmte Bereiche läuft, bevor er reagiert.",
    summary:
      "Du verstehst besser, warum sich Märkte scheinbar gezielt in bestimmte Preisbereiche bewegen.",
    learnPoints: [
      "Warum Liquidität angezogen wird",
      "Wie Bewegungen im Markt vorbereitet werden",
      "Warum viele Trader in Fallen geraten"
    ],
    focusPoints: [
      "Nicht impulsiv auf Bewegungen reagieren",
      "Ziele des Marktes besser einordnen",
      "Vorherige Struktur beachten"
    ],
    videoSrc: ""
  },
  {
    number: 15,
    module: "Modul 4 – Liquidität & Marktbewegung",
    titleWhite: "Marktbewegungen",
    titleGold: "verstehen",
    lessonTitle: "Lesson 15 – Marktbewegungen verstehen",
    description:
      "Diese Lesson hilft dir dabei, Bewegungen im Markt besser zu interpretieren und nicht nur oberflächlich zu betrachten.",
    summary:
      "Du entwickelst ein klareres Bild davon, wie sich Märkte bewegen und wie Struktur, Liquidität und Reaktion zusammenspielen.",
    learnPoints: [
      "Wie Marktbewegungen gelesen werden",
      "Wie Reaktion und Bewegung zusammenhängen",
      "Warum Kontext wichtiger als einzelne Kerzen ist"
    ],
    focusPoints: [
      "Markt ganzheitlich lesen",
      "Nicht nur auf einzelne Signale verlassen",
      "Bewegung immer im Kontext betrachten"
    ],
    videoSrc: ""
  },
  {
    number: 16,
    module: "Modul 4 – Liquidität & Marktbewegung",
    titleWhite: "Institutionelle",
    titleGold: "Marktteilnehmer",
    lessonTitle: "Lesson 16 – Institutionelle Marktteilnehmer",
    description:
      "Diese Lesson zeigt dir, warum große Marktteilnehmer eine wichtige Rolle bei Preisbewegungen spielen.",
    summary:
      "Du bekommst ein besseres Verständnis dafür, wie institutionelles Verhalten Marktbewegungen beeinflusst.",
    learnPoints: [
      "Welche Rolle institutionelle Teilnehmer spielen",
      "Warum große Orders Bewegung auslösen können",
      "Warum Retail-Sicht oft zu kurz greift"
    ],
    focusPoints: [
      "Den Markt nicht zu klein denken",
      "Preisbewegung aus größerer Perspektive sehen",
      "Marktlogik statt Bauchgefühl"
    ],
    videoSrc: ""
  },
  {
    number: 17,
    module: "Modul 5 – Entry Verständnis",
    titleWhite: "Timing &",
    titleGold: "Trading Sessions",
    lessonTitle: "Lesson 17 – Timing & Trading Sessions",
    description:
      "In dieser Lesson lernst du, warum Timing und Sessions im Trading eine wichtige Rolle spielen.",
    summary:
      "Du verstehst, wie sich verschiedene Handelszeiten auf Bewegung und Verhalten des Marktes auswirken können.",
    learnPoints: [
      "Welche Sessions es gibt",
      "Warum Timing wichtig ist",
      "Wann Marktbewegungen oft aktiver sind"
    ],
    focusPoints: [
      "Nicht zu jeder Zeit handeln",
      "Session-Kontext beachten",
      "Timing gezielt in die Analyse integrieren"
    ],
    videoSrc: ""
  },
  {
    number: 18,
    module: "Modul 5 – Entry Verständnis",
    titleWhite: "Entries",
    titleGold: "verstehen",
    lessonTitle: "Lesson 18 – Entries verstehen",
    description:
      "Diese Lesson zeigt dir, wie du Einstiege besser verstehst und nicht wahllos in Trades springst.",
    summary:
      "Du lernst, warum gute Entries aus Kontext, Struktur und Bestätigung entstehen.",
    learnPoints: [
      "Was einen guten Entry ausmacht",
      "Warum Kontext vor Einstieg wichtig ist",
      "Wie du impulsive Entries vermeidest"
    ],
    focusPoints: [
      "Nicht blind einsteigen",
      "Marktstruktur vor dem Entry prüfen",
      "Geduld vor Ausführung"
    ],
    videoSrc: ""
  },
  {
    number: 19,
    module: "Modul 5 – Entry Verständnis",
    titleWhite: "Confirmation",
    titleGold: "Signale",
    lessonTitle: "Lesson 19 – Confirmation Signale",
    description:
      "Diese Lesson behandelt Bestätigungssignale und wie sie dir helfen können, Einstiege strukturierter zu bewerten.",
    summary:
      "Du lernst, wie Bestätigung im Trading eingesetzt werden kann, um impulsive Entscheidungen zu reduzieren.",
    learnPoints: [
      "Was Confirmation Signale sind",
      "Wie Bestätigung Sicherheit geben kann",
      "Warum Geduld vor Entries wichtig ist"
    ],
    focusPoints: [
      "Nicht zu früh einsteigen",
      "Bestätigung bewusst abwarten",
      "Signale nie isoliert betrachten"
    ],
    videoSrc: ""
  },
  {
    number: 20,
    module: "Modul 5 – Entry Verständnis",
    titleWhite: "Beispiel",
    titleGold: "Analysen",
    lessonTitle: "Lesson 20 – Beispielanalysen",
    description:
      "In dieser Lesson werden beispielhafte Analysen genutzt, um vorherige Inhalte greifbarer zu machen.",
    summary:
      "Du siehst, wie verschiedene Bestandteile in einer Analyse zusammenkommen können.",
    learnPoints: [
      "Wie Analysen strukturiert aufgebaut werden",
      "Wie vorherige Inhalte praktisch verknüpft werden",
      "Wie du eigene Analysen klarer strukturierst"
    ],
    focusPoints: [
      "Theorie mit Praxis verbinden",
      "Nicht nur Muster kopieren",
      "Eigene Logik aufbauen"
    ],
    videoSrc: ""
  },
  {
    number: 21,
    module: "Modul 6 – Risk Management",
    titleWhite: "Risk Management",
    titleGold: "Grundlagen",
    lessonTitle: "Lesson 21 – Risk Management Grundlagen",
    description:
      "Diese Lesson vermittelt dir die Grundlagen eines sauberen und langfristig sinnvollen Risikomanagements.",
    summary:
      "Du lernst, warum Risikomanagement eine zentrale Grundlage für langfristige Stabilität im Trading ist.",
    learnPoints: [
      "Warum Risiko wichtiger als einzelne Trades ist",
      "Wie Kapital geschützt wird",
      "Warum Struktur im Risiko entscheidend ist"
    ],
    focusPoints: [
      "Risiko vor dem Trade festlegen",
      "Verlust akzeptieren können",
      "Langfristig statt kurzfristig denken"
    ],
    videoSrc: ""
  },
  {
    number: 22,
    module: "Modul 6 – Risk Management",
    titleWhite: "Positionsgröße",
    titleGold: "berechnen",
    lessonTitle: "Lesson 22 – Positionsgröße berechnen",
    description:
      "Diese Lesson zeigt dir, wie Positionsgröße und Risiko zusammenhängen.",
    summary:
      "Du bekommst ein besseres Verständnis dafür, wie du Risiko und Positionsgröße strukturierter verbinden kannst.",
    learnPoints: [
      "Warum Positionsgröße wichtig ist",
      "Wie Risiko und Größe zusammenhängen",
      "Warum Konsistenz entscheidend ist"
    ],
    focusPoints: [
      "Nicht zufällig Positionsgrößen wählen",
      "Risiko pro Trade bewusst definieren",
      "Kapital schützen"
    ],
    videoSrc: ""
  },
  {
    number: 23,
    module: "Modul 6 – Risk Management",
    titleWhite: "Risk-Reward",
    titleGold: "Verhältnis",
    lessonTitle: "Lesson 23 – Risk-Reward Verhältnis",
    description:
      "Diese Lesson erklärt dir das Risk-Reward Verhältnis und seine Bedeutung im Trading.",
    summary:
      "Du lernst, wie Chancen und Risiken in einem Trade zueinander stehen können.",
    learnPoints: [
      "Was Risk-Reward bedeutet",
      "Warum Chancen-Risiko wichtig ist",
      "Wie RR in Entscheidungen einfließt"
    ],
    focusPoints: [
      "Nicht nur auf Trefferquote schauen",
      "Trades auch vom Verhältnis bewerten",
      "Mit realistischer Erwartung arbeiten"
    ],
    videoSrc: ""
  },
  {
    number: 24,
    module: "Modul 6 – Risk Management",
    titleWhite: "Drawdown",
    titleGold: "Kontrolle",
    lessonTitle: "Lesson 24 – Drawdown Kontrolle",
    description:
      "Diese Lesson behandelt Verlustphasen und wie du mit Drawdowns sinnvoll umgehst.",
    summary:
      "Du lernst, warum Drawdowns normal sind und wie du strukturiert darauf reagieren kannst.",
    learnPoints: [
      "Was ein Drawdown ist",
      "Warum Verlustphasen dazugehören",
      "Wie du dich in solchen Phasen schützt"
    ],
    focusPoints: [
      "Nicht emotional eskalieren",
      "Risiko in Verlustphasen reduzieren",
      "Disziplin auch bei Druck bewahren"
    ],
    videoSrc: ""
  },
  {
    number: 25,
    module: "Modul 7 – Psychologie & Routine",
    titleWhite: "Trading",
    titleGold: "Psychologie",
    lessonTitle: "Lesson 25 – Trading Psychologie",
    description:
      "Diese Lesson zeigt dir, warum Psychologie im Trading eine der wichtigsten Grundlagen ist.",
    summary:
      "Du verstehst, wie Gedanken, Emotionen und Verhaltensmuster dein Trading beeinflussen.",
    learnPoints: [
      "Warum Psychologie im Trading entscheidend ist",
      "Wie Emotionen Entscheidungen beeinflussen",
      "Warum mentale Stabilität wichtig ist"
    ],
    focusPoints: [
      "Emotionen bewusst wahrnehmen",
      "Nicht reaktiv handeln",
      "Geduld und Kontrolle aufbauen"
    ],
    videoSrc: ""
  },
  {
    number: 26,
    module: "Modul 7 – Psychologie & Routine",
    titleWhite: "Emotionen im",
    titleGold: "Trading",
    lessonTitle: "Lesson 26 – Emotionen im Trading",
    description:
      "Diese Lesson vertieft das Thema Emotionen und deren Einfluss auf Trading-Entscheidungen.",
    summary:
      "Du lernst, wie Angst, Gier und Frust Entscheidungen verzerren können.",
    learnPoints: [
      "Welche Emotionen häufig auftreten",
      "Wie Emotionen deinen Plan stören",
      "Warum emotionale Kontrolle trainiert werden muss"
    ],
    focusPoints: [
      "Nicht aus Angst oder Gier handeln",
      "Emotionen dokumentieren",
      "Vor Entscheidungen kurz reflektieren"
    ],
    videoSrc: ""
  },
  {
    number: 27,
    module: "Modul 7 – Psychologie & Routine",
    titleWhite: "Disziplin",
    titleGold: "entwickeln",
    lessonTitle: "Lesson 27 – Disziplin entwickeln",
    description:
      "Diese Lesson hilft dir dabei, Disziplin im Trading nicht nur zu verstehen, sondern praktisch aufzubauen.",
    summary:
      "Du lernst, warum Disziplin aus Wiederholung, Klarheit und System entsteht.",
    learnPoints: [
      "Was Disziplin im Trading bedeutet",
      "Warum Regeln eingehalten werden müssen",
      "Wie Routine Disziplin unterstützt"
    ],
    focusPoints: [
      "Nicht nach Gefühl handeln",
      "Klare Regeln definieren",
      "Wiederholung ernst nehmen"
    ],
    videoSrc: ""
  },
  {
    number: 28,
    module: "Modul 7 – Psychologie & Routine",
    titleWhite: "Tagesablauf eines",
    titleGold: "Traders",
    lessonTitle: "Lesson 28 – Tagesablauf eines Traders",
    description:
      "Diese Lesson zeigt dir, wie ein strukturierter Tagesablauf im Trading aussehen kann.",
    summary:
      "Du erkennst, warum Vorbereitung, Analyse und Nachbereitung wichtige Bestandteile einer Routine sind.",
    learnPoints: [
      "Wie ein strukturierter Trading-Tag aussehen kann",
      "Warum Vorbereitung wichtig ist",
      "Warum Nachbereitung dazugehört"
    ],
    focusPoints: [
      "Nicht planlos in den Markt gehen",
      "Routine etablieren",
      "Konsistenz im Alltag aufbauen"
    ],
    videoSrc: ""
  },
  {
    number: 29,
    module: "Modul 7 – Psychologie & Routine",
    titleWhite: "Trading",
    titleGold: "Journal",
    lessonTitle: "Lesson 29 – Trading Journal",
    description:
      "Diese Lesson zeigt dir, warum ein Trading Journal ein wichtiges Werkzeug für Entwicklung und Reflexion ist.",
    summary:
      "Du lernst, wie ein Journal dich dabei unterstützt, Muster, Fehler und Fortschritte zu erkennen.",
    learnPoints: [
      "Warum ein Journal wichtig ist",
      "Welche Inhalte dokumentiert werden sollten",
      "Wie Reflexion deine Entwicklung unterstützt"
    ],
    focusPoints: [
      "Trades ehrlich dokumentieren",
      "Nicht nur Gewinne festhalten",
      "Lernen aus Wiederholungen"
    ],
    videoSrc: ""
  },
  {
    number: 30,
    module: "Modul 7 – Psychologie & Routine",
    titleWhite: "Kontinuierliche",
    titleGold: "Verbesserung",
    lessonTitle: "Lesson 30 – Kontinuierliche Verbesserung",
    description:
      "Diese letzte Lesson fasst den Lernweg zusammen und zeigt dir, wie du langfristig an deinem Prozess weiterarbeitest.",
    summary:
      "Du lernst, warum Entwicklung im Trading aus Reflexion, Anpassung und Wiederholung entsteht.",
    learnPoints: [
      "Warum Trading ein langfristiger Prozess ist",
      "Wie du dich nachhaltig weiterentwickelst",
      "Warum Reflexion und Anpassung wichtig bleiben"
    ],
    focusPoints: [
      "Nicht aufhören zu reflektieren",
      "Stetig an deinem Prozess arbeiten",
      "Langfristig denken"
    ],
    videoSrc: ""
  }
];

function getLessonHref(n) {
  return `/lesson${n}.html`;
}

function renderSidebar(currentLesson) {
  const modules = [
    {
      name: "Modul 1 – Einführung",
      lessons: [1, 2, 3, 4]
    },
    {
      name: "Modul 2 – Trading Grundlagen",
      lessons: [5, 6, 7, 8]
    },
    {
      name: "Modul 3 – Chartanalyse",
      lessons: [9, 10, 11, 12]
    },
    {
      name: "Modul 4 – Liquidität & Marktbewegung",
      lessons: [13, 14, 15, 16]
    },
    {
      name: "Modul 5 – Entry Verständnis",
      lessons: [17, 18, 19, 20]
    },
    {
      name: "Modul 6 – Risk Management",
      lessons: [21, 22, 23, 24]
    },
    {
      name: "Modul 7 – Psychologie & Routine",
      lessons: [25, 26, 27, 28, 29, 30]
    }
  ];

  return modules.map((mod) => {
    const isActiveModule = mod.lessons.includes(currentLesson.number);
    const moduleLessons = mod.lessons.map((ln) => {
      const lesson = lessons.find(l => l.number === ln);
      const activeClass = ln === currentLesson.number ? "lesson-link active" : "lesson-link";
      const href = getLessonHref(ln);
      return `<a href="${href}" class="${activeClass}">${lesson.lessonTitle}</a>`;
    }).join("");

    return `
      <div class="module-item ${isActiveModule ? "active" : ""}">
        <div class="module-head">
          <span class="module-name">${mod.name}</span>
          <span class="module-count">${mod.lessons.length} Lektionen</span>
        </div>
        <div class="module-sub">
          ${moduleLessons}
        </div>
      </div>
    `;
  }).join("");
}

function renderVideoBlock(lesson) {
  if (lesson.videoSrc && lesson.videoSrc.trim() !== "") {
    return `
      <div class="video-wrap">
        <iframe
          src="${lesson.videoSrc}"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          title="${lesson.lessonTitle}">
        </iframe>
      </div>
    `;
  }

  return `
    <div class="video-placeholder">
      <p>Füge hier später dein Video für diese Lesson ein.</p>
    </div>
  `;
}

function renderNav(currentLesson) {
  const prev = lessons.find(l => l.number === currentLesson.number - 1);
  const next = lessons.find(l => l.number === currentLesson.number + 1);

  return `
    <div class="nav-row">
      ${
        prev
          ? `<a href="${getLessonHref(prev.number)}" class="nav-card">
              <span>Vorherige Lesson</span>
              <strong>${prev.lessonTitle}</strong>
            </a>`
          : `<a href="/course.html" class="nav-card">
              <span>Zurück</span>
              <strong>Kursübersicht</strong>
            </a>`
      }

      ${
        next
          ? `<a href="${getLessonHref(next.number)}" class="nav-card">
              <span>Nächste Lesson</span>
              <strong>${next.lessonTitle}</strong>
            </a>`
          : `<a href="/course.html" class="nav-card">
              <span>Abschluss</span>
              <strong>Zurück zur Kursübersicht</strong>
            </a>`
      }
    </div>
  `;
}

function getProgressPercent(number) {
  return Math.round((number / 30) * 100);
}

function buildHtml(lesson) {
  const progress = getProgressPercent(lesson.number);

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BullProsperity | Lesson ${lesson.number}</title>

  <script>
    (async () => {
      try {
        const res = await fetch("/api/access", {
          credentials: "include"
        });
        const data = await res.json();

        if (data.role !== "admin" && data.role !== "premium") {
          window.location.href = "locked.html";
        }
      } catch (err) {
        window.location.href = "locked.html";
      }
    })();
  </script>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --gold: #ffd700;
      --gold-soft: #ffe45e;
      --white: #ffffff;
      --text: #e7e7e7;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      background:
        radial-gradient(circle at top, rgba(255, 215, 0, 0.07), transparent 35%),
        linear-gradient(135deg, #050505, #090909 58%, #101010);
      color: var(--white);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .chart-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.22;
    }

    .chart-bg svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .line-main {
      fill: none;
      stroke: rgba(255, 215, 0, 0.62);
      stroke-width: 3.5;
    }

    .line-alt {
      fill: none;
      stroke: rgba(255, 255, 255, 0.12);
      stroke-width: 2.2;
    }

    .wick-gold {
      stroke: rgba(255, 215, 0, 0.4);
      stroke-width: 2.2;
    }

    .wick-white {
      stroke: rgba(255, 255, 255, 0.16);
      stroke-width: 2;
    }

    .body-gold {
      fill: rgba(255, 215, 0, 0.16);
      stroke: rgba(255, 215, 0, 0.34);
      stroke-width: 1.4;
    }

    .body-white {
      fill: rgba(255, 255, 255, 0.05);
      stroke: rgba(255, 255, 255, 0.14);
      stroke-width: 1.2;
    }

    .page-shell {
      position: relative;
      z-index: 1;
      width: min(1320px, calc(100% - 36px));
      margin: 18px auto;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      padding: 22px 26px 34px;
      background: rgba(0, 0, 0, 0.08);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 26px;
      gap: 18px;
    }

    .logo {
      color: var(--gold);
      font-weight: 800;
      font-size: 2.1rem;
      letter-spacing: -0.03em;
      text-shadow: 0 0 15px rgba(255, 215, 0, 0.18);
      white-space: nowrap;
    }

    nav {
      display: flex;
      gap: 26px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    nav a {
      color: #ffffff;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 700;
      transition: 0.2s ease;
    }

    nav a:hover,
    nav a.active {
      color: var(--gold);
    }

    .layout {
      width: min(1120px, 100%);
      margin: 0 auto;
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 18px;
      align-items: start;
    }

    .card,
    .hero-card,
    .lesson-card {
      border: 1px solid rgba(255, 215, 0, 0.12);
      border-radius: 28px;
      background:
        radial-gradient(circle at top left, rgba(255, 215, 0, 0.08), transparent 26%),
        linear-gradient(180deg, rgba(16,16,16,0.96), rgba(11,11,11,0.95));
      position: relative;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.03),
        0 20px 40px rgba(0,0,0,0.24);
      padding: 24px 24px 22px;
    }

    .top-tag {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 999px;
      border: 1px solid rgba(255, 215, 0, 0.32);
      color: var(--gold-soft);
      background: rgba(255, 215, 0, 0.07);
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .sidebar-title,
    .card h2,
    .lesson-card h3 {
      color: var(--gold);
      font-weight: 900;
      letter-spacing: -0.03em;
    }

    .sidebar-title {
      font-size: 2rem;
      line-height: 1;
      margin-bottom: 10px;
    }

    .sidebar-text,
    .hero-text,
    .card p,
    .lesson-card p {
      color: #f0f0f0;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .progress-wrap {
      margin-top: 16px;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      color: #efefef;
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .progress-bar {
      width: 100%;
      height: 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,215,0,0.1);
      overflow: hidden;
    }

    .progress-fill {
      width: ${progress}%;
      height: 100%;
      background: linear-gradient(135deg, #ffe15b, #f0b90b);
      border-radius: 999px;
    }

    .module-list {
      display: grid;
      gap: 14px;
      margin-top: 18px;
      max-height: 74vh;
      overflow-y: auto;
      padding-right: 6px;
    }

    .module-list::-webkit-scrollbar {
      width: 8px;
    }

    .module-list::-webkit-scrollbar-thumb {
      background: rgba(255, 215, 0, 0.2);
      border-radius: 999px;
    }

    .module-item {
      display: block;
      color: #fff;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255, 215, 0, 0.1);
      border-radius: 18px;
      padding: 14px;
      transition: 0.2s ease;
    }

    .module-item.active,
    .module-item:hover {
      border-color: rgba(255,215,0,0.24);
      background: rgba(255,255,255,0.05);
    }

    .module-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
    }

    .module-name {
      color: var(--gold);
      font-weight: 800;
      font-size: 1rem;
      line-height: 1.25;
    }

    .module-count {
      color: #d8d8d8;
      font-size: 0.82rem;
      font-weight: 700;
      white-space: nowrap;
      padding-top: 4px;
    }

    .module-sub {
      display: grid;
      gap: 8px;
      margin-top: 10px;
    }

    .lesson-link {
      display: block;
      text-decoration: none;
      color: #ffffff;
      border: 1px solid rgba(255,215,0,0.1);
      background: rgba(255,255,255,0.02);
      border-radius: 14px;
      padding: 10px 12px;
      font-size: 0.88rem;
      font-weight: 700;
      line-height: 1.4;
      transition: 0.2s ease;
    }

    .lesson-link:hover,
    .lesson-link.active {
      color: var(--gold);
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,215,0,0.3);
    }

    .content-stack {
      display: grid;
      gap: 18px;
    }

    .hero-card h1 {
      font-size: clamp(2.5rem, 4vw, 4.2rem);
      line-height: 0.98;
      font-weight: 900;
      letter-spacing: -0.04em;
      margin-bottom: 16px;
    }

    .hero-card h1 .white {
      color: var(--white);
    }

    .hero-card h1 .gold {
      color: var(--gold);
      text-shadow: 0 0 18px rgba(255, 215, 0, 0.14);
    }

    .btn-row {
      display: flex;
      justify-content: flex-start;
      gap: 14px;
      flex-wrap: wrap;
      margin-top: 18px;
    }

    .btn {
      min-width: 155px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding: 14px 20px;
      border-radius: 16px;
      font-weight: 800;
      text-decoration: none;
      transition: 0.2s ease;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
    }

    .btn-gold {
      color: #111111;
      background: linear-gradient(135deg, #ffe15b, #f0b90b);
      box-shadow: 0 6px 16px rgba(255, 215, 0, 0.14);
    }

    .btn-gold:hover {
      transform: translateY(-1px);
    }

    .btn-outline {
      color: #ffffff;
      border: 1px solid rgba(255, 215, 0, 0.28);
      background: rgba(255,255,255,0.02);
    }

    .btn-outline:hover {
      color: var(--gold);
      background: rgba(255,255,255,0.04);
    }

    .video-wrap {
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      border-radius: 22px;
      overflow: hidden;
      margin-top: 16px;
      border: 1px solid rgba(255,215,0,0.12);
      background: rgba(0,0,0,0.35);
    }

    .video-wrap iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }

    .video-placeholder {
      margin-top: 16px;
      min-height: 260px;
      border-radius: 22px;
      border: 1px solid rgba(255,215,0,0.12);
      background:
        radial-gradient(circle at center, rgba(255,215,0,0.08), transparent 30%),
        rgba(255,255,255,0.02);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
    }

    .lesson-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .lesson-card h3,
    .card h3 {
      color: var(--gold);
      font-size: 1.25rem;
      margin-bottom: 10px;
      font-weight: 800;
    }

    .mini-list {
      list-style: none;
      display: grid;
      gap: 12px;
      margin-top: 14px;
    }

    .mini-list li {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255, 215, 0, 0.1);
      border-radius: 16px;
      padding: 14px 16px;
      font-size: 0.93rem;
      font-weight: 700;
      line-height: 1.5;
      color: #fff;
    }

    .nav-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .nav-card {
      display: block;
      text-decoration: none;
      color: #ffffff;
      border: 1px solid rgba(255,215,0,0.12);
      border-radius: 20px;
      padding: 18px;
      background: rgba(255,255,255,0.02);
      transition: 0.2s ease;
    }

    .nav-card:hover {
      color: var(--gold);
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,215,0,0.28);
    }

    .nav-card span {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: #cfcfcf;
      margin-bottom: 8px;
    }

    .nav-card strong {
      display: block;
      font-size: 1rem;
      line-height: 1.4;
    }

    .center-note {
      text-align: center;
      padding-top: 4px;
    }

    .center-note h2 {
      color: var(--gold);
      font-size: clamp(2rem, 3.4vw, 3.1rem);
      line-height: 1.05;
      margin-bottom: 12px;
      letter-spacing: -0.03em;
      font-weight: 900;
    }

    .center-note p {
      color: #ededed;
      line-height: 1.7;
      font-size: 1rem;
      max-width: 820px;
      margin: 0 auto;
      font-weight: 600;
    }

    @media (max-width: 1000px) {
      .layout,
      .lesson-grid,
      .nav-row {
        grid-template-columns: 1fr;
      }

      .page-shell {
        width: min(100% - 20px, 1320px);
        padding: 18px 14px 28px;
      }

      .card,
      .hero-card,
      .lesson-card {
        padding: 22px 18px 18px;
      }

      .logo {
        font-size: 1.6rem;
      }

      nav {
        gap: 14px;
      }

      nav a {
        font-size: 0.88rem;
      }

      .module-list {
        max-height: none;
        overflow: visible;
        padding-right: 0;
      }
    }
  </style>
</head>
<body>
  <div class="chart-bg">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="none">
      <path class="line-alt" d="M0,645 C130,620 190,565 320,548 C435,532 520,564 635,485 C760,398 825,435 935,342 C1045,248 1135,280 1255,198 C1360,126 1465,142 1600,128" />
      <path class="line-main" d="M0,730 C120,708 220,650 335,618 C455,585 545,534 670,448 C790,365 890,390 1008,298 C1110,220 1205,210 1325,154 C1430,105 1515,105 1600,88" />
      <line class="wick-gold" x1="112" y1="770" x2="112" y2="694"></line>
      <rect class="body-gold" x="101" y="722" width="22" height="34" rx="4"></rect>
      <line class="wick-white" x1="220" y1="688" x2="220" y2="615"></line>
      <rect class="body-white" x="209" y="640" width="22" height="31" rx="4"></rect>
      <line class="wick-gold" x1="332" y1="650" x2="332" y2="582"></line>
      <rect class="body-gold" x="321" y="604" width="22" height="30" rx="4"></rect>
      <line class="wick-white" x1="478" y1="585" x2="478" y2="515"></line>
      <rect class="body-white" x="467" y="536" width="22" height="33" rx="4"></rect>
      <line class="wick-gold" x1="622" y1="515" x2="622" y2="440"></line>
      <rect class="body-gold" x="611" y="460" width="22" height="36" rx="4"></rect>
      <line class="wick-white" x1="770" y1="432" x2="770" y2="360"></line>
      <rect class="body-white" x="759" y="382" width="22" height="32" rx="4"></rect>
      <line class="wick-gold" x1="915" y1="355" x2="915" y2="286"></line>
      <rect class="body-gold" x="904" y="304" width="22" height="35" rx="4"></rect>
      <line class="wick-white" x1="1060" y1="285" x2="1060" y2="222"></line>
      <rect class="body-white" x="1049" y="238" width="22" height="28" rx="4"></rect>
      <line class="wick-gold" x1="1212" y1="220" x2="1212" y2="160"></line>
      <rect class="body-gold" x="1201" y="174" width="22" height="30" rx="4"></rect>
      <line class="wick-white" x1="1390" y1="170" x2="1390" y2="108"></line>
      <rect class="body-white" x="1379" y="124" width="22" height="26" rx="4"></rect>
      <line class="wick-gold" x1="1496" y1="135" x2="1496" y2="84"></line>
      <rect class="body-gold" x="1485" y="95" width="22" height="24" rx="4"></rect>
    </svg>
  </div>

  <div class="page-shell">
    <div class="topbar">
      <div class="logo">BullProsperity</div>

      <nav>
        <a href="/index.html">Home</a>
        <a href="/hub.html">Hub</a>
        <a href="/course.html" class="active">Course</a>
        <a href="/tools.html">Tools</a>
        <a href="/api/whop/login">Login</a>
      </nav>
    </div>

    <div class="layout">
      <aside class="card">
        <div class="top-tag">Education Bereich</div>
        <h2 class="sidebar-title">Learning Modules</h2>
        <p class="sidebar-text">
          Alle Module, Lektionen und Inhalte an einem Ort. Arbeite dich Schritt für Schritt
          sauber und strukturiert durch deine Education Platform.
        </p>

        <div class="progress-wrap">
          <div class="progress-label">
            <span>Gesamtfortschritt</span>
            <span>${progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>

        <div class="module-list">
          ${renderSidebar(lesson)}
        </div>
      </aside>

      <main class="content-stack">
        <section class="hero-card">
          <div class="top-tag">Lesson ${lesson.number}</div>
          <h1>
            <span class="white">${lesson.titleWhite}</span><br>
            <span class="gold">${lesson.titleGold}</span>
          </h1>
          <p class="hero-text">
            ${lesson.description}
          </p>

          <div class="btn-row">
            <a href="/course.html" class="btn btn-outline">Zur Kursübersicht</a>
            ${
              lesson.number < 30
                ? `<a href="/lesson${lesson.number + 1}.html" class="btn btn-gold">Nächste Lesson</a>`
                : `<a href="/hub.html" class="btn btn-gold">Zurück zum Hub</a>`
            }
          </div>
        </section>

        <section class="card">
          <div class="top-tag">Lesson Video</div>
          <h3>Video</h3>
          <p>
            Hier befindet sich das Video für diese Lesson.
          </p>

          ${renderVideoBlock(lesson)}
        </section>

        <section class="lesson-grid">
          <div class="lesson-card">
            <div class="top-tag">In dieser Lesson</div>
            <h3>Was du hier lernst</h3>
            <ul class="mini-list">
              ${lesson.learnPoints.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>

          <div class="lesson-card">
            <div class="top-tag">Wichtiger Fokus</div>
            <h3>Dein Fokus in dieser Lesson</h3>
            <ul class="mini-list">
              ${lesson.focusPoints.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>
        </section>

        <section class="card">
          <div class="top-tag">Zusammenfassung</div>
          <h3>Worum es in dieser Lesson geht</h3>
          <p>
            ${lesson.summary}
          </p>
        </section>

        <section class="card">
          <div class="top-tag">Navigation</div>
          <h3>Weiter durch die Plattform</h3>
          ${renderNav(lesson)}
        </section>

        <section class="center-note">
          <h2>Strukturiert lernen. Klarer Fortschritt.</h2>
          <p>
            Genau so bleibt deine BullProsperity Education übersichtlich, professionell und leicht erweiterbar.
          </p>
        </section>
      </main>
    </div>
  </div>
</body>
</html>`;
}

const outputDir = process.cwd();

lessons.forEach((lesson) => {
  const filename = path.join(outputDir, `lesson${lesson.number}.html`);
  fs.writeFileSync(filename, buildHtml(lesson), "utf8");
});

console.log("Fertig: lesson1.html bis lesson30.html wurden erstellt.");
