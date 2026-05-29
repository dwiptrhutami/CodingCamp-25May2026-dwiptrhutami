# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, client-side web application that helps users track their daily spending. It provides an input form for recording transactions (each carrying a name, amount, category, and date), a scrollable and sortable transaction history, a live total balance display, a monthly summary card, a pie chart that visualizes spending distribution by category, a spending-limit highlight feature, and a dark/light mode toggle. The application runs entirely in the browser with no backend server; all data is persisted using the browser's Local Storage API. The final file structure places styles in `css/style.css`, logic in `js/app.js`, and documentation in `README.md`, all loaded by a single `index.html`.

---

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single spending record consisting of an item name, a positive monetary amount, a category, and a date. The Transaction object shape is `{ id, name, amount, category, date }` where `date` is stored as an ISO 8601 string.
- **Category**: One of three fixed spending labels — Food, Transport, or Fun.
- **Transaction List**: The scrollable UI component that displays all stored Transactions.
- **Balance Display**: The UI element at the top of the page that shows the cumulative total of all Transaction amounts.
- **Pie Chart**: The Chart.js-powered doughnut/pie visualization that shows spending distribution by Category.
- **Local Storage**: The browser's `localStorage` API used for client-side data persistence.
- **Input Form**: The UI form containing the Item Name field, Amount field, Category selector, and Add Transaction button.
- **Renderer**: The JavaScript module responsible for updating the DOM whenever application state changes.
- **Validator**: The logic responsible for checking that all Input Form fields contain valid values before a Transaction is added.
- **Monthly Summary Card**: The UI section that displays total spending, transaction count, and highest-spending Category for the current calendar month.
- **Sort Dropdown**: The UI control above the Transaction List that determines the display order of Transactions.
- **Spending Limit**: A user-defined monetary threshold; Transactions whose individual amount exceeds this value are visually highlighted.
- **Theme**: The active color scheme of the App — either "light" or "dark".
- **Theme Toggle**: The UI switch that alternates the App between light and dark Theme.
- **Controls Section**: The UI area containing the Spending Limit input, Sort Dropdown, and Theme Toggle.
- **README**: The `README.md` file in the project root that documents the project for developers.

---

## Requirements

### Requirement 1: Input Form — Transaction Entry

**User Story:** As a user, I want to fill in an item name, amount, category, and date and submit the form, so that I can record a new spending transaction.

#### Acceptance Criteria

1. THE App SHALL render an Input Form containing a text field for Item Name, a numeric field for Amount, a Category selector with options Food, Transport, and Fun, and an Add Transaction button.
2. WHEN the user submits the Input Form with all fields filled and a valid positive Amount, THE Renderer SHALL add the new Transaction to the Transaction List and update the Balance Display, Pie Chart, and Monthly Summary Card before the next user interaction is processed.
3. IF the Item Name field is empty when the form is submitted, THEN THE Validator SHALL call `alert("Please fill all fields")`, display an inline error message identifying the Item Name field as required, and set focus to the Item Name field without adding a Transaction.
4. IF the Amount field is empty, zero, negative, or non-numeric when the form is submitted, THEN THE Validator SHALL call `alert("Please fill all fields")`, display an inline error message identifying the Amount field as invalid, and set focus to the Amount field without adding a Transaction.
5. IF no Category is selected when the form is submitted, THEN THE Validator SHALL call `alert("Please fill all fields")` and display an inline error message identifying the Category field as required without adding a Transaction.
6. WHEN a Transaction is successfully added, THE Input Form SHALL clear the Item Name and Amount fields and retain focus on the Item Name field.
7. THE Input Form SHALL accept Item Name values up to 60 characters in length.
8. THE Input Form SHALL accept Amount values with up to two decimal places, a minimum value of 0.01, and a maximum value of 999,999,999.99.
9. WHEN a Transaction is created, THE App SHALL record the current date as a JavaScript `Date` object serialized to an ISO 8601 string and store it in the Transaction's `date` field.

---

### Requirement 2: Transaction List — History Display

**User Story:** As a user, I want to see a scrollable list of all my recorded transactions with their dates, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction List SHALL display every stored Transaction showing the item name, monetary amount formatted as USD currency, category label, and date.
2. WHILE the Transaction List contains more items than fit in the visible area, THE Transaction List SHALL scroll vertically and the page SHALL NOT grow taller or display a horizontal scrollbar as a result.
3. WHEN a new Transaction is added and the active sort order is "Newest First", THE Renderer SHALL prepend the new Transaction to the top of the Transaction List so the most recent entry appears first.
4. THE Transaction List component SHALL always be present in the DOM.
5. WHEN the Transaction List contains no Transactions, THE App SHALL display the text "No transactions yet." inside the Transaction List component in place of the list items.
6. THE Transaction List SHALL render each Transaction with a Delete button; WHEN the Delete button is activated via keyboard, THE App SHALL delete the corresponding Transaction; THE Delete button SHALL have an accessible name that identifies the Transaction it deletes.

---

### Requirement 3: Transaction Deletion

**User Story:** As a user, I want to delete a transaction from the list, so that I can correct mistakes or remove unwanted entries.

#### Acceptance Criteria

1. WHEN the user activates the Delete button for a Transaction, THE App SHALL immediately remove that Transaction from the Transaction List without displaying a confirmation dialog.
2. WHEN a Transaction is deleted, THE App SHALL update the Balance Display, recalculate and update the Pie Chart data, and update the Monthly Summary Card without a page reload.
3. WHEN a Transaction is deleted, THE App SHALL persist the updated Transaction collection to Local Storage so the deletion survives a page reload.
4. IF deleting a Transaction results in an empty Transaction List, THEN THE App SHALL hide the Pie Chart canvas and its legend and display the text "No data yet." in the chart area.
5. IF writing to Local Storage fails during a deletion, THEN THE App SHALL retain the deletion in memory (the Transaction SHALL remain removed from the in-memory list and the UI) and SHALL NOT throw an unhandled exception.

---

### Requirement 4: Total Balance Display

**User Story:** As a user, I want to see my total spending balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance Display SHALL show the sum of all Transaction amounts formatted as USD currency, rounded to 2 decimal places, with a thousands separator (e.g., `$12.50`, `$1,234.56`).
2. WHEN a Transaction is added or deleted, THE Renderer SHALL recalculate and update the Balance Display without requiring a page reload.
3. WHEN the Balance Display total equals zero (including when no Transactions exist), THE Balance Display SHALL show `$0.00`.
4. THE Balance Display SHALL be visible above the Input Form at viewport widths from 320px to 1920px.

---

### Requirement 5: Pie Chart — Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going at a glance.

#### Acceptance Criteria

1. THE Pie Chart SHALL display one segment per Category that has at least one Transaction, sized proportionally to that Category's share of total spending.
2. WHEN a Transaction is added or deleted, THE App SHALL update the Pie Chart data and re-render the chart without a page reload.
3. THE Pie Chart SHALL use distinct, consistent colors per Category: Food uses `#3b82f6`, Transport uses `#f59e0b`, and Fun uses `#8b5cf6`.
4. THE Pie Chart SHALL display a legend below the chart identifying each Category by color and label.
5. WHEN the Pie Chart canvas is hidden, THE App SHALL also hide the legend.
6. WHEN the user hovers over a Pie Chart segment, THE Pie Chart SHALL display a tooltip showing the monetary amount formatted as USD currency and the percentage share for that Category rounded to one decimal place.
7. WHEN no Transactions exist, THE App SHALL hide the Pie Chart canvas and its legend and display the text "No data yet." in the chart area.
8. THE App SHALL load the Chart.js library (version 4.x) from a CDN without requiring a local installation or build step.
9. IF the Chart.js CDN script fails to load, THEN THE App SHALL display a message in the chart area indicating the chart is unavailable and SHALL NOT throw an unhandled exception.

---

### Requirement 6: Data Persistence

**User Story:** As a user, I want my transactions, spending limit, and theme preference to be saved automatically, so that my data and settings are still available after I close or refresh the browser tab.

#### Acceptance Criteria

1. WHEN a Transaction is added, THE App SHALL synchronously serialize the full Transaction collection to Local Storage under the key `eviz_transactions` within the same call stack as the state update.
2. WHEN a Transaction is deleted, THE App SHALL synchronously serialize the updated Transaction collection to Local Storage under the key `eviz_transactions` within the same call stack as the state update.
3. WHEN the App initializes, THE App SHALL deserialize the Transaction collection from Local Storage under the key `eviz_transactions` and restore all previously saved Transactions before rendering; any individual entry missing the required fields (`id`, `name`, `amount`, `category`, `date`) SHALL be discarded without discarding the remaining valid entries.
4. WHEN the Spending Limit is changed, THE App SHALL synchronously persist the Spending Limit value to Local Storage under a consistent key within the same call stack as the state update.
5. WHEN the Theme is toggled, THE App SHALL synchronously persist the Theme preference to Local Storage under a consistent key within the same call stack as the state update.
6. WHEN the App initializes, THE App SHALL restore the Spending Limit and Theme preference from Local Storage before rendering any UI components.
7. IF Local Storage is unavailable, the stored data cannot be parsed, or any other error occurs during initialization, THEN THE App SHALL render an empty Transaction List, keep the Input Form interactive, apply the default light Theme, and SHALL NOT propagate an unhandled exception.
8. IF a write to Local Storage fails during a save operation, THEN THE App SHALL retain the current in-memory state and SHALL NOT propagate an unhandled exception.
9. THE App SHALL store all data client-side only; no data SHALL be transmitted to any external server.

---

### Requirement 7: Responsive Layout and Visual Design

**User Story:** As a user, I want the app to look clean and work well on both desktop and mobile screens, so that I can use it comfortably on any device.

#### Acceptance Criteria

1. THE App SHALL render a layout at all viewport widths from 320px to 1440px in which no element overflows its container, no body text is truncated, and all interactive controls are reachable without horizontal scrolling.
2. WHEN the viewport width is greater than 420px and at most 700px, THE Input Form fields SHALL reflow to a two-column grid and the Add Transaction button SHALL span the full width of the form.
3. WHEN the viewport width is 420px or less, THE Input Form fields SHALL reflow to a single-column stack and the Add Transaction button SHALL span the full width of the form.
4. WHEN the viewport width is 700px or less, THE Transaction List and Pie Chart SHALL stack vertically in a single-column layout.
5. WHEN the viewport width is greater than 700px, THE Transaction List and Pie Chart SHALL be displayed side by side in a two-column layout.
6. THE App SHALL apply consistent visual design tokens: background color `#f4f4f4`, surface color `#ffffff`, primary blue `#2196f3`, danger red `#f44336`, border radius `14px`, and a visible box shadow on all card components.
7. THE App SHALL use a system font stack (`'Segoe UI', system-ui, -apple-system, sans-serif`) for all text.
8. THE App SHALL display the title "Expense & Budget Visualizer" centered at the top of the page.
9. THE Controls Section SHALL be rendered as a distinct UI area containing the Spending Limit input, Sort Dropdown, and Theme Toggle.

---

### Requirement 8: File Structure and Technology Constraints

**User Story:** As a developer, I want the project to follow a defined file structure and technology stack, so that the codebase is easy to maintain and extend.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no frontend frameworks, transpilers, or build tools required.
2. THE App SHALL contain exactly one CSS file located at `css/style.css`.
3. THE App SHALL contain exactly one JavaScript file located at `js/app.js`.
4. THE App SHALL contain a README file located at `README.md` in the project root.
5. THE project folder structure SHALL be:
   ```
   project-folder/
   ├── index.html
   ├── css/
   │   └── style.css
   ├── js/
   │   └── app.js
   └── README.md
   ```
6. THE App SHALL be loadable by opening `index.html` directly in a browser without a local server.
7. THE App SHALL function completely without any server dependency for core functionality (form submission, list rendering, balance calculation, chart rendering, and data persistence).
8. THE App SHALL produce no JavaScript errors and render all core UI components correctly in the current stable releases of Chrome, Firefox, Edge, and Safari (as of the project submission date).
9. THE App SHALL require no package installation, environment configuration, or test setup to run; opening `index.html` in a supported browser SHALL be sufficient to use the App.
10. THE `js/app.js` file SHALL implement the following named functions: `addTransaction()`, `deleteTransaction()`, `updateBalance()`, `updateChart()`, `updateMonthlySummary()`, `sortTransactions()`, `checkSpendingLimit()`, `saveToLocalStorage()`, `loadFromLocalStorage()`, and `toggleTheme()`.

---

### Requirement 9: Monthly Summary Card

**User Story:** As a user, I want to see a summary of my spending for the current month, so that I can quickly understand my recent financial activity.

#### Acceptance Criteria

1. THE App SHALL render a Monthly Summary Card that displays the total spending amount for the current calendar month formatted as USD currency, the number of Transactions recorded in the current calendar month, and the Category with the highest total spending in the current calendar month; IF two Categories share the highest total, THE App SHALL display the one that comes first alphabetically.
2. WHEN determining whether a Transaction belongs to the current calendar month, THE App SHALL include the Transaction if and only if its `date` field matches both the same calendar year and the same calendar month as the device's local date at the time of calculation.
3. WHEN a Transaction is added, THE Renderer SHALL recalculate and update the Monthly Summary Card without a page reload.
4. WHEN a Transaction is deleted, THE Renderer SHALL recalculate and update the Monthly Summary Card without a page reload.
5. WHEN no Transactions exist for the current calendar month, THE Monthly Summary Card SHALL display `$0.00` for total spending, `0` for transaction count, and "N/A" for highest spending Category.
6. THE Monthly Summary Card component SHALL always be present in the DOM.
7. WHEN the App initializes and restores Transactions from Local Storage, THE App SHALL recalculate and render the Monthly Summary Card from the restored data before the first user interaction is processed.

---

### Requirement 10: Sort Transactions

**User Story:** As a user, I want to sort my transaction list by different criteria, so that I can find and review transactions more easily.

#### Acceptance Criteria

1. THE App SHALL render a Sort Dropdown above the Transaction List containing the options: "Newest First", "Highest Amount", "Lowest Amount", and "Category A-Z".
2. WHEN the user selects a sort option, THE Renderer SHALL re-render the Transaction List in the selected order before the next user interaction is processed.
3. THE Sort Dropdown SHALL default to "Newest First" on initial page load.
4. WHEN the sort order is "Newest First", THE Transaction List SHALL display Transactions ordered by `date` descending (most recent first); IF two Transactions share the same `date` value, they SHALL be ordered by `id` descending as a tiebreaker.
5. WHEN the sort order is "Highest Amount", THE Transaction List SHALL display Transactions ordered by `amount` descending; IF two Transactions share the same `amount`, they SHALL be ordered by `date` descending as a tiebreaker.
6. WHEN the sort order is "Lowest Amount", THE Transaction List SHALL display Transactions ordered by `amount` ascending; IF two Transactions share the same `amount`, they SHALL be ordered by `date` descending as a tiebreaker.
7. WHEN the sort order is "Category A-Z", THE Transaction List SHALL display Transactions ordered by `category` alphabetically ascending using case-insensitive comparison; IF two Transactions share the same `category`, they SHALL be ordered by `date` descending as a tiebreaker.
8. THE sort order SHALL affect only the display order of the Transaction List; THE App SHALL NOT reorder the Transaction collection stored in Local Storage as a result of a sort operation.

---

### Requirement 11: Spending Alert — Highlight Over Limit

**User Story:** As a user, I want to set a spending limit so that transactions exceeding that limit are visually highlighted, helping me identify high-cost items at a glance.

#### Acceptance Criteria

1. THE App SHALL render a Spending Limit input field in the Controls Section where the user can enter a positive monetary threshold with a maximum value of 999,999,999.99.
2. WHEN a Transaction's individual `amount` exceeds the active Spending Limit, THE Renderer SHALL apply the CSS class `over-limit` to that Transaction's list item.
3. WHEN a Transaction's individual `amount` does not exceed the active Spending Limit, THE Renderer SHALL NOT apply the `over-limit` CSS class to that Transaction's list item.
4. WHEN the Spending Limit value is changed, THE Renderer SHALL re-evaluate and update the `over-limit` highlight on all visible Transaction list items within the same render cycle, before the next user interaction is processed.
5. WHEN a Transaction is added or deleted, THE Renderer SHALL re-evaluate the `over-limit` highlight for all visible Transaction list items against the current Spending Limit.
6. WHEN the App initializes, THE App SHALL restore the Spending Limit from Local Storage and apply the `over-limit` highlight to all qualifying Transactions before any Transaction list items are painted to the screen.
7. WHILE the Spending Limit field is empty, zero, or contains a non-positive or non-numeric value, THE App SHALL NOT apply the `over-limit` highlight to any Transaction.
8. IF the user enters a negative, zero, or non-numeric value in the Spending Limit field, THEN THE App SHALL clear the Spending Limit, remove the `over-limit` highlight from all Transaction list items, and remove the Spending Limit from Local Storage.

---

### Requirement 12: Dark / Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL render a Theme Toggle switch in the Controls Section whose visual state (checked/unchecked or on/off) reflects the currently active Theme.
2. WHEN the user activates the Theme Toggle, THE App SHALL switch the active Theme within 100 ms without a page reload.
3. WHEN the Theme switches, THE App SHALL apply a CSS transition of 200 ms duration to background and text color changes so that the switch animates smoothly.
4. WHILE the dark Theme is active, THE App SHALL apply a `dark` CSS class to the `<body>` element and use dark palette tokens that maintain a minimum contrast ratio of 4.5:1 (WCAG AA) between text and background colors.
5. WHEN the App initializes, THE App SHALL read the Theme preference from Local Storage and apply the saved Theme by adding or removing the `dark` class on `<body>` before any visible UI components are rendered, so that no flash of the wrong theme occurs on page load.
6. WHEN no Theme preference is stored in Local Storage, THE App SHALL default to the light Theme on initialization.

---

### Requirement 13: Transaction Date Field

**User Story:** As a user, I want each transaction to record the date it was added, so that I can see when each expense occurred.

#### Acceptance Criteria

1. THE App SHALL store each Transaction as an object with the shape `{ id, name, amount, category, date }` where `date` is a JavaScript `Date` serialized as an ISO 8601 string.
2. THE Transaction List SHALL display the `date` field for every Transaction formatted as a human-readable locale date string (e.g., "May 30, 2026") alongside the item name, amount, and category.
3. WHEN the App loads Transactions from Local Storage, THE App SHALL discard any Transaction entry whose `date` field is absent, null, an empty string, or cannot be parsed as a valid date; the remaining valid Transactions SHALL still be loaded and rendered.
4. WHEN a new Transaction is created, THE App SHALL set the `date` field to the ISO 8601 string representation of the current date and time at the moment of creation.

---

### Requirement 14: README Deliverable

**User Story:** As a developer, I want a README file in the project root, so that anyone can understand the project and run or deploy it without additional guidance.

#### Acceptance Criteria

1. THE README SHALL be located at `README.md` in the project root directory.
2. THE README SHALL contain a project description section that explains the purpose of the App.
3. THE README SHALL contain a features list section that enumerates: Add Transaction, Delete Transaction, Total Balance Display, Monthly Summary Card, Pie Chart by Category, Sort Transactions, Spending Alert Highlight, Dark/Light Mode Toggle, and Local Storage Persistence.
4. THE README SHALL contain a "How to run locally" section that includes at minimum: (a) clone or download the repository, (b) open `index.html` in a supported browser, (c) no server or installation required.
5. THE README SHALL contain a "GitHub Pages deployment" section that includes at minimum: (a) push all files to a GitHub repository, (b) navigate to repository Settings → Pages, (c) set the source branch to `main` (or `master`) and the folder to root `/`, (d) save and access the published URL.
