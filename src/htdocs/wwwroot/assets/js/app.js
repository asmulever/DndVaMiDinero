const DEFAULT_CURRENCY = "USD";
const GEO_API_URL_HTTP = "http://ip-api.com/json/?fields=status,countryCode";
const GEO_API_URL_HTTPS = "https://ip-api.com/json/?fields=status,countryCode";
const GEO_API_URL_FALLBACK = "https://ipapi.co/json/";
const CTA_URL = "#";
const CTA_TEXT = "Ver recursos recomendados";
const ENABLE_ANALYTICS = false;
const STORAGE_KEY = "dndvm_budget_v1";

const TH_HOUSING = 0.35;
const TH_DEBT = 0.3;
const TH_FOOD = 0.25;
const TH_UTILITIES = 0.15;

const CATEGORY_CONFIG = [
  { id: "housing", label: "Vivienda", threshold: TH_HOUSING, alert: "Vivienda alta" },
  { id: "utilities", label: "Servicios", threshold: TH_UTILITIES, alert: "Servicios altos" },
  { id: "food", label: "Comida", threshold: TH_FOOD, alert: "Comida alta" },
  { id: "transport", label: "Transporte" },
  { id: "debt", label: "Deudas", threshold: TH_DEBT, alert: "Deuda alta" },
  { id: "health", label: "Salud" },
  { id: "education", label: "Educacion" },
  { id: "leisure", label: "Ocio" },
  { id: "other", label: "Otros" },
];

const CURRENCY_SYMBOLS = {
  ARS: "$",
  MXN: "$",
  COP: "$",
  CLP: "$",
  PEN: "S/",
  UYU: "$",
  USD: "$",
};

const COUNTRY_CURRENCY = {
  AR: "ARS",
  MX: "MXN",
  CO: "COP",
  CL: "CLP",
  PE: "PEN",
  UY: "UYU",
  US: "USD",
};

const demoValues = {
  income: 1200,
  "other-income": 0,
  housing: 350,
  utilities: 120,
  food: 260,
  transport: 90,
  debt: 180,
  health: 60,
  education: 40,
  leisure: 70,
  other: 30,
};

const form = document.getElementById("budget-form");
const currencySelect = document.getElementById("currency");
const incomeInput = document.getElementById("income");
const decimalsToggle = document.getElementById("show-decimals");
const totalExpensesEl = document.getElementById("total-expenses");
const balanceEl = document.getElementById("balance");
const savingsEl = document.getElementById("savings");
const barsList = document.getElementById("bars-list");
const statusBadge = document.getElementById("status-badge");
const diagnosisMessage = document.getElementById("diagnosis-message");
const alertsList = document.getElementById("alerts-list");
const recommendationsList = document.getElementById("recommendations-list");
const resetBtn = document.getElementById("reset-btn");
const demoBtn = document.getElementById("demo-btn");
const ctaButton = document.getElementById("cta-button");
const accordion = document.getElementById("form-accordion");
const tipsForm = document.getElementById("tips-form");
const tipsFeedback = document.getElementById("tips-form-feedback");

const inputIds = ["income", "other-income", ...CATEGORY_CONFIG.map((item) => item.id)];
const inputs = inputIds.map((id) => document.getElementById(id)).filter(Boolean);

let currentCurrency = DEFAULT_CURRENCY;
let currentDecimals = 0;

function trackEvent(name, payload) {
  if (!ENABLE_ANALYTICS) return;
  void name;
  void payload;
}

function getDecimals() {
  return currentDecimals;
}

function parseNumber(value) {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return 0;
  return Number.parseFloat(cleaned);
}

function formatNumber(value, decimals) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeValue);
}

function formatCurrency(value) {
  const symbol = CURRENCY_SYMBOLS[currentCurrency] || "$";
  return `${symbol} ${formatNumber(value, currentDecimals)}`;
}

function setInputValue(input, value) {
  input.value = formatNumber(value, getDecimals());
}

function resetForm() {
  inputs.forEach((input) => {
    input.value = "";
  });
}

function loadDemo() {
  Object.entries(demoValues).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) {
      setInputValue(input, value);
    }
  });
}

function buildBars(data, income) {
  if (!barsList) return;
  barsList.innerHTML = "";
  data.forEach((item) => {
    const percent = income > 0 ? (item.value / income) * 100 : 0;
    const barItem = document.createElement("div");
    barItem.className = "bar-item";

    const label = document.createElement("span");
    label.textContent = item.label;

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${Math.min(percent, 100).toFixed(1)}%`;

    track.appendChild(fill);

    const value = document.createElement("span");
    value.textContent = income > 0 ? `${percent.toFixed(1)}%` : "-";

    barItem.appendChild(label);
    barItem.appendChild(track);
    barItem.appendChild(value);
    barsList.appendChild(barItem);
  });
}

function setBadge(status) {
  if (!statusBadge) return;
  statusBadge.className = "badge";
  if (status === "Sano") statusBadge.classList.add("sano");
  if (status === "Ajustado") statusBadge.classList.add("ajustado");
  if (status === "Critico") statusBadge.classList.add("critico");
  statusBadge.textContent = status;
}

function buildRecommendations(alerts) {
  const suggestions = [];
  alerts.forEach((alert) => {
    if (alert.includes("Vivienda")) {
      suggestions.push("Negocia condiciones o revisa gastos fijos de vivienda.");
    }
    if (alert.includes("Deuda")) {
      suggestions.push("Prioriza un plan de pagos y evita nuevas cuotas.");
    }
    if (alert.includes("Comida")) {
      suggestions.push("Define un tope semanal para comidas y supermercados.");
    }
    if (alert.includes("Servicios")) {
      suggestions.push("Revisa servicios recurrentes y planes activos.");
    }
  });

  if (suggestions.length === 0) {
    suggestions.push("Mantene el control y revisa tus categorias cada mes.");
    suggestions.push("Reserva un margen para imprevistos sin compromisos.");
  }

  return suggestions.slice(0, 4);
}

function buildDataFromForm() {
  const primaryIncome = incomeInput ? parseNumber(incomeInput.value) : 0;
  const otherIncomeInput = document.getElementById("other-income");
  const otherIncome = otherIncomeInput ? parseNumber(otherIncomeInput.value) : 0;
  const income = primaryIncome + otherIncome;
  const categories = CATEGORY_CONFIG.map((item) => ({
    ...item,
    value: parseNumber(document.getElementById(item.id)?.value || ""),
  }));
  return {
    currency: currentCurrency,
    decimals: currentDecimals,
    primaryIncome,
    otherIncome,
    income,
    categories,
  };
}

function setEmptyState(message) {
  if (!totalExpensesEl || !balanceEl || !savingsEl) return;
  totalExpensesEl.textContent = "-";
  balanceEl.textContent = "-";
  savingsEl.textContent = "-";
  if (alertsList) alertsList.innerHTML = "";
  if (recommendationsList) recommendationsList.innerHTML = "";
  if (diagnosisMessage) diagnosisMessage.textContent = message;
  setBadge("Sin datos");
}

function renderResults(data) {
  if (!totalExpensesEl || !balanceEl || !savingsEl) return;
  const income = data.income;
  const categories = data.categories;

  const totalExpenses = categories.reduce((acc, item) => acc + item.value, 0);
  const balance = income - totalExpenses;
  const savings = balance > 0 ? balance : 0;

  totalExpensesEl.textContent = formatCurrency(totalExpenses);
  balanceEl.textContent = formatCurrency(balance);
  savingsEl.textContent = formatCurrency(savings);

  buildBars(categories, income);

  if (!alertsList || !recommendationsList || !diagnosisMessage) return;
  alertsList.innerHTML = "";
  recommendationsList.innerHTML = "";

  if (income <= 0) {
    setBadge("Sin datos");
    diagnosisMessage.textContent =
      "Ingresos 0: no se puede diagnosticar.";
    const li = document.createElement("li");
    li.textContent = "Agrega ingresos para calcular porcentajes.";
    alertsList.appendChild(li);
    const rec = document.createElement("li");
    rec.textContent = "Completa ingresos para ver recomendaciones.";
    recommendationsList.appendChild(rec);
    return;
  }

  const ratio = income > 0 ? balance / income : 0;
  let status = "Sano";
  if (balance < 0) status = "Critico";
  if (ratio >= 0 && ratio < 0.1) status = "Ajustado";
  setBadge(status);

  diagnosisMessage.textContent =
    "Las alertas se basan en porcentajes sobre tus ingresos.";

  const alerts = [];
  categories.forEach((item) => {
    if (item.threshold && income > 0) {
      const percent = item.value / income;
      if (percent > item.threshold) {
        alerts.push(item.alert);
      }
    }
  });

  const limitedAlerts = alerts.slice(0, 5);
  if (limitedAlerts.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay alertas destacadas.";
    alertsList.appendChild(li);
  } else {
    limitedAlerts.forEach((alert) => {
      const li = document.createElement("li");
      li.textContent = alert;
      alertsList.appendChild(li);
    });
  }

  const recommendations = buildRecommendations(limitedAlerts);
  recommendations.forEach((rec) => {
    const li = document.createElement("li");
    li.textContent = rec;
    recommendationsList.appendChild(li);
  });
}

function persistData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    void error;
  }
}

function readStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function applyStoredDataToForm(data) {
  if (!incomeInput) return;
  currentCurrency = data.currency || DEFAULT_CURRENCY;
  currentDecimals = data.decimals || 0;
  if (currencySelect) currencySelect.value = currentCurrency;
  if (decimalsToggle) decimalsToggle.checked = currentDecimals === 2;

  inputs.forEach((input) => {
    const value = input.id === "income"
      ? data.primaryIncome ?? (data.income - (data.otherIncome || 0))
      : input.id === "other-income"
        ? data.otherIncome ?? ""
        : data.categories?.find((item) => item.id === input.id)?.value ?? "";
    if (value === "") {
      input.value = "";
      return;
    }
    input.value = formatNumber(value, currentDecimals);
  });
}

function updateResults() {
  if (!incomeInput) return;
  currentCurrency = currencySelect ? currencySelect.value : DEFAULT_CURRENCY;
  currentDecimals = decimalsToggle && decimalsToggle.checked ? 2 : 0;
  const data = buildDataFromForm();
  persistData({
    currency: data.currency,
    decimals: data.decimals,
    primaryIncome: data.primaryIncome,
    otherIncome: data.otherIncome,
    income: data.income,
    categories: data.categories,
  });
  renderResults(data);
}

function handleBlur(event) {
  const value = parseNumber(event.target.value);
  if (value === 0) {
    event.target.value = "";
    return;
  }
  event.target.value = formatNumber(value, getDecimals());
}

function formatAllInputs() {
  inputs.forEach((input) => {
    if (input.value.trim() === "") return;
    const value = parseNumber(input.value);
    input.value = formatNumber(value, getDecimals());
  });
}

function initAccordion() {
  if (!accordion) return;
  const items = Array.from(accordion.querySelectorAll(".accordion-item"));
  if (items.length === 0) return;

  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
      const summaryText = item.querySelector("summary")?.textContent?.trim();
      const focusMap = {
        Ingresos: "income",
        "Gastos fijos": "housing",
        "Gastos variables": "food",
      };
      const targetId = summaryText ? focusMap[summaryText] : null;
      if (targetId) {
        document.getElementById(targetId)?.focus();
      }
    });
  });
}

async function fetchGeoCurrency(url, parser) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    const countryCode = parser(data);
    if (!countryCode) return null;
    return COUNTRY_CURRENCY[countryCode] || "USD";
  } catch (error) {
    void error;
    return null;
  }
}

async function detectCurrencyByIP() {
  const providers = [
    {
      url: window.location.protocol === "https:" ? GEO_API_URL_HTTPS : GEO_API_URL_HTTP,
      parser: (data) => (data.status === "success" ? data.countryCode : null),
    },
    {
      url: GEO_API_URL_FALLBACK,
      parser: (data) => data.country_code || null,
    },
  ];

  for (const provider of providers) {
    const currency = await fetchGeoCurrency(provider.url, provider.parser);
    if (currency) return currency;
  }
  return DEFAULT_CURRENCY;
}

const params = new URLSearchParams(window.location.search);
if (params.get("reset") === "1") {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    void error;
  }
}

if (form) {
  initAccordion();
  inputs.forEach((input) => {
    input.addEventListener("input", updateResults);
    input.addEventListener("blur", handleBlur);
  });

  document.getElementById("income")?.focus();

  if (currencySelect) {
    currencySelect.addEventListener("change", updateResults);
    currencySelect.value = DEFAULT_CURRENCY;
  }

  if (decimalsToggle) {
    decimalsToggle.addEventListener("change", () => {
      currentDecimals = decimalsToggle.checked ? 2 : 0;
      formatAllInputs();
      updateResults();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetForm();
      persistData({
        currency: currentCurrency,
        decimals: currentDecimals,
        primaryIncome: 0,
        otherIncome: 0,
        income: 0,
        categories: CATEGORY_CONFIG.map((item) => ({ ...item, value: 0 })),
      });
      updateResults();
    });
  }

  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      loadDemo();
      formatAllInputs();
      updateResults();
    });
  }

  const stored = readStoredData();
  if (stored) {
    applyStoredDataToForm(stored);
  }
  updateResults();

  if (!stored) {
    detectCurrencyByIP().then((currency) => {
      currentCurrency = currency;
      if (currencySelect) {
        currencySelect.value = currency;
      }
      updateResults();
    });
  }
} else {
  const stored = readStoredData();
  if (stored) {
    currentCurrency = stored.currency || DEFAULT_CURRENCY;
    currentDecimals = stored.decimals || 0;
    renderResults({
      currency: currentCurrency,
      decimals: currentDecimals,
      primaryIncome: stored.primaryIncome || (stored.income || 0) - (stored.otherIncome || 0),
      otherIncome: stored.otherIncome || 0,
      income: stored.income || 0,
      categories: stored.categories || CATEGORY_CONFIG.map((item) => ({ ...item, value: 0 })),
    });
  } else {
    setEmptyState("Carga valores en la pagina principal para ver el resumen.");
  }
}

if (ctaButton) {
  ctaButton.textContent = CTA_TEXT;
  ctaButton.href = CTA_URL;
  ctaButton.addEventListener("click", () => {
    trackEvent("cta_click", { url: CTA_URL });
  });
}

if (tipsForm) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  tipsForm.addEventListener("submit", (event) => {
    const firstName = document.getElementById("first-name");
    const lastName = document.getElementById("last-name");
    const email = document.getElementById("email");
    const errors = [];

    if (!firstName || firstName.value.trim() === "") {
      errors.push("Ingresá tu nombre.");
    }
    if (!lastName || lastName.value.trim() === "") {
      errors.push("Ingresá tu apellido.");
    }
    if (!email || email.value.trim() === "") {
      errors.push("Ingresá tu email.");
    } else if (!emailPattern.test(email.value.trim())) {
      errors.push("El email no tiene un formato valido.");
    }

    if (errors.length > 0) {
      event.preventDefault();
      if (tipsFeedback) {
        tipsFeedback.textContent = errors[0];
        tipsFeedback.classList.add("feedback-error");
      }
      return;
    }

    if (tipsFeedback) {
      tipsFeedback.textContent = "";
      tipsFeedback.classList.remove("feedback-error");
    }
  });
}
