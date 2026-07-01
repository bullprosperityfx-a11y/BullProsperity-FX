const assetData = {
  SPY: {
    symbol: "SPY",
    description: "Breiter ETF auf den US-Markt und klassischer Longterm-Baustein.",
    tags: ["Core", "ETF", "Longterm"],
    chartTitle: "SPY Performance",
    price: "613,42 €",
    change: "-1,00 %",
    changeClass: "negative",
    trend: "Bullish",
    strategy: "Hold",
    thesis: "Solides Longterm-Asset mit breiter Marktbasis, hoher Relevanz und starker Eignung als langfristiger Kernbaustein.",
    bias: [
      "Makrostruktur bleibt konstruktiv.",
      "Pullbacks eher beobachten als jagen.",
      "Kein FOMO-Einstieg in überdehnte Stärke."
    ],
    entryZone: "580 – 600",
    holdZone: "600 – 640",
    riskZone: "unter 560",
    conviction: "8.8 / 10",
    catalysts: [
      "Breite Diversifikation im US-Markt.",
      "Stabiler Kernbaustein für Longterm-Portfolios.",
      "Historisch robust in langfristigen Aufwärtszyklen."
    ],
    risks: [
      "Allgemeine Marktkorrekturen treffen auch Kern-ETFs.",
      "Überhitzung im Gesamtmarkt kann Druck bringen.",
      "Zu späte Entries verschlechtern den Durchschnitt."
    ],
    notes: "SPY eignet sich gut als Core-Holding. Pullbacks sind oft interessanter als impulsive Breakout-Käufe.",
    prices: {
      "3M": [588, 592, 596, 600, 598, 603, 608, 611, 609, 613],
      "6M": [560, 566, 571, 580, 585, 590, 598, 603, 609, 613],
      "1Y": [512, 525, 538, 548, 560, 572, 583, 592, 600, 613],
      "2Y": [430, 452, 471, 490, 515, 540, 560, 585, 600, 613]
    }
  },
  AAPL: {
    symbol: "AAPL",
    description: "Qualitätsaktie mit starker Marke, Cashflow und langfristigem Wachstum.",
    tags: ["Aktie", "Qualität", "Large Cap"],
    chartTitle: "AAPL Performance",
    price: "214,15 €",
    change: "+0,64 %",
    changeClass: "positive",
    trend: "Bullish",
    strategy: "Accumulate",
    thesis: "Apple bleibt ein Qualitätswert mit starker Kundenbindung, hoher Profitabilität und langfristiger Relevanz im Konsumenten- und Tech-Sektor.",
    bias: [
      "Qualität vor Tempo.",
      "Pullbacks wirken oft gesünder als Hype-Phasen.",
      "Langfristig eher akkumulieren statt jagen."
    ],
    entryZone: "198 – 206",
    holdZone: "206 – 225",
    riskZone: "unter 190",
    conviction: "8.5 / 10",
    catalysts: [
      "Starke Marke und loyales Ökosystem.",
      "Hohe Margen und Cashflow-Stärke.",
      "Neue Produkt- und Servicezyklen."
    ],
    risks: [
      "Hohe Bewertung kann Druck erzeugen.",
      "Schwächeres Konsumumfeld möglich.",
      "Abhängigkeit von Produktzyklen."
    ],
    notes: "AAPL eher über Geduld spielen. Keine FOMO in parabolischen Phasen.",
    prices: {
      "3M": [198, 201, 203, 205, 207, 209, 211, 212, 213, 214],
      "6M": [186, 189, 193, 197, 201, 204, 208, 211, 213, 214],
      "1Y": [168, 174, 180, 186, 192, 198, 203, 208, 211, 214],
      "2Y": [145, 152, 160, 171, 182, 191, 199, 206, 211, 214]
    }
  },
  DAX: {
    symbol: "DAX",
    description: "Der deutsche Leitindex als wichtiger Überblick über große deutsche Qualitäts- und Industrieunternehmen.",
    tags: ["Deutschland", "Index", "Makro"],
    chartTitle: "DAX Performance",
    price: "18.942,00",
    change: "-0,41 %",
    changeClass: "negative",
    trend: "Neutral Bullish",
    strategy: "Watch Pullbacks",
    thesis: "Der DAX ist relevant für die deutsche und europäische Großwetterlage und bleibt ein wichtiger Makro- und Sentiment-Indikator.",
    bias: [
      "Stärker makrogetrieben als viele Einzeltitel.",
      "Timing bei Pullbacks ist entscheidend.",
      "Eher Beobachtungs- als Chase-Markt."
    ],
    entryZone: "18.100 – 18.500",
    holdZone: "18.500 – 19.300",
    riskZone: "unter 17.850",
    conviction: "7.4 / 10",
    catalysts: [
      "Industrie- und Exporterholung möglich.",
      "Zinsentspannung könnte unterstützen.",
      "Relevanter Leitindex für Europa."
    ],
    risks: [
      "Konjunkturschwäche in Europa.",
      "Geopolitischer Druck.",
      "Starke Makroabhängigkeit."
    ],
    notes: "DAX eher strukturell lesen. Nicht jede Bewegung ist ein sauberer Longterm-Trigger.",
    prices: {
      "3M": [18510, 18620, 18730, 18820, 18790, 18860, 18910, 18980, 18930, 18942],
      "6M": [17960, 18120, 18280, 18450, 18620, 18710, 18800, 18890, 18920, 18942],
      "1Y": [17020, 17280, 17510, 17740, 18080, 18320, 18510, 18720, 18850, 18942],
      "2Y": [15800, 16220, 16700, 17150, 17620, 18010, 18360, 18640, 18810, 18942]
    }
  },
  NDX: {
    symbol: "NDX",
    description: "Technologielastiger US-Index mit Fokus auf große Wachstumsunternehmen.",
    tags: ["Index", "Tech", "Growth"],
    chartTitle: "NASDAQ 100 Performance",
    price: "18.104,00",
    change: "+0,48 %",
    changeClass: "positive",
    trend: "Bullish",
    strategy: "Hold / Add on Pullbacks",
    thesis: "Der NASDAQ 100 ist einer der stärksten Indizes für Wachstum, KI, Software und US-Tech-Leadership.",
    bias: [
      "Stark trendgetrieben.",
      "Am besten Pullbacks nutzen.",
      "Überdehnte Hype-Bewegungen meiden."
    ],
    entryZone: "17.300 – 17.700",
    holdZone: "17.700 – 18.600",
    riskZone: "unter 17.000",
    conviction: "8.7 / 10",
    catalysts: [
      "AI- und Cloud-Dominanz.",
      "Starke Marktführer im Index.",
      "Wachstumsstory bleibt intakt."
    ],
    risks: [
      "Bewertungsrisiko.",
      "Tech-Korrekturen können scharf sein.",
      "Hohe Sensitivität auf Zinsen."
    ],
    notes: "NDX nur ungern jagen. Gute Zonen wirken oft nach Rücksetzern.",
    prices: {
      "3M": [17300, 17440, 17510, 17640, 17720, 17810, 17920, 18000, 18040, 18104],
      "6M": [16600, 16780, 17020, 17210, 17400, 17620, 17790, 17910, 18000, 18104],
      "1Y": [15400, 15820, 16210, 16640, 17010, 17320, 17640, 17850, 17960, 18104],
      "2Y": [13200, 14050, 14900, 15720, 16450, 17010, 17420, 17780, 17990, 18104]
    }
  },
  GOLD: {
    symbol: "GOLD",
    description: "Gold als klassischer Rohstoff und Safe-Haven-Baustein für Krisen, Inflation und Diversifikation.",
    tags: ["Rohstoff", "Safe Haven", "Makro"],
    chartTitle: "Gold Performance",
    price: "2.184,00 $",
    change: "+0,35 %",
    changeClass: "positive",
    trend: "Bullish",
    strategy: "Accumulate on Dips",
    thesis: "Gold bleibt ein relevanter Makro- und Diversifikationsbaustein, besonders bei Unsicherheit, Inflation oder Währungsstress.",
    bias: [
      "Makro und Zinsen im Blick behalten.",
      "Eher ruhiger Longterm-Baustein.",
      "Gut als Gegengewicht im Portfolio."
    ],
    entryZone: "2.120 – 2.160",
    holdZone: "2.160 – 2.240",
    riskZone: "unter 2.080",
    conviction: "8.1 / 10",
    catalysts: [
      "Inflations- und Unsicherheitsphasen.",
      "Diversifikationsvorteil.",
      "Safe-Haven-Nachfrage."
    ],
    risks: [
      "Starker Dollar kann drücken.",
      "Zinsanstiege wirken oft belastend.",
      "Manchmal längere Seitwärtsphasen."
    ],
    notes: "Gold eher als strategischen Portfoliobaustein sehen, nicht als hektischen Momentum-Trade.",
    prices: {
      "3M": [2120, 2132, 2140, 2154, 2162, 2170, 2166, 2178, 2180, 2184],
      "6M": [2050, 2070, 2090, 2110, 2122, 2140, 2155, 2165, 2176, 2184],
      "1Y": [1940, 1972, 2001, 2030, 2060, 2095, 2120, 2148, 2168, 2184],
      "2Y": [1810, 1860, 1910, 1970, 2030, 2080, 2120, 2150, 2170, 2184]
    }
  },
  BTC: {
    symbol: "BTC",
    description: "Bitcoin als langfristiges Makro-Asset mit hoher Volatilität und starkem Momentum-Charakter.",
    tags: ["Crypto", "Momentum", "High Beta"],
    chartTitle: "Bitcoin Performance",
    price: "76.200,00 $",
    change: "+1,12 %",
    changeClass: "positive",
    trend: "Bullish",
    strategy: "Scale In",
    thesis: "Bitcoin bleibt ein hochvolatiles, aber zunehmend institutionell beachtetes Asset mit starkem Makro- und Momentum-Profil.",
    bias: [
      "Volatilität akzeptieren.",
      "Staffelkäufe sinnvoller als Chase.",
      "Longterm nur mit klarem Risikobewusstsein."
    ],
    entryZone: "68.000 – 72.000",
    holdZone: "72.000 – 80.000",
    riskZone: "unter 64.000",
    conviction: "8.0 / 10",
    catalysts: [
      "Institutionelles Interesse.",
      "Makro- und Liquiditätszyklen.",
      "Starke Momentum-Phasen möglich."
    ],
    risks: [
      "Hohe Volatilität.",
      "Regulatorische Unsicherheit.",
      "Scharfe Korrekturen jederzeit möglich."
    ],
    notes: "BTC nur sauber staffeln. Kein Blindkauf in Extremschüben.",
    prices: {
      "3M": [68200, 69500, 70400, 71800, 72200, 73400, 74000, 75200, 76000, 76200],
      "6M": [59200, 61800, 64000, 66200, 68900, 71200, 73000, 74400, 75400, 76200],
      "1Y": [41200, 46000, 52000, 58000, 62000, 66400, 70200, 73000, 74800, 76200],
      "2Y": [21000, 28500, 36000, 45000, 54000, 62000, 68000, 72400, 74800, 76200]
    }
  }
};

let currentAsset = "SPY";
let currentRange = "3M";
let chart;

const assetSymbolEl = document.getElementById("assetSymbol");
const assetDescriptionEl = document.getElementById("assetDescription");
const tagOneEl = document.getElementById("tagOne");
const tagTwoEl = document.getElementById("tagTwo");
const tagThreeEl = document.getElementById("tagThree");
const chartTitleEl = document.getElementById("chartTitle");
const statPriceEl = document.getElementById("statPrice");
const statChangeEl = document.getElementById("statChange");
const statTrendEl = document.getElementById("statTrend");
const statStrategyEl = document.getElementById("statStrategy");
const thesisTextEl = document.getElementById("thesisText");
const entryZoneEl = document.getElementById("entryZone");
const holdZoneEl = document.getElementById("holdZone");
const riskZoneEl = document.getElementById("riskZone");
const convictionEl = document.getElementById("convictionScore");
const notesTextEl = document.getElementById("notesText");

const biasListEl = document.getElementById("biasList");
const catalystListEl = document.getElementById("catalystList");
const riskListEl = document.getElementById("riskList");

function setList(container, items) {
  container.innerHTML = items.map(item => `<div class="bullet-item">${item}</div>`).join("");
}

function getLabels(range) {
  if (range === "3M") return ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "Now"];
  if (range === "6M") return ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "Now"];
  if (range === "1Y") return ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Now"];
  return ["Q1", "Q2", "Q3", "Q4", "Y2", "Y2", "Y2", "Y2", "Y2", "Now"];
}

function renderChart(prices, labels) {
  const ctx = document.getElementById("longtermChart").getContext("2d");

  if (chart) {
    chart.destroy();
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 420);
  gradient.addColorStop(0, "rgba(255, 213, 74, 0.36)");
  gradient.addColorStop(1, "rgba(255, 213, 74, 0.02)");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: prices,
        borderColor: "#ffd54a",
        backgroundColor: gradient,
        fill: true,
        tension: 0.32,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#111111",
          borderColor: "#ffd54a",
          borderWidth: 1,
          titleColor: "#ffd54a",
          bodyColor: "#ffffff",
          displayColors: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: "rgba(255,255,255,0.68)",
            maxTicksLimit: 8
          },
          grid: {
            color: "rgba(255,255,255,0.05)"
          },
          border: {
            color: "rgba(255,255,255,0.08)"
          }
        },
        y: {
          ticks: {
            color: "rgba(255,255,255,0.68)"
          },
          grid: {
            color: "rgba(255,255,255,0.05)"
          },
          border: {
            color: "rgba(255,255,255,0.08)"
          }
        }
      }
    }
  });
}

function updateAsset(assetKey) {
  const asset = assetData[assetKey];
  if (!asset) return;

  assetSymbolEl.textContent = asset.symbol;
  assetDescriptionEl.textContent = asset.description;
  tagOneEl.textContent = asset.tags[0];
  tagTwoEl.textContent = asset.tags[1];
  tagThreeEl.textContent = asset.tags[2];
  chartTitleEl.textContent = asset.chartTitle;

  statPriceEl.textContent = asset.price;
  statChangeEl.textContent = asset.change;
  statChangeEl.className = asset.changeClass;
  statTrendEl.textContent = asset.trend;
  statStrategyEl.textContent = asset.strategy;

  thesisTextEl.textContent = asset.thesis;
  entryZoneEl.textContent = asset.entryZone;
  holdZoneEl.textContent = asset.holdZone;
  riskZoneEl.textContent = asset.riskZone;
  convictionEl.textContent = asset.conviction;
  notesTextEl.textContent = asset.notes;

  setList(biasListEl, asset.bias);
  setList(catalystListEl, asset.catalysts);
  setList(riskListEl, asset.risks);

  renderChart(asset.prices[currentRange], getLabels(currentRange));
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentAsset = btn.dataset.asset;
    updateAsset(currentAsset);
  });
});

document.querySelectorAll(".time-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentRange = btn.dataset.range;
    updateAsset(currentAsset);
  });
});

updateAsset(currentAsset);
