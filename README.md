# RupeeWise — Expense Tracker (Vanilla JS + DOM)

RupeeWise is a fully functional, browser-based expense tracking web app built using **HTML, CSS, and Vanilla JavaScript**. It helps users record expenses in ₹, filter and search entries, edit/delete with undo, and persist data using `localStorage` — all with deep DOM manipulation and event-driven UI updates.

---

## Project Description

RupeeWise lets users:
- Add expenses with amount (supports decimals), category, payment type, and optional notes
- View a live-updating list of expenses
- Track total spending, number of entries, and a progress bar toward a limit
- Filter and search expenses instantly
- Edit and delete entries (with Undo)

Everything runs in the browser with no frameworks or backend.

---

## Problem Statement

Tracking daily spending is often messy and time-consuming when using notes apps or spreadsheets. RupeeWise solves this by providing a fast, interactive UI to record expenses, organize them by categories, and retrieve them quickly — while maintaining state across refreshes.

---

## Features Implemented

### ✅ Core Expense Features
- Add expenses (Title, Amount in ₹, Category, Cash/Online)
- **Decimal amount support** (₹12.50, ₹99.99, etc.)
- Edit existing expense entries (form auto-fills + UI edit state)
- Delete expenses
- Undo delete (Snackbar + `Ctrl + Z` support)

### ✅ Organization & Discovery
- Filter by category using buttons (All, Food, Transport, Shopping + custom)
- Live search (filters list while typing)
- Empty-state message when there are no matching expenses

### ✅ Smart Category Feature (Deep DOM)
- Selecting **Other** and typing a custom type (e.g., *Medical*) will:
  - Display the expense as `Expense • Medical` (instead of `Other`)
  - Automatically add **Medical** to the category dropdown for future use
  - Persist custom categories across refresh using stored data

### ✅ UI/UX Enhancements
- Dark/Light theme toggle (saved in `localStorage`)
- Popup feedback on add/update/restore actions
- Responsive layout (works on smaller screens)
- Progress bar updates based on total spend

---

## DOM Concepts Used

This project heavily uses DOM manipulation and event-driven logic, including:

- **Creating elements dynamically**
  - `document.createElement()`, `appendChild()`, dynamic `<li>` generation
  - Dynamic creation of `<option>` elements for custom categories
  - Dynamic creation of filter buttons for new categories (if enabled)

- **Updating DOM based on state**
  - Conditional rendering for filtered/search results
  - Live updating totals, entry count, progress bar width
  - Showing/hiding UI elements (note input, cancel edit, snackbar, empty state)

- **Removing/toggling elements**
  - Removing list items on delete
  - Undo restores previously deleted item

- **Event handling**
  - Form submit
  - Button clicks (edit/delete/filters)
  - Input events (search typing)
  - Keyboard shortcuts (`Ctrl+Z`, `Escape`)
  - Theme toggle

- **Event delegation**
  - Filters container uses a single click listener
  - Expense list uses delegation for Edit/Delete buttons

- **Client-side state handling**
  - `expenses[]`, `currentFilter`, `editId`, `lastDeleted`
  - State updates re-render UI instantly

---

## Steps to Run the Project

1. Download or clone this repository.
2. Open the folder.
3. Run the app by opening:

   - `index.html` directly in a browser  
   **OR**
   - Use a local server (recommended):
     - VS Code → install “Live Server”
     - Right-click `index.html` → “Open with Live Server”

---

## Known Limitations

- Data is stored in **localStorage**, so it is device/browser-specific (no cloud sync).
- Progress bar limit is currently fixed (example: ₹50,000) unless changed in code.
- No export feature (CSV/PDF) yet.
- Filtering is exact match by category (no multi-category filter at the same time).

---

## Tech Stack

- HTML5
- CSS3 (Flexbox/Grid + theme variables)
- Vanilla JavaScript (ES6+)
- Browser APIs: LocalStorage

---

## Demo Video



---

## Author

Shashank (Batch 2029)
