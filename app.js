// Theme Toggle Logic
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = themeToggleBtn.querySelector('i');

// Init theme from localStorage or system preference
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  if (theme === 'light') {
    themeIcon.className = 'fa-solid fa-sun';
  } else {
    themeIcon.className = 'fa-solid fa-moon';
  }
}

// Map Inputs & Sliders
const inputsMap = [
  { id: 'workBudget', sliderId: 'workBudgetSlider' },
  { id: 'allowanceTax', sliderId: 'allowanceTaxSlider' },
  { id: 'loanPayment', sliderId: 'loanPaymentSlider' },
  { id: 'annualMileage', sliderId: 'annualMileageSlider' },
  { id: 'fuelConsumption', sliderId: 'fuelConsumptionSlider' },
  { id: 'fuelPrice', sliderId: 'fuelPriceSlider' },
  { id: 'operatingTax', sliderId: 'operatingTaxSlider' },
  { id: 'maintenance', sliderId: 'maintenanceSlider' },
  { id: 'depreciation', sliderId: 'depreciationSlider' },
  { id: 'companyCarCost', sliderId: 'companyCarCostSlider' }
];

// Elements
const tcoSwitch = document.getElementById('tcoSwitch');
const carPaidOff = document.getElementById('carPaidOff');
const loanPaymentRow = document.getElementById('loanPaymentRow');
const loanPaymentSlider = document.getElementById('loanPaymentSlider');
const depreciationRow = document.getElementById('depreciationRow');
const depreciationSlider = document.getElementById('depreciationSlider');
const insuranceCostInput = document.getElementById('insuranceCost');
const insurancePeriodButtons = document.querySelectorAll('#insurancePeriodGroup .btn-toggle');

let insurancePeriod = 'monthly'; // default

// Setup Event Listeners for linked Sliders and Number Inputs
inputsMap.forEach(({ id, sliderId }) => {
  const inputEl = document.getElementById(id);
  const sliderEl = document.getElementById(sliderId);

  if (inputEl && sliderEl) {
    // Sync slider to input
    inputEl.addEventListener('input', () => {
      sliderEl.value = inputEl.value;
      calculate();
    });

    // Sync input to slider
    sliderEl.addEventListener('input', () => {
      inputEl.value = sliderEl.value;
      calculate();
    });
  }
});

// Setup Insurance Buttons Toggle
insurancePeriodButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    insurancePeriodButtons.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    insurancePeriod = e.target.getAttribute('data-value');
    calculate();
  });
});

// Show/Hide Loan Row based on Paid Off Toggle
carPaidOff.addEventListener('change', () => {
  const isPaidOff = carPaidOff.checked;
  if (isPaidOff) {
    loanPaymentRow.classList.add('hidden');
    loanPaymentSlider.classList.add('hidden');
    document.getElementById('loanPayment').value = 0;
    loanPaymentSlider.value = 0;
  } else {
    loanPaymentRow.classList.remove('hidden');
    loanPaymentSlider.classList.remove('hidden');
    document.getElementById('loanPayment').value = 300; // default loan if not paid off
    loanPaymentSlider.value = 300;
  }
  calculate();
});

// Show/Hide Depreciation based on TCO Switch
tcoSwitch.addEventListener('change', () => {
  const isTCO = tcoSwitch.checked;
  if (isTCO) {
    depreciationRow.classList.remove('hidden');
    depreciationSlider.classList.remove('hidden');
  } else {
    depreciationRow.classList.add('hidden');
    depreciationSlider.classList.add('hidden');
  }
  calculate();
});

// Format currency
function formatEuro(value, decimals = 2) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

// Animate text counter
function animateNumber(elementId, targetValue, isCurrency = true, decimals = 2) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const startValue = parseFloat(el.getAttribute('data-last-val') || '0');
  el.setAttribute('data-last-val', targetValue);

  const duration = 400; // ms
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quad
    const easeProgress = progress * (2 - progress);
    const currentValue = startValue + (targetValue - startValue) * easeProgress;

    if (isCurrency) {
      el.textContent = formatEuro(currentValue, decimals);
    } else {
      el.textContent = currentValue.toFixed(decimals);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (isCurrency) {
        el.textContent = formatEuro(targetValue, decimals);
      } else {
        el.textContent = targetValue.toFixed(decimals);
      }
    }
  }

  requestAnimationFrame(update);
}

// Main Calculate Function
function calculate() {
  // 1. Read Inputs
  const workAllowance = parseFloat(document.getElementById('workBudget').value) || 0;
  const taxRate = parseFloat(document.getElementById('allowanceTax').value) || 0;
  const isPaidOff = carPaidOff.checked;
  const loanPayment = isPaidOff ? 0 : (parseFloat(document.getElementById('loanPayment').value) || 0);
  
  const rawInsurance = parseFloat(insuranceCostInput.value) || 0;
  const insurance = insurancePeriod === 'monthly' ? rawInsurance : rawInsurance / 12;

  const annualMileage = parseFloat(document.getElementById('annualMileage').value) || 0;
  const consumption = parseFloat(document.getElementById('fuelConsumption').value) || 0;
  const fuelPrice = parseFloat(document.getElementById('fuelPrice').value) || 0;
  
  const operatingTaxYr = parseFloat(document.getElementById('operatingTax').value) || 0;
  const operatingTax = operatingTaxYr / 12;

  const maintenanceYr = parseFloat(document.getElementById('maintenance').value) || 0;
  const maintenance = maintenanceYr / 12;

  const isTCO = tcoSwitch.checked;
  const depreciation = isTCO ? (parseFloat(document.getElementById('depreciation').value) || 0) : 0;

  const companyCarCost = parseFloat(document.getElementById('companyCarCost').value) || 0;

  // 2. Compute Option A: Keep Personal Car + Receive Rent Budget
  // Net cash budget received (after tax)
  const netAllowance = workAllowance * (1 - taxRate / 100);

  // Fuel Cost monthly: (Annual Mileage / 12) / 100 * consumption * fuelPrice
  const monthlyFuel = (annualMileage / 12) * (consumption / 100) * fuelPrice;

  // Total Personal Car monthly cost
  const totalPersonalCarCost = insurance + monthlyFuel + operatingTax + maintenance + loanPayment + depreciation;

  // Option A net pocket position
  const optionANetMonthly = netAllowance - totalPersonalCarCost;
  const optionANetYearly = optionANetMonthly * 12;

  // 3. Compute Option B: Get Company Car
  // Net position is basically negative net salary reduction
  const optionBNetMonthly = -companyCarCost;
  const optionBNetYearly = optionBNetMonthly * 12;

  // 4. Compute Comparison
  const monthlyDiff = optionANetMonthly - optionBNetMonthly;
  const yearlyDiff = monthlyDiff * 12;

  // 5. Update UI Numbers
  animateNumber('optionANetMonthly', optionANetMonthly);
  animateNumber('optionANetYearly', optionANetYearly);

  animateNumber('optionBNetMonthly', optionBNetMonthly);
  animateNumber('optionBNetYearly', optionBNetYearly);

  // Update lists
  document.getElementById('breakdownAllowance').textContent = '+' + formatEuro(netAllowance);
  document.getElementById('breakdownInsurance').textContent = '-' + formatEuro(insurance);
  document.getElementById('breakdownFuel').textContent = '-' + formatEuro(monthlyFuel);
  document.getElementById('breakdownTaxes').textContent = '-' + formatEuro(operatingTax);
  document.getElementById('breakdownMaint').textContent = '-' + formatEuro(maintenance);
  
  if (isPaidOff) {
    document.getElementById('breakdownLoanRow').classList.add('hidden');
  } else {
    document.getElementById('breakdownLoanRow').classList.remove('hidden');
    document.getElementById('breakdownLoan').textContent = '-' + formatEuro(loanPayment);
  }

  if (isTCO) {
    document.getElementById('breakdownDepreciationRow').classList.remove('hidden');
    document.getElementById('breakdownDepreciation').textContent = '-' + formatEuro(depreciation);
  } else {
    document.getElementById('breakdownDepreciationRow').classList.add('hidden');
  }

  document.getElementById('breakdownCompanyCarCost').textContent = '-' + formatEuro(companyCarCost);

  // 6. Update Verdict & Scale
  const verdictCard = document.getElementById('verdictCard');
  const verdictIcon = document.getElementById('verdictIcon');
  const verdictTitle = document.getElementById('verdictTitle');
  const verdictDescription = document.getElementById('verdictDescription');
  const scaleMarker = document.getElementById('scaleMarker');

  if (monthlyDiff > 10) {
    // Option A is better
    verdictIcon.className = 'verdict-icon positive';
    verdictIcon.innerHTML = '<i class="fa-solid fa-piggy-bank"></i>';
    verdictTitle.textContent = `Option A is better by ${formatEuro(monthlyDiff, 0)}/mo!`;
    verdictDescription.innerHTML = `Keeping your personal car leaves <strong>${formatEuro(monthlyDiff)}</strong> more in your pocket every month (<strong>${formatEuro(yearlyDiff, 0)}</strong> per year) compared to taking a company car.`;
  } else if (monthlyDiff < -10) {
    // Option B is better
    verdictIcon.className = 'verdict-icon negative';
    verdictIcon.innerHTML = '<i class="fa-solid fa-car-rear"></i>';
    verdictTitle.textContent = `Option B is better by ${formatEuro(Math.abs(monthlyDiff), 0)}/mo!`;
    verdictDescription.innerHTML = `Taking the company car is financially smarter by <strong>${formatEuro(Math.abs(monthlyDiff))}</strong> per month (<strong>${formatEuro(Math.abs(yearlyDiff), 0)}</strong> per year) than maintaining your current car.`;
  } else {
    // Basically equal
    verdictIcon.className = 'verdict-icon';
    verdictIcon.innerHTML = '<i class="fa-solid fa-scale-balanced"></i>';
    verdictTitle.textContent = `Both options are financially equal!`;
    verdictDescription.innerHTML = `The pocket money difference is negligible (less than €10/mo). Choose based on convenience and lifestyle preference!`;
  }

  // Position Scale Marker (Range: 10% to 90%, center is 50%)
  // Scale dynamically based on a max difference of €400/month
  const maxDiffRange = 400;
  let offsetPct = (monthlyDiff / maxDiffRange) * 40; // max shift is 40%
  offsetPct = Math.max(-40, Math.min(40, offsetPct)); // cap at [-40, 40]
  // Shift left (Option A) if monthlyDiff > 0, right (Option B) if monthlyDiff < 0
  const markerPos = 50 - offsetPct;
  scaleMarker.style.left = `${markerPos}%`;

  // 7. Update Stacked Bar Chart & Legend
  const totalCost = totalPersonalCarCost;
  
  const segments = [
    { id: 'segInsurance', cost: insurance, name: 'Insurance', color: '#6366f1' },
    { id: 'segFuel', cost: monthlyFuel, name: 'Fuel', color: '#f59e0b' },
    { id: 'segTax', cost: operatingTax, name: 'Tax & CT', color: '#ec4899' },
    { id: 'segMaint', cost: maintenance, name: 'Maintenance', color: '#06b6d4' },
    { id: 'segLoan', cost: loanPayment, name: 'Loan/Lease', color: '#ef4444' },
    { id: 'segDepreciation', cost: depreciation, name: 'Savings/Depr.', color: '#14b8a6' }
  ];

  const legendContainer = document.getElementById('chartLegend');
  legendContainer.innerHTML = '';

  segments.forEach(seg => {
    const el = document.getElementById(seg.id);
    const pct = totalCost > 0 ? (seg.cost / totalCost) * 100 : 0;
    
    if (el) {
      if (seg.cost > 0) {
        el.classList.remove('hidden');
        el.style.width = `${pct}%`;
        el.setAttribute('title', `${seg.name}: ${formatEuro(seg.cost)}/mo (${pct.toFixed(1)}%)`);
      } else {
        el.classList.add('hidden');
        el.style.width = '0%';
      }
    }

    if (seg.cost > 0) {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <span class="legend-dot" style="background-color: ${seg.color}"></span>
        <span>${seg.name}</span>
        <span class="legend-val">${formatEuro(seg.cost, 0)}/mo <span class="text-dim">(${pct.toFixed(0)}%)</span></span>
      `;
      legendContainer.appendChild(legendItem);
    }
  });
}

// Initial calculation on load
calculate();
