# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, client-side web application that helps users track their daily spending. It provides an input form for recording transactions, a scrollable transaction history, a live total balance display, and a pie chart that visualizes spending distribution by category. The application runs entirely in the browser with no backend server; all data is persisted using the browser's Local Storage API. The final file structure places styles in `css/style.css` and logic in `js/app.js`, loaded by a single `index.html`.

---

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single spending record consisting of an item name, a positive monetary amount, and a category.
- **Category**: One of three fixed spending labels — Food, Transport, or Fun.
- **Transaction List**: The scrollable UI component that displays all stored transactions.
- **Balance Display**: The UI element at the top of the page that shows the cumulative total of all transaction amounts.
- **Pie Chart**: The Chart.js-powered doughnut/pie visualization that shows spending distribution by category.
- **Local Storage**: The browser's `localStorage` API used for client-side data persistence.
- **Input Form**: The UI form containing the Item Name field, Amount field, Category selector, and Add button.
- **Renderer**: The JavaScript module responsible for updating the DOM whenever application state changes.
- **Validator**: The logic responsible for checking that all Input Form fields contain valid values before a transaction is added.

---

## Requirements

### Requirement 1: Input Form — Transaction Entry

**User Story:** As a user, I want to fill in an item name, amount, and category and submit the form, so that I can record a new spending transaction.

#### Acceptance Criteria

1. THE App SHALL render an Input Form containing a text field for Item Name, a numeric field for Amount, a Category selector with options Food, Transport, and Fun, and an Add Transaction button.
2. WHEN the user submits the Input Form with all fields filled and a valid positive Amount, THE Renderer SHALL add the new Transaction to the Transaction List and update the Balance Display and Pie Chart immediately.
3. WHEN the user submits the Input Form, THE Validator SHALL verify that the Item Name field is not empty, the Amount field contains a positive numeric value greater than zero, and a Category is selected.
4. IF the Item Name field is empty when the form is submitted, THEN THE Validator SHALL display an inline error message and set focus to the Item Name field without adding a Transaction.
5. IF the Amount field is empty, zero, negative, or non-numeric when the form is submitted, THEN THE Validator SHALL display an inline error message and set focus to the Amount field without adding a Transaction.
6. WHEN a Transaction is successfully added, THE Input Form SHALL clear the Item Name and Amount fields and retain focus on the Item Name field.
7. THE Input Form SHALL accept Item Name values up to 60 characters in length.
8. THE Input Form SHALL accept Amount values with up to two decimal places and a minimum value of 0.01.

---

### Requirement 2: Transaction List — History Display

**User Story:** As a user, I want to see a scrollable list of all my recorded transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction List SHALL display every stored Transaction showing the item name, monetary amount formatted as USD currency, and category label.
2. WHILE the Transaction List contains more items than fit in the visible area, THE Transaction List SHALL be scrollable vertically without affecting the rest of the page layout.
3. WHEN a new Transaction is added, THE Renderer SHALL prepend the new Transaction to the top of the Transaction List so the most recent entry appears first.
4. WHEN the Transaction List contains no Transactions, THE App SHALL display an empty-state message in place of the list.
5. THE Transaction List SHALL render each Transaction with a Delete button that is accessible via keyboard and screen readers.

---

### Requirement 3: Transaction Deletion

**User Story:** As a user, I want to delete a transaction from the list, so that I can correct mistakes or remove unwanted entries.

#### Acceptance Criteria

1. WHEN the user activates the Delete button for a Transaction, THE App SHALL remove that Transaction from the Transaction List, update the Balance Display, and update the Pie Chart immediately.
2. WHEN a Transaction is deleted, THE App SHALL persist the updated Transaction collection to Local Storage so the deletion survives a page reload.
3. IF deleting a Transaction results in an empty Transaction List, THEN THE App SHALL display the empty-state message and hide the Pie Chart canvas, replacing it with an empty-state message.

---

### Requirement 4: Total Balance Display

**User Story:** As a user, I want to see my total spending balance at the top of the page, so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance Display SHALL show the sum of all Transaction amounts formatted as USD currency (e.g., `$12.50`).
2. WHEN a Transaction is added or deleted, THE Renderer SHALL recalculate and update the Balance Display without requiring a page reload.
3. WHEN no Transactions exist, THE Balance Display SHALL show `$0.00`.
4. THE Balance Display SHALL be visible at the top of the page at all viewport widths supported by the App.

---

### Requirement 5: Pie Chart — Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going at a glance.

#### Acceptance Criteria

1. THE Pie Chart SHALL display one segment per Category that has at least one Transaction, sized proportionally to that Category's share of total spending.
2. WHEN a Transaction is added or deleted, THE Renderer SHALL update the Pie Chart data and re-render the chart without a page reload.
3. THE Pie Chart SHALL use distinct, consistent colors per Category: Food uses `#3b82f6`, Transport uses `#f59e0b`, and Fun uses `#8b5cf6`.
4. THE Pie Chart SHALL display a legend below the chart identifying each Category by color and label.
5. WHEN the user hovers over a Pie Chart segment, THE Pie Chart SHALL display a tooltip showing the monetary amount and percentage share for that Category.
6. WHEN no Transactions exist, THE App SHALL hide the Pie Chart canvas and display an empty-state message in the chart area.
7. THE App SHALL load the Chart.js library (version 4.x) from a CDN without requiring a local installation or build step.

---

### Requirement 6: Data Persistence

**User Story:** As a user, I want my transactions to be saved automatically, so that my data is still available after I close or refresh the browser tab.

#### Acceptance Criteria

1. WHEN a Transaction is added, THE App SHALL serialize the full Transaction collection to Local Storage under a consistent storage key immediately after the state update.
2. WHEN a Transaction is deleted, THE App SHALL serialize the updated Transaction collection to Local Storage immediately after the state update.
3. WHEN the App initializes, THE App SHALL deserialize the Transaction collection from Local Storage and restore all previously saved Transactions before rendering.
4. IF Local Storage is unavailable or the stored data cannot be parsed, THEN THE App SHALL initialize with an empty Transaction collection and continue operating normally without throwing an unhandled error.
5. THE App SHALL store Transaction data client-side only; no data SHALL be transmitted to any external server.

---

### Requirement 7: Responsive Layout and Visual Design

**User Story:** As a user, I want the app to look clean and work well on both desktop and mobile screens, so that I can use it comfortably on any device.

#### Acceptance Criteria

1. THE App SHALL render a usable, non-overlapping layout on viewport widths from 320px to 1440px.
2. WHEN the viewport width is 700px or less, THE Input Form fields SHALL reflow to a two-column grid and the Add Transaction button SHALL span the full width.
3. WHEN the viewport width is 420px or less, THE Input Form fields SHALL reflow to a single-column stack.
4. WHEN the viewport width is 700px or less, THE Transaction List and Pie Chart SHALL stack vertically in a single-column layout.
5. THE App SHALL apply consistent visual design tokens: background color `#f1f5f9`, surface color `#ffffff`, primary blue `#3b82f6`, error red `#ef4444`, border radius `14px`, and a subtle box shadow on all card components.
6. THE App SHALL use a system font stack (`'Segoe UI', system-ui, -apple-system, sans-serif`) for all text.

---

### Requirement 8: File Structure and Technology Constraints

**User Story:** As a developer, I want the project to follow a defined file structure and technology stack, so that the codebase is easy to maintain and extend.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no frontend frameworks or build tools required.
2. THE App SHALL contain exactly one CSS file located at `css/style.css`.
3. THE App SHALL contain exactly one JavaScript file located at `js/app.js`.
4. THE App SHALL be loadable by opening `index.html` directly in a browser without a local server.
5. THE App SHALL function correctly in the current stable releases of Chrome, Firefox, Edge, and Safari.
6. THE App SHALL require no installation, configuration, or test setup to run.
