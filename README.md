# BillVoice— Business Manager

A simple business management web app for **BillVoice**: manage products, track inventory, create GST tax invoices, manage customers, and view sales reports.

## Features

- 🔐 **Accounts** — create an account once; all data (products, customers, invoices, settings) is saved to your login.
- 🛍️ **Products** — add, edit, delete products with category, price, and stock.
- 📦 **Inventory** — live stock tracking with low-stock / out-of-stock alerts.
- 🧾 **GST Invoices** — generate tax invoices with supplier details, GSTIN, CGST/SGST, place of supply, amount in words, and your uploaded signature. Download as PDF with one click.
- 👥 **Customers** — save customer details (name, phone, address, GSTIN) for quick invoice creation.
- 📊 **Sales reports** — revenue by month, top products, and top customers, all from charts.
- ⚙️ **Business settings** — set your business name, address, GSTIN, GST rates, invoice number prefix, and upload your signature once — it appears on every invoice.

## Project structure

```
jk-home-decor/
├── index.html              # HTML entry point
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx             # React entry point
    ├── App.jsx              # Routes + layout
    ├── index.css            # Global styles
    ├── context/
    │   └── AppContext.jsx   # Auth + shared data (products, customers, invoices, settings)
    ├── components/
    │   ├── Sidebar.jsx       # Left navigation
    │   ├── Toast.jsx         # Notification toast
    │   └── InvoiceDocument.jsx  # Printable invoice layout
    ├── pages/
    │   ├── AuthPage.jsx      # Login / register screen
    │   ├── Dashboard.jsx     # Overview stats
    │   ├── Products.jsx      # Product CRUD
    │   ├── Inventory.jsx     # Stock adjustments
    │   ├── Invoices.jsx      # Create + view invoices, download PDF
    │   ├── Customers.jsx     # Customer CRUD
    │   ├── Reports.jsx       # Sales charts
    │   └── Settings.jsx      # Business profile + signature upload
    └── utils/
        ├── helpers.js        # Formatting helpers (currency, dates, number-to-words)
        └── pdfGenerator.js   # GST invoice PDF generator (jsPDF)
```

## How to run it locally

You'll need [Node.js](https://nodejs.org/) installed (version 18 or higher).

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

   This opens the app at `http://localhost:5173`.

3. **Sign in**

   Use the demo account to explore right away:
   - Email: `demo@jkhd.com`
   - Password: `demo123`

   Or click "Create account" to make your own — all data is stored in your browser's local storage, tied to your account.

## Building for production / hosting online

To create a deployable build:

```bash
npm run build
```

This creates a `dist/` folder with static files you can upload to any web host — for example:

- **Netlify** — drag and drop the `dist` folder onto [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — run `vercel` in this folder (after `npm i -g vercel`)
- **GitHub Pages** — push `dist` contents to a `gh-pages` branch

## Notes on data storage

This version stores all data in the browser's `localStorage`, so it works without any backend/server. This is great for getting started, but means:

- Data is per-browser/per-device (not synced across devices)
- Clearing browser data will erase your records

**For a real production shop**, the next step would be to replace the `AppContext` data layer with a real backend (e.g. Firebase, Supabase, or a custom Node.js + database API) so data is safely stored on a server and accessible from any device.
