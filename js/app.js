/* ===================================================
   Expense & Budget Visualizer — app.js
   Vanilla JS | No frameworks | Local Storage
   =================================================== */

// ─── Storage Keys ────────────────────────────────────
const STORAGE_KEY       = 'eviz_transactions';
const LIMIT_KEY         = 'eviz_spending_limit';
const THEME_KEY         = 'eviz_theme';

// ─── Category Colors (pie chart) ─────────────────────
const CATEGORY_COLORS = {
  Food:      '#4caf50',   // green  (matches screenshot)
  Transport: '#ff9800',   // orange (matches screenshot)
  Fun:       '#2196f3',   // blue
};

// ─── State ───────────────────────────────────────────
let transactions  = [];   // master array (insertion order)
let chartInstance = null;
let spendingLimit = 0;    // 0 = no limit active

// ─── DOM References ──────────────────────────────────
const nameInput      = document.getElementById('txName');
const amountInput    = document.getElementById('txAmount');
const categorySel    = document.getElementById('txCategory');
const addBtn         = document.getElementById('addBtn');
const formError      = document.getElementById('formError');
const totalBalEl     = document.getElementById('totalBalance');
const txList         = document.getElementById('txList');
const listEmpty      = document.getElementById('listEmpty');
const chartEmpty     = document.getElementById('chartEmpty');
const chartUnavail   = document.getElementById('chartUnavailable');
const pieCanvas      = document.getElementById('pieChart');
const monthlyTotal   = document.getElementById('monthlyTotal');
const monthlyCount   = document.getElementById('monthlyCount');
const monthlyTop     = document.getElementById('monthlyTop');
const limitInput     = document.getElementById('spendingLimit');
const sortSelect     = document.getElementById('sortSelect');
const themeToggle    = document.getElementById('themeToggle');

// ─── Boot ─────────────────────────────────────────────
(function init() {
  // 1. Restore theme first (prevents flash)
  loadFromLocalStorage();

  // 2. Wire events
  addBtn.addEventListener('click', addTransaction);
  limitInput.addEventListener('input', handleLimitChange);
  sortSelect.addEventListener('change', renderList);
  themeToggle.addEventListener('change', toggleTheme);

  // 3. Render everything
  render();
})();

// ─── Add Transaction ──────────────────────────────────
/**
 * addTransaction() — validates form, creates transaction object,
 * saves to Local Storage, and updates the UI.
 */
function addTransaction() {
  formError.textContent = '';

  const name     = nameInput.value.trim();
  const rawAmt   = amountInput.value.trim();
  const amount   = parseFloat(rawAmt);
  const category = categorySel.value;

  // Validation
  if (!name || !rawAmt || !category) {
    alert('Please fill all fields');
    if (!name) { formError.textContent = 'Item name is required.'; nameInput.focus(); return; }
    if (!rawAmt) { formError.textContent = 'Amount is required.'; amountInput.focus(); return; }
  }

  if (isNaN(amount) || amount <= 0) {
    alert('Please fill all fields');
    formError.textContent = 'Amount must be a positive number.';
    amountInput.focus();
    return;
  }

  if (amount > 999999999.99) {
    formError.textContent = 'Amount is too large.';
    amountInput.focus();
    return;
  }

  // Build transaction object
  const tx = {
    id:       Date.now().toString(),
    name,
    amount,
    category,
    date:     new Date().toISOString(),
  };

  transactions.unshift(tx);
  saveToLocalStorage();
  render();

  // Clear form
  nameInput.value   = '';
  amountInput.value = '';
  nameInput.focus();
}

// ─── Delete Transaction ───────────────────────────────
/**
 * deleteTransaction(id) — removes a transaction by id,
 * persists the change, and refreshes the UI.
 */
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveToLocalStorage();
  render();
}

// ─── Render (orchestrator) ────────────────────────────
function render() {
  updateBalance();
  updateMonthlySummary();
  renderList();
  updateChart();
}

// ─── Update Balance ───────────────────────────────────
/**
 * updateBalance() — recalculates total using reduce() and updates DOM.
 */
function updateBalance() {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  totalBalEl.textContent = formatCurrency(total);
}

// ─── Update Monthly Summary ───────────────────────────
/**
 * updateMonthlySummary() — filters transactions for the current
 * calendar month and updates the summary card.
 */
function updateMonthlySummary() {
  const now      = new Date();
  const thisYear = now.getFullYear();
  const thisMon  = now.getMonth();

  const monthly = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getFullYear() === thisYear && d.getMonth() === thisMon;
  });

  // Total spent this month
  const total = monthly.reduce((sum, tx) => sum + tx.amount, 0);
  monthlyTotal.textContent = formatCurrency(total);

  // Transaction count
  monthlyCount.textContent = monthly.length;

  // Highest spending category (alphabetical tiebreaker)
  if (monthly.length === 0) {
    monthlyTop.textContent = 'N/A';
    return;
  }

  const catTotals = {};
  monthly.forEach(tx => {
    catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;
  });

  const topCat = Object.keys(catTotals).sort((a, b) => {
    const diff = catTotals[b] - catTotals[a];
    return diff !== 0 ? diff : a.localeCompare(b);
  })[0];

  monthlyTop.textContent = topCat;
}

// ─── Render Transaction List ──────────────────────────
/**
 * renderList() — sorts a display copy of transactions (does NOT
 * mutate the master array or Local Storage) and renders each item.
 */
function renderList() {
  txList.innerHTML = '';

  if (transactions.length === 0) {
    listEmpty.style.display = 'block';
    return;
  }
  listEmpty.style.display = 'none';

  // Sort display copy
  const sorted = sortTransactions([...transactions]);

  sorted.forEach(tx => {
    const li = document.createElement('li');
    li.className = 'tx-item';

    // Apply over-limit highlight
    checkSpendingLimit(li, tx.amount);

    // Format date as human-readable
    const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

    li.innerHTML = `
      <div class="tx-info">
        <div class="tx-name" title="${esc(tx.name)}">${esc(tx.name)}</div>
        <span class="tx-amount">${formatCurrency(tx.amount)}</span>
        <span class="tx-cat-badge">${esc(tx.category)}</span>
        <div class="tx-date">${dateStr}</div>
      </div>
      <button class="btn-delete" aria-label="Delete ${esc(tx.name)}">Delete</button>
    `;

    li.querySelector('.btn-delete').addEventListener('click', () => deleteTransaction(tx.id));
    txList.appendChild(li);
  });
}

// ─── Sort Transactions ────────────────────────────────
/**
 * sortTransactions(arr) — returns a sorted copy based on the
 * current Sort Dropdown value. Does NOT modify Local Storage.
 */
function sortTransactions(arr) {
  const mode = sortSelect.value;

  return arr.sort((a, b) => {
    switch (mode) {
      case 'newest':
        // date desc; tiebreak: id desc
        return new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id);

      case 'highest':
        // amount desc; tiebreak: date desc
        return b.amount - a.amount || new Date(b.date) - new Date(a.date);

      case 'lowest':
        // amount asc; tiebreak: date desc
        return a.amount - b.amount || new Date(b.date) - new Date(a.date);

      case 'category':
        // category asc (case-insensitive); tiebreak: date desc
        return a.category.toLowerCase().localeCompare(b.category.toLowerCase())
          || new Date(b.date) - new Date(a.date);

      default:
        return 0;
    }
  });
}

// ─── Update Chart ─────────────────────────────────────
/**
 * updateChart() — aggregates spending by category and updates
 * (or creates) the Chart.js pie chart.
 */
function updateChart() {
  // Guard: Chart.js not loaded
  if (typeof Chart === 'undefined') {
    chartUnavail.style.display = 'block';
    chartEmpty.style.display   = 'none';
    pieCanvas.style.display    = 'none';
    return;
  }

  const totals = {};
  transactions.forEach(tx => {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
  });

  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colors = labels.map(l => CATEGORY_COLORS[l] || '#9e9e9e');

  if (labels.length === 0) {
    chartEmpty.style.display  = 'block';
    pieCanvas.style.display   = 'none';
    chartUnavail.style.display = 'none';
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    return;
  }

  chartEmpty.style.display   = 'none';
  chartUnavail.style.display = 'none';
  pieCanvas.style.display    = 'block';

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor:     '#ffffff',
      borderWidth:     2,
      hoverOffset:     10,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 400 },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding:  16,
          boxWidth: 14,
          font:     { size: 12 },
          color:    document.body.classList.contains('dark') ? '#e0e0e0' : '#212121',
        },
      },
      tooltip: {
        callbacks: {
          label(ctx) {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct   = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
            return ` ${formatCurrency(ctx.parsed)} (${pct}%)`;
          },
        },
      },
    },
  };

  if (chartInstance) {
    chartInstance.data    = chartData;
    chartInstance.options = chartOptions;
    chartInstance.update();
  } else {
    chartInstance = new Chart(pieCanvas, { type: 'pie', data: chartData, options: chartOptions });
  }
}

// ─── Spending Limit ───────────────────────────────────
/**
 * handleLimitChange() — reads the limit input, persists it,
 * and re-renders the list to apply/remove highlights.
 */
function handleLimitChange() {
  const val = parseFloat(limitInput.value);

  if (!limitInput.value.trim() || isNaN(val) || val <= 0) {
    // Invalid or empty — clear limit
    spendingLimit = 0;
    try { localStorage.removeItem(LIMIT_KEY); } catch (_) {}
  } else {
    spendingLimit = val;
    try { localStorage.setItem(LIMIT_KEY, String(spendingLimit)); } catch (_) {}
  }

  renderList();
}

/**
 * checkSpendingLimit(el, amount) — applies or removes the
 * .over-limit CSS class on a transaction list item element.
 */
function checkSpendingLimit(el, amount) {
  if (spendingLimit > 0 && amount > spendingLimit) {
    el.classList.add('over-limit');
  } else {
    el.classList.remove('over-limit');
  }
}

// ─── Theme Toggle ─────────────────────────────────────
/**
 * toggleTheme() — switches dark/light mode, saves preference.
 */
function toggleTheme() {
  const isDark = themeToggle.checked;
  document.body.classList.toggle('dark', isDark);
  try { localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light'); } catch (_) {}

  // Re-render chart so legend color updates
  updateChart();
}

// ─── Local Storage ────────────────────────────────────
/**
 * saveToLocalStorage() — persists the transactions array.
 */
function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

/**
 * loadFromLocalStorage() — restores transactions, spending limit,
 * and theme preference. Called once on init before any render.
 */
function loadFromLocalStorage() {
  // ── Transactions ──
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Discard entries missing required fields or invalid date
      transactions = parsed.filter(tx => {
        if (!tx.id || !tx.name || typeof tx.amount !== 'number' || !tx.category || !tx.date) {
          return false;
        }
        const d = new Date(tx.date);
        return !isNaN(d.getTime());
      });
    }
  } catch (_) {
    transactions = [];
  }

  // ── Spending Limit ──
  try {
    const savedLimit = localStorage.getItem(LIMIT_KEY);
    if (savedLimit !== null) {
      const parsed = parseFloat(savedLimit);
      if (!isNaN(parsed) && parsed > 0) {
        spendingLimit = parsed;
        limitInput.value = parsed;
      }
    }
  } catch (_) {}

  // ── Theme ──
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      themeToggle.checked = true;
    }
  } catch (_) {}
}

// ─── Helpers ──────────────────────────────────────────
/**
 * formatCurrency(v) — formats a number as USD currency string.
 */
function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(v);
}

/**
 * esc(str) — escapes HTML special characters to prevent XSS.
 */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
