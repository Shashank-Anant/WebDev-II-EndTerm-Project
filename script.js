/*
 * RupeeWise Expense Tracker
 *
 * - Vanilla JS DOM app with localStorage
 * - Supports dynamic custom categories using "Other" + typed value
 * - Adds custom category to dropdown + filter buttons and persists it
 */

(function () {
  // ======================== State Management ===============================
  let expenses;
  try {
    const stored = JSON.parse(localStorage.getItem("expenses") || "[]");
    expenses = Array.isArray(stored) ? stored : [];
  } catch {
    expenses = [];
  }

  let currentFilter = "All";
  let editId = null;
  let lastDeleted = null;

  // ========================= Element Selectors ============================
  const form = document.getElementById("form");
  const titleInput = document.getElementById("title");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const typeInput = document.getElementById("type");
  const noteInput = document.getElementById("note");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const listEl = document.getElementById("list");
  const filterContainer = document.getElementById("filterContainer");
  const errorEl = document.getElementById("error");
  const themeToggle = document.getElementById("themeToggle");

  // ========================== Persistence Helpers =========================
  function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  function saveTheme(theme) {
    localStorage.setItem("theme", theme);
  }

  function loadTheme() {
    const theme = localStorage.getItem("theme");
    if (theme === "light") document.body.classList.add("light");
  }

  // ========================= Dynamic Category Helpers ======================

  /**
   * Add a custom category to:
   * 1) The dropdown (before "Other")
   * 2) The filter button list
   */
  function addCategoryOption(customType) {
    const trimmed = customType.trim();
    if (!trimmed) return;

    // Avoid duplicates in dropdown
    const existsInSelect = Array.from(categoryInput.options)
      .some(opt => opt.value === trimmed || opt.textContent === trimmed);

    if (!existsInSelect) {
      const opt = document.createElement("option");
      opt.value = trimmed;
      opt.textContent = trimmed;

      // Insert before "Other" if possible
      const otherOpt = Array.from(categoryInput.options)
        .find(o => o.value === "Other" || o.textContent === "Other");

      if (otherOpt) categoryInput.insertBefore(opt, otherOpt);
      else categoryInput.appendChild(opt);
    }

    // Avoid duplicates in filter buttons
    const existsInFilters = filterContainer.querySelector(`button[data-filter="${CSS.escape(trimmed)}"]`);
    if (!existsInFilters) {
      const btn = document.createElement("button");
      btn.setAttribute("data-filter", trimmed);
      btn.textContent = trimmed;
      filterContainer.appendChild(btn);
    }
  }

  /**
   * If category is Other, replace it with the typed note (custom type).
   * Also clears note so it doesn't show as a separate line.
   */
  function handleCustomCategory(expense) {
    if (expense.category !== "Other") return;

    const customType = (expense.note || "").trim();

    // Block reserved values
    const reserved = ["All", "Other", "Select Category"];
    if (reserved.includes(customType)) {
      errorEl.textContent = `Type cannot be "${customType}". Please enter a different name.`;
      return false;
    }

    if (customType) {
      expense.category = customType;
      expense.note = ""; // prevent showing it as a separate note line
      addCategoryOption(customType);
      return true;
    }

    // If empty, fail validation
    errorEl.textContent = "Type is required for Other category";
    return false;
  }

  /**
   * On load: scan stored expenses and add any custom categories to UI.
   */
  function initCustomCategories() {
    const defaults = ["Food", "Transport", "Shopping", "Other"];
    expenses.forEach(ex => {
      if (ex.category && !defaults.includes(ex.category)) {
        addCategoryOption(ex.category);
      }
    });
  }

  // ======================== Rendering Logic ===============================
  function render() {
    listEl.textContent = "";

    let visible = expenses;
    if (currentFilter !== "All") {
      visible = visible.filter(ex => ex.category === currentFilter);
    }

    const search = document.getElementById("search").value.toLowerCase();
    if (search) {
      visible = visible.filter(ex =>
        ex.title.toLowerCase().includes(search) ||
        ex.category.toLowerCase().includes(search)
      );
    }

    document.getElementById("empty").style.display = visible.length ? "none" : "block";

    visible.forEach(ex => {
      const li = document.createElement("li");
      li.dataset.id = ex.id;
      if (editId === ex.id) li.classList.add("is-editing");

      li.innerHTML = `
        <div class="expense-top">
          <span>${ex.title} • ${ex.category} <span class="badge">${ex.type}</span></span>
          <span class="amount">₹${Number(ex.amount).toFixed(2)}</span>
        </div>
        <div class="meta">${new Date(ex.date).toLocaleString()}</div>
        ${ex.note ? `<div class="note">${ex.note}</div>` : ""}
        <div class="actions">
          <button class="edit">Edit</button>
          <button class="del">Delete</button>
        </div>
      `;

      listEl.appendChild(li);
    });

    const total = expenses.reduce((sum, ex) => sum + Number(ex.amount), 0);
    document.getElementById("total").textContent = `Total: ₹${total.toFixed(2)}`;
    document.getElementById("count").textContent = `Entries: ${expenses.length}`;
    document.getElementById("bar").style.width = Math.min((total / 50000) * 100, 100) + "%";
  }

  // ======================== CRUD Operations ===============================
  function resetUI() {
    editId = null;
    form.reset();
    submitBtn.textContent = "Add Expense";
    submitBtn.style.background = "var(--primary)";
    cancelBtn.style.display = "none";

    noteInput.style.display = "none";
    noteInput.required = false;
    noteInput.value = "";

    errorEl.textContent = "";
  }

  function updateFilter(cat) {
    currentFilter = cat;
    document.querySelectorAll(".filters button").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-filter") === cat);
    });
    render();
  }

  function showPopup(msg) {
    const p = document.getElementById("popup");
    p.textContent = msg;
    p.style.display = "block";
    setTimeout(() => (p.style.display = "none"), 2000);
  }

  function startEdit(id) {
    const item = expenses.find(ex => ex.id === id);
    if (!item) return;

    editId = id;
    titleInput.value = item.title;
    amountInput.value = item.amount;

    // Ensure custom category exists in dropdown
    addCategoryOption(item.category);
    categoryInput.value = item.category;

    typeInput.value = item.type;

    // Since we convert "Other" to custom category, note is typically empty
    noteInput.value = item.note || "";
    noteInput.style.display = (categoryInput.value === "Other") ? "block" : "none";
    noteInput.required = (categoryInput.value === "Other");

    submitBtn.textContent = "Save Changes";
    submitBtn.style.background = "var(--accent)";
    cancelBtn.style.display = "block";

    window.scrollTo({ top: 0, behavior: "smooth" });
    render();
  }

  function deleteItem(id) {
    lastDeleted = expenses.find(ex => ex.id === id);
    expenses = expenses.filter(ex => ex.id !== id);

    saveExpenses();
    render();

    const snack = document.getElementById("snackbar");
    snack.style.display = "flex";
    setTimeout(() => (snack.style.display = "none"), 5000);
  }

  function undoAction() {
    if (lastDeleted) {
      expenses.unshift(lastDeleted);
      lastDeleted = null;
      saveExpenses();
      render();
      document.getElementById("snackbar").style.display = "none";
      showPopup("Restored ⬅️");
    }
  }

  // ========================= Event Listeners ==============================
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    // Category validation (placeholder)
    if (!categoryInput.value || categoryInput.value === "Select Category") {
      errorEl.textContent = "Please select a category";
      return;
    }

    // Amount validation
    if (Number(amountInput.value) <= 0) {
      errorEl.textContent = "Amount must be greater than 0";
      return;
    }

    if (editId) {
      expenses = expenses.map(ex => {
        if (ex.id === editId) {
          const updated = {
            ...ex,
            title: titleInput.value,
            amount: amountInput.value,
            category: categoryInput.value,
            type: typeInput.value,
            note: noteInput.value,
          };

          // If category is Other, convert it to custom category
          if (updated.category === "Other") {
            const ok = handleCustomCategory(updated);
            if (!ok) return ex; // keep old if validation fails
          }

          return updated;
        }
        return ex;
      });

      showPopup("Expense updated! ✏️");
    } else {
      const newExpense = {
        id: Date.now(),
        title: titleInput.value,
        amount: amountInput.value,
        category: categoryInput.value,
        type: typeInput.value,
        note: noteInput.value,
        date: new Date(),
      };

      if (newExpense.category === "Other") {
        const ok = handleCustomCategory(newExpense);
        if (!ok) return;
      }

      expenses.unshift(newExpense);
      showPopup("Expense added! ✅");
    }

    resetUI();
    saveExpenses();
    render();
  });

  cancelBtn.addEventListener("click", resetUI);
  document.getElementById("undoBtn").addEventListener("click", undoAction);
  document.getElementById("search").addEventListener("input", render);

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    saveTheme(document.body.classList.contains("light") ? "light" : "dark");
  });

  categoryInput.addEventListener("change", () => {
    const show = categoryInput.value === "Other";
    noteInput.style.display = show ? "block" : "none";
    noteInput.required = show;

    if (!show) noteInput.value = "";
    errorEl.textContent = "";
  });

  filterContainer.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      updateFilter(e.target.getAttribute("data-filter"));
    }
  });

  listEl.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;

    const id = Number(li.dataset.id);

    if (e.target.classList.contains("edit")) startEdit(id);
    if (e.target.classList.contains("del")) deleteItem(id);
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undoAction();
    }
    if (e.key === "Escape") resetUI();
  });

  // ====================== Initialisation ================================
  loadTheme();
  initCustomCategories();
  render();
})();
