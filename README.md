# Expense & Budget Visualizer

A mobile-friendly, client-side web app for tracking daily spending. Built with plain HTML, CSS, and Vanilla JavaScript — no frameworks, no server required.

---

## Features

- **Add Transaction** — record a spending item with name, amount, category (Food / Transport / Fun), and automatic date stamp
- **Delete Transaction** — remove any entry instantly; balance and chart update automatically
- **Total Balance Display** — live running total of all transactions at the top of the page
- **Monthly Summary Card** — shows total spent, transaction count, and top spending category for the current month
- **Pie Chart by Category** — visual breakdown of spending using Chart.js (loaded from CDN)
- **Sort Transactions** — sort the list by Newest First, Highest Amount, Lowest Amount, or Category A-Z
- **Spending Alert Highlight** — set a limit; any transaction above it is highlighted in red
- **Dark / Light Mode Toggle** — switch themes instantly; preference is saved across sessions
- **Local Storage Persistence** — all data (transactions, spending limit, theme) survives page refresh

---

## How to Run Locally

1. **Clone or download** this repository to your computer
2. Open the project folder — you should see `index.html`, `css/`, `js/`, and `README.md`
3. Double-click `index.html` to open it in your browser (Chrome, Firefox, Edge, or Safari)
4. No server, no installation, no build step required

---

## GitHub Pages Deployment

1. Push all project files to a GitHub repository
2. Go to your repository on GitHub and click **Settings**
3. In the left sidebar, click **Pages**
4. Under **Source**, set the branch to `main` (or `master`) and the folder to `/ (root)`
5. Click **Save**
6. After a minute, your site will be live at `https://<your-username>.github.io/<repo-name>/`

---

## Project Structure

```
project-folder/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

---

## Tech Stack

- HTML5
- CSS3 (Flexbox + CSS Grid, CSS custom properties)
- Vanilla JavaScript (ES6+)
- [Chart.js 4.x](https://www.chartjs.org/) via CDN
