// app.js - Expense & Budget Visualizer
// All application logic: StorageManager, TransactionManager, UIManager, ChartManager

// ─── StorageManager ───────────────────────────────────────────────────────────
// Abstracts Local Storage operations with error handling.
class StorageManager {
  /**
   * @param {string} storageKey - The Local Storage key used to persist transactions
   */
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  /**
   * Check if Local Storage is available in the current browser/context.
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save transactions array to Local Storage.
   * @param {Array} transactions
   * @returns {{ success: boolean, error?: string }}
   */
  save(transactions) {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage unavailable: Your data will not be saved between sessions' };
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
      return { success: true };
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        return { success: false, error: 'Storage quota exceeded: Please delete some transactions' };
      }
      return { success: false, error: `Storage error: ${e.message}` };
    }
  }

  /**
   * Load transactions from Local Storage.
   * @returns {{ success: boolean, data?: Array, error?: string }}
   */
  load() {
    if (!this.isAvailable()) {
      return { success: false, error: 'Storage unavailable: Your data will not be saved between sessions' };
    }
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw === null) {
        // Nothing stored yet — return empty array
        return { success: true, data: [] };
      }
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        console.warn('StorageManager: stored data is not an array, resetting.');
        return { success: true, data: [], error: 'Saved data was corrupted. Starting with a fresh list.' };
      }
      return { success: true, data };
    } catch (e) {
      // JSON parse error or other unexpected error
      console.warn('StorageManager: failed to parse stored data.', e);
      return { success: true, data: [], error: 'Some saved transactions were invalid and have been removed' };
    }
  }
}

// ─── TransactionManager ───────────────────────────────────────────────────────
// Core business logic for transaction operations and balance calculation.
class TransactionManager {
  /**
   * @param {StorageManager} storageManager - The storage manager instance for persistence
   */
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.transactions = [];
  }

  /**
   * Get all transactions.
   * @returns {Array<Transaction>}
   */
  getTransactions() {
    return this.transactions;
  }

  /**
   * Calculate total balance by summing all transaction amounts.
   * @returns {number}
   */
  calculateBalance() {
    return this.transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Get spending totals grouped by category.
   * @returns {Map<string, number>}
   */
  getSpendingByCategory() {
    const categoryMap = new Map();
    for (const transaction of this.transactions) {
      const current = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, current + transaction.amount);
    }
    return categoryMap;
  }

  /**
   * Add a new transaction after validating inputs.
   * @param {string} itemName - Item description (1-100 chars after trim)
   * @param {number} amount - Positive number > 0
   * @param {string} category - Non-empty category string
   * @returns {{ success: boolean, transaction?: object, error?: string }}
   */
  addTransaction(itemName, amount, category) {
    // Validate itemName
    if (typeof itemName !== 'string' || itemName.trim().length === 0) {
      return { success: false, error: 'Please enter an item name' };
    }
    const trimmedName = itemName.trim();
    if (trimmedName.length > 100) {
      return { success: false, error: 'Item name must be 100 characters or fewer' };
    }

    // Validate amount
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be a positive number' };
    }

    // Validate category
    if (typeof category !== 'string' || category.trim().length === 0) {
      return { success: false, error: 'Please select a category' };
    }

    // Generate unique ID: timestamp + random string
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Build transaction object
    const transaction = {
      id,
      itemName: trimmedName,
      amount,
      category: category.trim(),
      timestamp: Date.now()
    };

    // Add to in-memory array
    this.transactions.push(transaction);

    // Persist to storage
    this.storageManager.save(this.transactions);

    return { success: true, transaction };
  }

  /**
   * Return a sorted copy of transactions.
   * @param {'date'|'amount'|'category'} sortBy
   * @param {'asc'|'desc'} order
   * @returns {Array}
   */
  getSortedTransactions(sortBy = 'date', order = 'desc') {
    const copy = [...this.transactions];
    copy.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'amount') {
        valA = a.amount; valB = b.amount;
      } else if (sortBy === 'category') {
        valA = a.category.toLowerCase(); valB = b.category.toLowerCase();
      } else {
        // default: date
        valA = a.timestamp; valB = b.timestamp;
      }
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }

  /**
   * Return transactions grouped by month-year, sorted newest first.
   * @returns {Map<string, { transactions: Array, total: number, count: number }>}
   */
  getMonthlyTransactions() {
    const map = new Map();
    for (const t of this.transactions) {
      const d = new Date(t.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, { transactions: [], total: 0, count: 0 });
      }
      const entry = map.get(key);
      entry.transactions.push(t);
      entry.total += t.amount;
      entry.count += 1;
    }
    // Sort keys newest first
    return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
  }

  /**
   * Delete a transaction by ID.
   * @param {string} id - The transaction ID to remove
   * @returns {{ success: boolean, error?: string }}
   */
  deleteTransaction(id) {
    const initialLength = this.transactions.length;
    this.transactions = this.transactions.filter(t => t.id !== id);

    if (this.transactions.length === initialLength) {
      return { success: false, error: `Transaction with id "${id}" not found` };
    }

    const saveResult = this.storageManager.save(this.transactions);
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return { success: true };
  }
}

// ─── ChartManager ─────────────────────────────────────────────────────────────
// Manages Chart.js integration for the spending pie chart.
class ChartManager {

  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.chart = null;
    this.legendEl = document.getElementById('chart-legend');
    // Track which dataset indices are hidden
    this._hidden = new Set();
  }

  initialize() {
    if (!window.Chart) {
      console.warn('ChartManager: Chart.js is not available.');
      if (this.canvas && this.canvas.parentElement) {
        const fallback = document.createElement('p');
        fallback.id = 'chart-fallback';
        fallback.textContent = 'Chart visualization unavailable.';
        fallback.style.textAlign = 'center';
        this.canvas.parentElement.replaceChild(fallback, this.canvas);
      }
      return;
    }

    if (this.chart) { this.chart.destroy(); this.chart = null; }

    const isDark = () => document.body.classList.contains('theme-dark');

    this.chart = new Chart(this.canvas, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ChartManager.COLORS,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 300 },
        plugins: {
          legend: { display: false }, // disabled — using custom HTML legend
          tooltip: {
            callbacks: {
              label(ctx) {
                const fmt = (v) => new Intl.NumberFormat('id-ID', {
                  style: 'currency', currency: 'IDR',
                  minimumFractionDigits: 0, maximumFractionDigits: 0
                }).format(v);
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
                return ` ${fmt(ctx.parsed)}  (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /** Render the custom HTML legend grid below the chart. */
  _renderLegend(labels, data, colors) {
    if (!this.legendEl) return;
    const fmt = (v) => new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(v);
    const total = data.reduce((a, b) => a + b, 0);

    this.legendEl.innerHTML = '';

    labels.forEach((label, i) => {
      const pct = total > 0 ? ((data[i] / total) * 100).toFixed(1) : '0.0';
      const isHidden = this._hidden.has(i);

      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'chart-legend__item' + (isHidden ? ' chart-legend__item--disabled' : '');
      item.setAttribute('role', 'listitem');
      item.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
      item.setAttribute('aria-label', `${isHidden ? 'Tampilkan' : 'Sembunyikan'} ${label}`);
      item.dataset.index = i;

      item.innerHTML = `
        <span class="chart-legend__swatch" style="background:${colors[i]};"></span>
        <span class="chart-legend__name">${label}</span>
        <span class="chart-legend__pct">${pct}%</span>
        <span class="chart-legend__val">${fmt(data[i])}</span>
      `;

      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        const meta = this.chart.getDatasetMeta(0);
        if (this._hidden.has(idx)) {
          this._hidden.delete(idx);
          meta.data[idx].hidden = false;
        } else {
          this._hidden.add(idx);
          meta.data[idx].hidden = true;
        }
        this.chart.update();
        // Re-render legend to reflect new state
        this._renderLegend(
          this.chart.data.labels,
          this.chart.data.datasets[0].data,
          this.chart.data.datasets[0].backgroundColor
        );
      });

      this.legendEl.appendChild(item);
    });
  }

  update(categoryDataMap) {
    if (!this.chart) return;

    if (!categoryDataMap || categoryDataMap.size === 0) {
      this.chart.data.labels = ['No transactions'];
      this.chart.data.datasets[0].data = [1];
      this.chart.data.datasets[0].backgroundColor = ['#cbd5e1'];
      this.chart.data.datasets[0].borderColor = '#ffffff';
      this.chart.update();
      if (this.legendEl) this.legendEl.innerHTML = '';
      return;
    }

    const labels = [];
    const data = [];
    for (const [category, total] of categoryDataMap) {
      labels.push(category);
      data.push(total);
    }

    const colors = labels.map((_, i) => ChartManager.COLORS[i % ChartManager.COLORS.length]);
    const isDark = document.body.classList.contains('theme-dark');

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.data.datasets[0].borderColor = isDark ? '#1e293b' : '#ffffff';
    this.chart.data.datasets[0].borderWidth = 3;

    // Sync tooltip colors
    this.chart.options.plugins.tooltip.backgroundColor = isDark ? '#1e293b' : '#ffffff';
    this.chart.options.plugins.tooltip.titleColor      = isDark ? '#f1f5f9' : '#1e293b';
    this.chart.options.plugins.tooltip.bodyColor       = isDark ? '#94a3b8' : '#374151';
    this.chart.options.plugins.tooltip.borderColor     = isDark ? '#475569' : '#e2e8f0';
    this.chart.options.plugins.tooltip.borderWidth     = 1;

    this.chart.update();
    this._renderLegend(labels, data, colors);
  }

  reset() { this.initialize(); }
}

// Predefined color palette for categories.
// Defined outside the class body for maximum browser compatibility
// (avoids static class field syntax, which requires Chrome 74+/Firefox 90+/Safari 14+).
ChartManager.COLORS = [
  '#FF6384', // red-pink
  '#36A2EB', // blue
  '#FFCE56', // yellow
  '#4BC0C0', // teal
  '#9966FF', // purple
  '#FF9F40', // orange
  '#C9CBCF', // grey
  '#7BC8A4', // green
  '#E7E9ED', // light grey
  '#F7464A', // red
];

// ─── UIManager ────────────────────────────────────────────────────────────────
// Handles DOM manipulation and visual updates.
class UIManager {
  /**
   * Creates a UIManager and caches all required DOM element references.
   * @param {TransactionManager} transactionManager
   * @param {ChartManager} chartManager
   */
  constructor(transactionManager, chartManager) {
    this.transactionManager = transactionManager;
    this.chartManager = chartManager;

    // Cache form input references
    this.itemNameInput = document.getElementById('item-name');
    this.amountInput = document.getElementById('amount');
    // Hidden input that holds the selected category value
    this.categoryInput = document.getElementById('category');
    this.submitButton = document.getElementById('submit-btn');

    // Custom dropdown elements
    this.categoryDropdown = document.getElementById('category-dropdown');
    this.categoryDisplay  = document.getElementById('category-display');
    this.categoryPanel    = document.getElementById('category-panel');
    this.categoryOptions  = document.getElementById('category-options');
    this.newCategoryInput = document.getElementById('new-category-input');
    this.addCategoryBtn   = document.getElementById('add-category-btn');
    this.categoryError    = document.getElementById('category-error');

    // Cache display element references
    this.balanceDisplay = document.getElementById('balance-display');
    this.transactionListContainer = document.getElementById('transaction-list');
    this.chartCanvas = document.getElementById('spending-chart');

    // Cache message element references
    this.errorMessageContainer = document.getElementById('error-message');
    this.successMessageContainer = document.getElementById('success-message');

    // Track selected category value
    this._selectedCategory = '';
  }

  /**
   * Reset all form input fields to their default state.
   * Satisfies Requirement 1.5: clear form after transaction creation.
   */
  clearForm() {
    this.itemNameInput.value = '';
    this.amountInput.value = '';
    // Reset custom dropdown
    this._selectedCategory = '';
    this.categoryInput.value = '';
    this.categoryDisplay.textContent = 'Select a category';
    this.categoryDisplay.classList.add('cat-dropdown__display--placeholder');
    // Deselect all options
    this.categoryOptions.querySelectorAll('li').forEach(li => li.setAttribute('aria-selected', 'false'));
  }

  /**
   * Display a validation or application error message.
   * Hides the success message if visible.
   * Satisfies Requirement 8.4: visual feedback within 50ms.
   * @param {string} message
   */
  showError(message) {
    // Hide success message
    this.successMessageContainer.hidden = true;
    this.successMessageContainer.textContent = '';

    // Show error message
    this.errorMessageContainer.textContent = message;
    this.errorMessageContainer.hidden = false;
  }

  /**
   * Display a success feedback message.
   * Hides the error message if visible.
   * Satisfies Requirement 8.4: visual feedback within 50ms.
   * @param {string} message
   */
  showSuccess(message) {
    // Hide error message
    this.errorMessageContainer.hidden = true;
    this.errorMessageContainer.textContent = '';

    // Show success message
    this.successMessageContainer.textContent = message;
    this.successMessageContainer.hidden = false;
  }

  /**
   * Format a number as Indonesian Rupiah currency.
   * @param {number} amount
   * @returns {string}
   */
  formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Recalculate and display the current balance.
   * Satisfies Requirements 4.1, 4.3, 4.4.
   */
  updateBalance() {
    const balance = this.transactionManager.calculateBalance();
    this.balanceDisplay.textContent = this.formatRupiah(balance);
  }

  /**
   * Render the full transaction list using a DocumentFragment for a single reflow.
   * Each item shows name, amount, category, and a delete button.
   * Uses textContent for user-provided data to prevent XSS.
   * Satisfies Requirements 2.1, 2.2, 3.1.
   */
  renderTransactionList(transactions) {
    const txList = transactions || this.transactionManager.getTransactions();
    const fragment = document.createDocumentFragment();

    for (const transaction of txList) {
      const li = document.createElement('li');
      li.className = 'transaction-item';

      // Info container
      const info = document.createElement('div');
      info.className = 'transaction-item__info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'transaction-item__name';
      nameSpan.textContent = transaction.itemName; // textContent prevents XSS

      const metaSpan = document.createElement('span');
      metaSpan.className = 'transaction-item__meta';
      metaSpan.textContent = transaction.category;

      info.appendChild(nameSpan);
      info.appendChild(metaSpan);

      // Amount
      const amountSpan = document.createElement('span');
      amountSpan.className = 'transaction-item__amount';
      amountSpan.textContent = this.formatRupiah(transaction.amount);

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.dataset.transactionId = transaction.id;
      deleteBtn.setAttribute('aria-label', `Delete ${transaction.itemName}`);
      deleteBtn.textContent = '✕';

      li.appendChild(info);
      li.appendChild(amountSpan);
      li.appendChild(deleteBtn);

      fragment.appendChild(li);
    }

    // Single reflow: clear then append fragment
    this.transactionListContainer.innerHTML = '';
    this.transactionListContainer.appendChild(fragment);
  }

  /**
   * Update the pie chart with current category spending data.
   * Satisfies Requirements 5.3, 5.4.
   */
  updateChart() {
    const categoryData = this.transactionManager.getSpendingByCategory();
    this.chartManager.update(categoryData);
  }
  /**
   * Rebuild the custom dropdown option list.
   * Default categories are shown without a remove button.
   * Custom categories show a × remove button.
   * @param {CategoryManager} categoryManager
   */
  updateCategoryOptions(categoryManager) {
    const currentValue = this._selectedCategory;
    this.categoryOptions.innerHTML = '';

    const allCats = categoryManager.getAllCategories();
    const customCats = new Set(categoryManager.getCustomCategories());

    for (const cat of allCats) {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', cat === currentValue ? 'true' : 'false');
      li.dataset.value = cat;

      const nameSpan = document.createElement('span');
      nameSpan.textContent = cat;
      li.appendChild(nameSpan);

      // Only custom categories get a remove button
      if (customCats.has(cat)) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'cat-option__remove';
        removeBtn.setAttribute('aria-label', `Hapus kategori ${cat}`);
        removeBtn.textContent = '×';
        removeBtn.dataset.category = cat;
        li.appendChild(removeBtn);
      }

      this.categoryOptions.appendChild(li);
    }

    // If previously selected category was removed, reset
    if (currentValue && !allCats.includes(currentValue)) {
      this._selectedCategory = '';
      this.categoryInput.value = '';
      this.categoryDisplay.textContent = 'Select a category';
      this.categoryDisplay.classList.add('cat-dropdown__display--placeholder');
    }
  }

  /** Open the category dropdown panel. */
  openCategoryDropdown() {
    this.categoryPanel.hidden = false;
    this.categoryDropdown.setAttribute('aria-expanded', 'true');
  }

  /** Close the category dropdown panel. */
  closeCategoryDropdown() {
    this.categoryPanel.hidden = true;
    this.categoryDropdown.setAttribute('aria-expanded', 'false');
  }

  /**
   * Select a category value from the dropdown.
   * @param {string} value
   */
  selectCategory(value) {
    this._selectedCategory = value;
    this.categoryInput.value = value;
    this.categoryDisplay.textContent = value;
    this.categoryDisplay.classList.remove('cat-dropdown__display--placeholder');
    this.categoryOptions.querySelectorAll('li').forEach(li => {
      li.setAttribute('aria-selected', li.dataset.value === value ? 'true' : 'false');
    });
    this.closeCategoryDropdown();
  }

  /**
   * Cache references to sort DOM elements.
   * Called once during init.
   */
  renderSortControls() {
    this.sortBySelect = document.getElementById('sort-by');
    this.sortOrderBtn = document.getElementById('sort-order-btn');
    // Initial state already set in HTML (value="date", text="↑↓")
  }

  /**
   * Render monthly summary for the given month key.
   * @param {string} monthKey - Format 'YYYY-MM'
   */
  renderMonthlySummary(monthKey) {
    const labelEl = document.getElementById('current-month-label');
    const contentEl = document.getElementById('monthly-summary-content');
    if (!labelEl || !contentEl) return;

    // Format label: "April 2026"
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    labelEl.textContent = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const monthlyData = this.transactionManager.getMonthlyTransactions();
    const data = monthlyData.get(monthKey);

    if (!data || data.count === 0) {
      contentEl.textContent = 'Tidak ada transaksi pada bulan ini';
      return;
    }

    contentEl.innerHTML = '';
    const totalP = document.createElement('p');
    totalP.textContent = `Total: ${this.formatRupiah(data.total)}`;
    const countP = document.createElement('p');
    countP.textContent = `Jumlah transaksi: ${data.count}`;
    contentEl.appendChild(totalP);
    contentEl.appendChild(countP);
  }

  /**
   * Evaluate and show/hide spending limit warning.
   * @param {number|null} spendingLimit
   */
  updateSpendingLimit(spendingLimit) {
    const balance = this.transactionManager.calculateBalance();
    const warningEl = document.getElementById('spending-limit-warning');
    const isWarning = spendingLimit !== null && balance > spendingLimit;
    this.balanceDisplay.classList.toggle('balance--warning', isWarning);
    if (warningEl) warningEl.hidden = !isWarning;
  }
}

// ─── CategoryManager ──────────────────────────────────────────────────────────
// Manages default and custom expense categories with localStorage persistence.
class CategoryManager {
  static DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];
  static STORAGE_KEY = 'customCategories';

  /**
   * @param {StorageManager} storageManager
   */
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.customCategories = [];
  }

  /**
   * Load custom categories from localStorage.
   */
  load() {
    const result = this.storageManager.load();
    if (result.success && Array.isArray(result.data)) {
      this.customCategories = result.data;
    }
  }

  /**
   * Return all categories (default + custom).
   * @returns {Array<string>}
   */
  getAllCategories() {
    return [...CategoryManager.DEFAULT_CATEGORIES, ...this.customCategories];
  }

  /**
   * Return a copy of custom categories only.
   * @returns {Array<string>}
   */
  getCustomCategories() {
    return [...this.customCategories];
  }

  /**
   * Add a new custom category with validation.
   * @param {string} name
   * @returns {{ success: boolean, error?: string }}
   */
  addCategory(name) {
    if (!name || !name.trim()) {
      return { success: false, error: 'Nama kategori tidak boleh kosong' };
    }
    if (name.length > 50) {
      return { success: false, error: 'Nama kategori maksimal 50 karakter' };
    }
    const trimmed = name.trim();
    const allCategories = this.getAllCategories();
    const isDuplicate = allCategories.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      return { success: false, error: `Kategori '${trimmed}' sudah ada` };
    }
    this.customCategories.push(trimmed);
    this.storageManager.save(this.customCategories);
    return { success: true };
  }

  /**
   * Remove a custom category by exact name.
   * @param {string} name
   * @returns {{ success: boolean, error?: string }}
   */
  removeCategory(name) {
    const index = this.customCategories.findIndex(c => c === name);
    if (index === -1) {
      return { success: false, error: `Kategori '${name}' tidak ditemukan` };
    }
    this.customCategories.splice(index, 1);
    this.storageManager.save(this.customCategories);
    return { success: true };
  }
}

// ─── ThemeManager ─────────────────────────────────────────────────────────────
// Manages dark/light theme with localStorage persistence.
class ThemeManager {
  static STORAGE_KEY = 'theme';
  static DARK_CLASS = 'theme-dark';

  constructor(storageManager) {
    this.storageManager = storageManager;
    this.current = 'light';
  }

  load() {
    const result = this.storageManager.load();
    if (result.success && (result.data === 'dark' || result.data === 'light')) {
      this.current = result.data;
    }
    if (this.current === 'dark') {
      document.body.classList.add(ThemeManager.DARK_CLASS);
    } else {
      document.body.classList.remove(ThemeManager.DARK_CLASS);
    }
  }

  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle(ThemeManager.DARK_CLASS, this.current === 'dark');
    this.storageManager.save(this.current);
  }

  getCurrent() {
    return this.current;
  }
}

// ─── Application Initialization & Event Handling ──────────────────────────────

/**
 * Initialize the application: set up managers, load persisted data, bind events.
 * Satisfies Requirements: 6.3, 6.4, 2.5, 4.5, 1.3, 1.4, 1.5, 1.6, 3.1–3.4
 */
function initApp() {
  try {
  // ── 1. Check Local Storage availability (Req 6.4) ──────────────────────────
  const storageManager = new StorageManager('transactions');

  if (!storageManager.isAvailable()) {
    // Create a temporary UIManager-like error display before full init
    const errEl = document.getElementById('error-message');
    if (errEl) {
      errEl.textContent = 'Storage unavailable: Your data will not be saved between sessions';
      errEl.hidden = false;
    }
  }

  // ── 2. Load persisted transactions (Req 6.3, 2.5) ──────────────────────────
  const loadResult = storageManager.load();

  // ── 3. Initialize managers ──────────────────────────────────────────────────
  const transactionManager = new TransactionManager(storageManager);

  // Populate in-memory transactions from storage
  if (loadResult.success && Array.isArray(loadResult.data)) {
    transactionManager.transactions = loadResult.data;
  }

  const chartCanvas = document.getElementById('spending-chart');
  const chartManager = new ChartManager(chartCanvas);
  chartManager.initialize();

  const uiManager = new UIManager(transactionManager, chartManager);

  // Initialize CategoryManager
  const categoryStorageManager = new StorageManager('customCategories');
  const categoryManager = new CategoryManager(categoryStorageManager);
  categoryManager.load();
  uiManager.updateCategoryOptions(categoryManager);

  // ThemeManager
  const themeStorageManager = new StorageManager('theme');
  const themeManager = new ThemeManager(themeStorageManager);
  themeManager.load();
  // Update toggle icon based on loaded theme
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('.theme-icon') : null;
  if (themeIcon) themeIcon.textContent = themeManager.getCurrent() === 'dark' ? '☀️' : '🌙';

  // Spending limit
  const spendingLimitStorage = new StorageManager('spendingLimit');
  const spendingLimitResult = spendingLimitStorage.load();
  let spendingLimit = (spendingLimitResult.success && typeof spendingLimitResult.data === 'number')
    ? spendingLimitResult.data : null;

  // Show any load warning/error (e.g. corrupted data) to the user
  if (loadResult.error) {
    uiManager.showError(loadResult.error);
  }

  // ── 4. Render initial UI state (Req 2.5, 4.5) ──────────────────────────────
  uiManager.renderTransactionList();
  uiManager.updateBalance();
  uiManager.updateChart();

  // Current month key
  const now = new Date();
  let currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  uiManager.renderSortControls();
  uiManager.renderMonthlySummary(currentMonthKey);
  uiManager.updateSpendingLimit(spendingLimit);

  // ── 5. Custom category dropdown event handlers ─────────────────────────────

  // Toggle open/close when clicking the trigger
  uiManager.categoryDropdown.addEventListener('click', (e) => {
    // Don't toggle if clicking inside the panel
    if (uiManager.categoryPanel.contains(e.target)) return;
    const isOpen = uiManager.categoryPanel.hidden === false;
    if (isOpen) {
      uiManager.closeCategoryDropdown();
    } else {
      uiManager.openCategoryDropdown();
      uiManager.newCategoryInput.focus();
    }
  });

  // Keyboard support on the trigger
  uiManager.categoryDropdown.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isOpen = uiManager.categoryPanel.hidden === false;
      isOpen ? uiManager.closeCategoryDropdown() : uiManager.openCategoryDropdown();
    }
    if (e.key === 'Escape') uiManager.closeCategoryDropdown();
  });

  // Select a category when clicking an option
  uiManager.categoryOptions.addEventListener('click', (e) => {
    // Remove button — handle separately
    const removeBtn = e.target.closest('.cat-option__remove');
    if (removeBtn) {
      e.stopPropagation();
      const cat = removeBtn.dataset.category;
      categoryManager.removeCategory(cat);
      uiManager.updateCategoryOptions(categoryManager);
      return;
    }
    // Option row click — select it
    const li = e.target.closest('li[data-value]');
    if (li) uiManager.selectCategory(li.dataset.value);
  });

  // Add new category from the panel input
  uiManager.addCategoryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const name = uiManager.newCategoryInput.value;
    const result = categoryManager.addCategory(name);
    if (result.success) {
      uiManager.newCategoryInput.value = '';
      uiManager.categoryError.hidden = true;
      uiManager.updateCategoryOptions(categoryManager);
      // Auto-select the newly added category
      uiManager.selectCategory(name.trim());
    } else {
      uiManager.categoryError.textContent = result.error;
      uiManager.categoryError.hidden = false;
    }
  });

  // Allow pressing Enter in the new-category input to add
  uiManager.newCategoryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      uiManager.addCategoryBtn.click();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!uiManager.categoryDropdown.contains(e.target)) {
      uiManager.closeCategoryDropdown();
    }
  });

  // Theme toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      themeManager.toggle();
      if (themeIcon) themeIcon.textContent = themeManager.getCurrent() === 'dark' ? '☀️' : '🌙';
      uiManager.updateChart();
    });
  }

  // ── 5. Form submission handler (Req 1.3, 1.4, 1.5, 1.6, 2.4, 4.3, 5.3, 9.2) ─
  // Sort state (declared here so form/delete handlers can reference it)
  let currentSortBy = 'date';
  let currentSortOrder = 'desc';

  const form = document.getElementById('transaction-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const itemName = uiManager.itemNameInput.value.trim();
      const amount = parseFloat(uiManager.amountInput.value);
      const category = uiManager.categoryInput.value;

      const result = transactionManager.addTransaction(itemName, amount, category);

      if (result.success) {
        // Clear any previous error message (Req 8.4: visual feedback)
        uiManager.errorMessageContainer.hidden = true;
        uiManager.errorMessageContainer.textContent = '';
        uiManager.clearForm();
        uiManager.renderTransactionList(transactionManager.getSortedTransactions(currentSortBy, currentSortOrder));
        uiManager.updateBalance();
        uiManager.updateChart();
        uiManager.updateSpendingLimit(spendingLimit);
        uiManager.renderMonthlySummary(currentMonthKey);
      } else {
        uiManager.showError(result.error);
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      uiManager.showError('An unexpected error occurred. Please try again.');
    }
  });

  // ── 6. Delete button handler via event delegation (Req 3.1–3.4, 2.4, 4.4, 5.4, 9.2) ─
  uiManager.transactionListContainer.addEventListener('click', (e) => {
    if (!e.target.classList.contains('delete-btn')) return;
    try {
      const id = e.target.dataset.transactionId;
      const result = transactionManager.deleteTransaction(id);

      if (result.success) {
        uiManager.renderTransactionList(transactionManager.getSortedTransactions(currentSortBy, currentSortOrder));
        uiManager.updateBalance();
        uiManager.updateChart();
        uiManager.updateSpendingLimit(spendingLimit);
        uiManager.renderMonthlySummary(currentMonthKey);
      } else {
        uiManager.showError(result.error);
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      uiManager.showError('An unexpected error occurred while deleting. Please try again.');
    }
  });

  // Spending limit
  const setLimitBtn = document.getElementById('set-limit-btn');
  if (setLimitBtn) {
    setLimitBtn.addEventListener('click', () => {
      const val = parseFloat(document.getElementById('spending-limit-input').value);
      if (isNaN(val) || val < 0) {
        uiManager.showError('Batas pengeluaran harus berupa angka positif');
        return;
      }
      spendingLimit = val;
      spendingLimitStorage.save(spendingLimit);
      uiManager.updateSpendingLimit(spendingLimit);
    });
  }

  // Sort controls
  const sortBySelect = document.getElementById('sort-by');
  const sortOrderBtn = document.getElementById('sort-order-btn');

  if (sortBySelect) {
    sortBySelect.addEventListener('change', () => {
      currentSortBy = sortBySelect.value;
      const sorted = transactionManager.getSortedTransactions(currentSortBy, currentSortOrder);
      uiManager.renderTransactionList(sorted);
    });
  }
  if (sortOrderBtn) {
    sortOrderBtn.addEventListener('click', () => {
      currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
      sortOrderBtn.textContent = currentSortOrder === 'asc' ? '↑' : '↓';
      const sorted = transactionManager.getSortedTransactions(currentSortBy, currentSortOrder);
      uiManager.renderTransactionList(sorted);
    });
  }

  // Monthly navigation
  const prevMonthBtn = document.getElementById('prev-month-btn');
  const nextMonthBtn = document.getElementById('next-month-btn');

  function changeMonth(delta) {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    currentMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    uiManager.renderMonthlySummary(currentMonthKey);
  }
  if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));
  } catch (err) {
    console.error('Application initialization error:', err);
    const errEl = document.getElementById('error-message');
    if (errEl) {
      errEl.textContent = 'The application failed to initialize. Please refresh the page.';
      errEl.hidden = false;
    }
  }
}

// ── 7. Bootstrap on DOMContentLoaded (Req 2.5, 4.5) ───────────────────────────
document.addEventListener('DOMContentLoaded', initApp);
