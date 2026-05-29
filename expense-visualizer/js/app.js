/* ===================================================
   Expense & Budget Visualizer — app.js
   =================================================== */

const STORAGE_KEY = 'eviz_transactions';

const CATEGORY_COLORS = {
  Food:      '#3b82f6',
  Transport: '#f59e0b',
  Fun:       '#8b5cf6',
};

/* ===== State ===== */
let transactions = loadTransactions();
let chartInstance = null;

/* ===== DOM ===== */
const nameInput    = document.getElementById('txName');
const amountInput  = document.getElementById('txAmount');
const categorySel  = document.getElementById('txCategory');
const addBtn       = document.getElementById('addBtn');
const formError    = document.getElementById('formError');
const totalBalEl   = document.getElementById('totalBalance');
const txList       = document.getElementById('txList');
const listEmpty    = document.getElementById('listEmpty');
const chartEmpty   = document.getElementById('chartEmpty');
const pieCanvas    = document.getElementById('pieChart');

/* ===== Boot ===== */
render();

/* ===== Events ===== */
addBtn.addEventListener('click', handleAdd);

/* ===== Add ===== */
function handleAdd() {
  formError.textContent = '';

  const name     = nameInput.value.trim();
  const amount   = parseFloat(amountInput.value);
  const category = categorySel.value;

  if (!name) {
    formError.textContent = 'Please enter an item name.';
    nameInput.focus();
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    formError.textContent = 'Please enter a valid positive amount.';
    amountInput.focus();
    return;
  }

  transactions.unshift({
    id: crypto.randomUUID(),
    name,
    amount,
    category,
  });

  save();
  render();

  nameInput.value   = '';
  amountInput.value = '';
  nameInput.focus();
}

/* ===== Delete ===== */
function handleDelete(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  save();
  render();
}

/* ===== Render ===== */
function render() {
  renderBalance();
  renderList();
  renderChart();
}

function renderBalance() {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  totalBalEl.textContent = formatCurrency(total);
}

function renderList() {
  txList.innerHTML = '';

  if (transactions.length === 0) {
    listEmpty.style.display = 'block';
    return;
  }
  listEmpty.style.display = 'none';

  transactions.forEach(tx => {
    const li = document.createElement('li');
    li.className = 'tx-item';

    li.innerHTML = `
      <div class="tx-info">
        <div class="tx-name" title="${esc(tx.name)}">${esc(tx.name)}</div>
        <div class="tx-cat">${esc(tx.category)}</div>
      </div>
      <span class="tx-amount">${formatCurrency(tx.amount)}</span>
      <button class="btn-delete" aria-label="Delete ${esc(tx.name)}">🗑️</button>
    `;

    li.querySelector('.btn-delete').addEventListener('click', () => handleDelete(tx.id));
    txList.appendChild(li);
  });
}

function renderChart() {
  // Aggregate by category
  const totals = {};
  transactions.forEach(tx => {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
  });

  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colors = labels.map(l => CATEGORY_COLORS[l] || '#94a3b8');

  if (labels.length === 0) {
    chartEmpty.style.display = 'block';
    pieCanvas.style.display  = 'none';
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    return;
  }

  chartEmpty.style.display = 'none';
  pieCanvas.style.display  = 'block';

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor:     '#ffffff',
      borderWidth:     2,
      hoverOffset:     8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 14, boxWidth: 13, font: { size: 12 }, color: '#1e293b' },
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

/* ===== Storage ===== */
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

/* ===== Helpers ===== */
function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(v);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
