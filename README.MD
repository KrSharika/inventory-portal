# NovaMart Inventory & Order Management Portal
 
A SAPUI5 freestyle application for browsing the NovaMart product catalog, managing stock levels, and raising reorder requests. Built as a training capstone project — no backend; all data lives in a local JSON model.
 
**Repository:** [github.com/KrSharika/inventory-portal](https://github.com/KrSharika/inventory-portal.git)
 
---
 
## Getting Started (SAP Business Application Studio)
 
```bash
# 1. Clone the repo
git clone https://github.com/KrSharika/inventory-portal.git
cd inventory-portal
```
 
1. Open the `inventory-portal` folder as a Dev Space in BAS (Full Stack Cloud Application dev space, or SAPUI5 dev space).
2. Open a terminal in the project root and install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm start
   ```
   This runs `ui5 serve --open index.html` and opens a live preview.
4. To test the German locale, append `?sap-language=DE` to the preview URL.
5. To lint the codebase:
   ```bash
   npm run lint
   ```
 
---
 
## Project Structure
 
```
inventory-portal/
├── webapp/
│   ├── control/
│   ├── controller/
│   │   ├── App.controller.js
│   │   ├── BaseController.js
│   │   ├── Category.controller.js
│   │   ├── Detail.controller.js
│   │   ├── List.controller.js
│   │   └── NotFound.controller.js
│   ├── css/
│   │   └── style.css
│   ├── fragment/
│   │   ├── AddEditProduct.fragment.xml
│   │   ├── ValueHelp.fragment.xml
│   │   └── ViewSettings.fragment.xml
│   ├── i18n/
│   │   ├── i18n.properties          # default (EN)
│   │   └── i18n_de.properties        # German
│   ├── model/
│   │   ├── formatter.js
│   │   └── products.json
│   ├── test/
│   │   └── unit/
│   │       ├── model/
│   │       └── unitTests.qunit.js
│   ├── util/
│   │   └── Storage.js
│   ├── view/
│   │   ├── App.view.xml
│   │   ├── Category.view.xml
│   │   ├── Detail.view.xml
│   │   ├── List.view.xml
│   │   └── NotFound.view.xml
│   ├── Component.js
│   ├── index.html
│   ├── manifest.json
│   └── test.html
├── .eslintrc.json
├── .gitignore
├── package.json
├── package-lock.json
├── ui5.yaml
└── README.md
```
 
---
 
## Features Implemented
 
### Layout: 3-Column FlexibleColumnLayout
- Uses `sap.f.FlexibleColumnLayout` in a **3-column configuration**: Category (begin) → Products (mid) → Detail (end)
- Extends beyond the base 2-column master-detail spec (Section 11 stretch goal: "Category master column → 3-column FCL")
- Column visibility adjusts automatically based on navigation depth (`OneColumn` → `TwoColumnsMidExpanded` → `ThreeColumnsMidExpanded`)
- Fully responsive: collapses to a single column on phone width, with back navigation between levels
 
### Category Page (begin column)
- Auto-computed category list, derived live from `products.json` (no hardcoded categories)
- Each category row shows a product count and an aggregate stock-status badge (Available / Low Stock / Out of Stock, computed from the products inside it)
- Tapping a category navigates into the filtered Products list
 
### Products Page (mid column)
- Product list filtered to the selected category, bound to the JSON model
- Live search by name and category
- Sort (name / price / stock), Filter (stock status, price range), Group (category) via a reusable ViewSettings dialog fragment
- Header shows the current category name and a live product count (expression binding)
- Add button opens the Add/Edit Product dialog fragment
- Custom styled header bar (centered title, gradient background)
- **In-app language switcher** (English / Deutsch dropdown) — instant switch with no page reload, applies across all views (Category, Products, Detail, dialogs)
- **In-app theme switcher** (Light / Dark dropdown) — toggles between SAP Horizon light and dark themes live, using `sap.ui.getCore().applyTheme()`
 
### Detail Page (end column)
- Bound via element/context binding from route parameters (`categoryId` + `productId`)
- Rich ObjectHeader: name, category, price (currency-formatted), SKU, computed stock status
- Field group: description, supplier, warehouse location, stock quantity, reorder threshold, last-updated date (date-formatted)
- Edit button (opens the same Add/Edit fragment, pre-filled via two-way binding)
- Delete button (MessageBox confirmation before removal)
- Reorder button (increments stock by a fixed batch, MessageToast confirmation)
 
### Add / Edit Product (Fragment)
- Single reusable Dialog fragment used for both create and edit flows
- Two-way binding to a temporary JSON model context (Cancel discards changes cleanly)
- Client-side validation: required fields (name, category, SKU), non-negative price/stock (typed Float/Integer bindings) — ValueState feedback on invalid inputs
- Save updates the main JSON model and refreshes list/detail
 
### Unit Testing (QUnit)
- QUnit test suite covering `model/formatter.js`, accessible at `test.html`
- **6 tests / 12 assertions, all passing**:
  - `statusState`: returns "Error" when stock is exactly 0 (regardless of threshold); returns "Warning" when stock is above 0 but at/below the reorder threshold; returns "Success" when stock is above the reorder threshold
  - `currencyValue`: formats known currency codes with the correct symbol and two decimals; falls back to the currency code itself when the symbol is unknown; returns an empty string when price is undefined or null
- Run via: open `webapp/test/unit/unitTests.qunit.html` in BAS, or navigate to `test.html`
 