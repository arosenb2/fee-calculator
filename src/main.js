import './styles/tailwind.css';

// Default fee configuration
const DEFAULT_PERCENTAGE_FEE = 2.9; // 2.9%
const DEFAULT_FIXED_FEE = 0.30; // $0.30

// Helper: Parse query parameters
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    percentageFee: parseFloat(params.get("percentageFee")) || DEFAULT_PERCENTAGE_FEE,
    fixedFee: parseFloat(params.get("fixedFee")) || DEFAULT_FIXED_FEE,
    targetAmount: parseFloat(params.get("targetAmount")) || "",
  };
}

// Helper: Update query parameters
function setQueryParams(params) {
  const url = new URL(window.location);
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
      url.searchParams.set(key, params[key]);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.replaceState({}, "", url);
}

// Helper: Get and set cookies
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}
function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// Calculate total amount including fees
function calculateTotal(target, percentageFee, fixedFee) {
  return Math.ceil((target + fixedFee) / (1 - percentageFee / 100) * 100) / 100;
}

// Update the live result
function updateResult(targetInput, percentageInput, fixedInput, resultDiv, breakdownDiv) {
  const targetAmount = parseFloat(targetInput.value) || 0;
  const percentageFee = parseFloat(percentageInput.value) || DEFAULT_PERCENTAGE_FEE;
  const fixedFee = parseFloat(fixedInput.value) || DEFAULT_FIXED_FEE;

  // Update query parameters
  setQueryParams({
    targetAmount,
    percentageFee,
    fixedFee,
  });

  // Calculate values if targetAmount > 0
  if (targetAmount > 0) {
    const adjustedAmount = calculateTotal(targetAmount, percentageFee, fixedFee);
    const totalFee = adjustedAmount - targetAmount;
    const totalFeePercentage = ((adjustedAmount / targetAmount) - 1) * 100;

    resultDiv.textContent = `Amount to Charge Customer: $${adjustedAmount.toFixed(2)}`;

    breakdownDiv.innerHTML = `
      <div class="text-gray-700 dark:text-gray-300">
        <p><strong>Target Amount:</strong> $${targetAmount.toFixed(2)}</p>
        <p><strong>Total Fee:</strong> $${totalFee.toFixed(2)}</p>
        <p><strong>Fee Percentage:</strong> ${totalFeePercentage.toFixed(2)}%</p>
      </div>
    `;
  } else {
    resultDiv.textContent = ""; // Clear result if no target amount
    breakdownDiv.innerHTML = "";
  }
}

// Initialize theme
function initializeTheme() {
  const savedTheme = getCookie("theme") || "system";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const themeToggle = document.getElementById("themeToggle");
  const sunIcon = document.getElementById("sunIcon");
  const moonIcon = document.getElementById("moonIcon");
  const systemIcon = document.getElementById("systemIcon");

  const updateIcons = (currentTheme) => {
    sunIcon.classList.add("hidden");
    moonIcon.classList.add("hidden");
    systemIcon.classList.add("hidden");

    // Show icon for the next theme in the cycle
    switch(currentTheme) {
      case "light":
        // If we're in light mode, show dark mode icon
        sunIcon.classList.remove("hidden");
        break;
      case "dark":
        // If we're in dark mode, show system icon
        systemIcon.classList.remove("hidden");
        break;
      case "system":
        // If we're in system mode, show light mode icon
        moonIcon.classList.remove("hidden");
        break;
    }
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = prefersDark ? "dark" : "light";
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    }

    setCookie("theme", theme);
    updateIcons(theme);
  };

  applyTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme = getCookie("theme") || "system";
    const themes = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    applyTheme(nextTheme);
  });

  window.matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (getCookie("theme") === "system") {
        applyTheme("system");
      }
    });
}

// Initialize form and settings
function initializeForm() {
  const params = getQueryParams();

  const targetInput = document.getElementById("targetAmount");
  const percentageInput = document.getElementById("percentageFee");
  const fixedInput = document.getElementById("fixedFee");
  const resultDiv = document.getElementById("result");
  const breakdownDiv = document.getElementById("breakdown");

  // Set inputs from query params
  targetInput.value = params.targetAmount || "";
  percentageInput.value = params.percentageFee;
  fixedInput.value = params.fixedFee;

  // Add live preview update listeners
  [targetInput, percentageInput, fixedInput].forEach((input) => {
    input.addEventListener("input", () =>
      updateResult(targetInput, percentageInput, fixedInput, resultDiv, breakdownDiv)
    );
  });

  // Initial calculation if target amount is already present
  updateResult(targetInput, percentageInput, fixedInput, resultDiv, breakdownDiv);

  // Initialize theme
  initializeTheme();
}

initializeForm();