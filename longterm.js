const FINNHUB_API_KEY = "d6u5tb9r01qp1k9bcsj0d6u5tb9r01qp1k9bcsjg";

const assetConfig = {
  SPY: {
    name: "SPY",
    description: "Breiter ETF auf den US-Markt und klassischer Longterm-Baustein.",
    tags: ["Core", "Longterm", "BullProsperity"],
    strategy: "Hold",
    type: "stock"
  },
  BTCUSDT: {
    name: "BTC",
    description: "Bitcoin als langfristiges Asset mit hoher Volatilität und starkem Makro-Fokus.",
    tags: ["Crypto", "Momentum", "Longterm"],
    strategy: "Scale In",
    type: "crypto"
  },
  AAPL: {
    name: "AAPL",
    description: "Qualitätsaktie mit starker Marke, Cashflow und langfristigem Wachstum.",
    tags: ["Aktie", "Qualität", "Large Cap"],
    strategy: "Accumulate",
    type: "stock"
  },
  MSFT: {
    name: "MSFT",
    description: "Technologie-Schwergewicht mit Cloud-Exposure und langfristiger Marktstärke.",
    tags: ["Tech", "Cloud", "Compounder"],
    strategy: "Hold",
    type: "stock"
  },
  QQQ: {
    name: "QQQ",
    description: "Wachstumsorientierter ETF mit starkem Fokus auf große Tech-Unternehmen.",
    tags: ["ETF", "Wachstum", "Nasdaq"],
    strategy: "Accumulate",
    type: "stock"
  }
};

let currentSymbol = "SPY";
let currentRangeMonths = 3;
let chartInstance = null;

const assetSymbolEl = document.getElementById("assetSymbol");
const assetDescriptionEl = document.getElementById("assetDescription");
const tagOneEl = document.getElementById("tagOne");
const tagTwoEl = document.getElementById("tagTwo");
const tagThreeEl = document.getElementById("tagThree");
const chartHeadlineEl = document.getElementById("chartHeadline");
const liveStatusEl = document.getElementById("liveStatus");
const statPriceEl = document.getElementById("statPrice");
const statChangeEl = document.getElementById("statChange");
const statTrendEl = document.getElementById("statTrend");
const statStrategyEl = document.getElementById("statStrategy");

function setAssetInfo(symbol) {
  const asset = assetConfig[symbol];
  assetSymbolEl.textContent = asset.name;
  assetDescriptionEl.textContent = asset.description;
  tagOneEl.textContent = asset.tags[0];
  tagTwoEl.textContent = asset.tags[1];
  tagThreeEl.textContent = asset.tags[2];
  chartHeadlineEl.textContent = `${asset.name} Performance`;
  statStrategyEl.textContent = asset.strategy;
}

function unixTimeMonthsAgo(months) {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - months);
  return {
    from: Math.floor(past.getTime() / 1000),
    to: Math.floor(now.getTime() / 1000)
  };
}

async function fetchStockCandles(symbol, months) {
  const { from, to } = unixTimeMonthsAgo(months);
  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Fehler beim Laden der Chartdaten.");
  return response.json();
}

async function fetchCryptoCandles(symbol, months) {
  const { from, to } = unixTimeMonthsAgo(months);
  const url = `https://finnhub.io/api/v1/crypto/candle?symbol=BINANCE:${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Fehler beim Laden der Kryptodaten.");
  return response.json();
}

async function fetchQuote(symbol, type) {
  if (type === "crypto") {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=BINANCE:${symbol}&token=${FINNHUB_API_KEY}`);
    if (!response.ok) throw new Error("Fehler beim Laden der Crypto-Quote.");
    return response.json();
  }

  const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
  if (!response.ok) throw new Error("Fehler beim Laden der Quote.");
  return response.json();
}

function formatPrice(value) {
  if (value >= 1000) {
    return `$${value.toLocaleString("de-DE", { maximumFractionDigits: 2 })}`;
  }
  return `$${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildLabels(timestamps) {
  return timestamps.map((timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit"
    });
  });
}

function renderChart(labels, prices) {
  const ctx = document.getElementById("longtermChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 420);
  gradient.addColorStop(0, "rgba(255, 213, 74, 0.35)");
  gradient.addColorStop(1, "rgba(255, 213, 74, 0.02)");

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: prices,
          borderColor: "#ffd54a",
          backgroundColor: gradient,
          fill: true,
          tension: 0.28,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
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

function updateStats(quote) {
  const current = quote.c;
  const previousClose = quote.pc;
  const changePercent = previousClose ? ((current - previousClose) / previousClose) * 100 : 0;

  statPriceEl.textContent = formatPrice(current);
  statChangeEl.textContent = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;
  statTrendEl.textContent = changePercent >= 0 ? "Bullish" : "Pullback";

  statChangeEl.classList.remove("positive", "negative");
  statTrendEl.classList.remove("positive", "negative");

  if (changePercent >= 0) {
    statChangeEl.classList.add("positive");
    statTrendEl.classList.add("positive");
  } else {
    statChangeEl.classList.add("negative");
    statTrendEl.classList.add("negative");
  }
}

async function loadAsset(symbol, months) {
  try {
    liveStatusEl.textContent = "Live-Daten werden geladen...";
    setAssetInfo(symbol);

    const asset = assetConfig[symbol];
    const candleData =
      asset.type === "crypto"
        ? await fetchCryptoCandles(symbol, months)
        : await fetchStockCandles(symbol, months);

    if (!candleData || candleData.s !== "ok" || !candleData.c || !candleData.t) {
      throw new Error("Keine Chartdaten gefunden.");
    }

    const quote = await fetchQuote(symbol, asset.type);

    const labels = buildLabels(candleData.t);
    const prices = candleData.c;

    renderChart(labels, prices);
    updateStats(quote);

    liveStatusEl.textContent = `Live-Daten aktiv • ${asset.name}`;
  } catch (error) {
    console.error(error);
    liveStatusEl.textContent = "Daten konnten nicht geladen werden.";
    statPriceEl.textContent = "--";
    statChangeEl.textContent = "--";
    statTrendEl.textContent = "--";
  }
}

document.querySelectorAll(".filter-pill").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-pill").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentSymbol = button.dataset.symbol;
    loadAsset(currentSymbol, currentRangeMonths);
  });
});

document.querySelectorAll(".time-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".time-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentRangeMonths = Number(button.dataset.range);
    loadAsset(currentSymbol, currentRangeMonths);
  });
});

loadAsset(currentSymbol, currentRangeMonths);
