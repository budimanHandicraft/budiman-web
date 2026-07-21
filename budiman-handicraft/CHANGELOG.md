# Changelog — Budiman Handicraft

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — Branch: `fix/postage`

### Added

#### SEO & Server-Side Rendering
- **Global Metadata** — Root `layout.tsx` now exports comprehensive `metadata` with title template (`%s | Budiman Handicraft`), OpenGraph defaults, Twitter card, canonical URLs, keywords, and `robots` directives.
- **Per-Page Metadata** — Refactored 10 client pages to Server Components with exported metadata:
  - `/katalog/[id]` — Dynamic `generateMetadata()` pulling product name, description, image, and category from Supabase.
  - `/pesanan` — "Pesanan Saya"
  - `/profil` — "Profil"
  - `/market` — "Keranjang"
  - `/admin` — "Dashboard Admin" (with `robots: { index: false }`)
  - `/login` — "Masuk"
  - `/register` — "Daftar"
  - `/login/ganti-password` — "Ganti Password"
  - `/login/reset-password` — "Reset Password"
  - `/history` & `/artisan` — Static metadata exports.
- **Branded Error Pages** — Added `not-found.tsx` (dark-themed 404 with CTA buttons) and `error.tsx` (error boundary with retry).

#### Authentication & Authorization
- **Middleware Route Protection** — Expanded `middleware.ts` matcher to cover:
  - `/pesanan`, `/profil` → redirect unauthenticated users to `/login`.
  - `/login`, `/register`, `/login/ganti-password`, `/login/reset-password` → redirect authenticated users to `/profil`.
  - `/admin/*` — unchanged admin role guard.

#### UI / UX Components
- **Footer** — 4-column branded footer (`components/Footer.tsx`) with logo, tagline, navigation links, customer service links, and dummy contact info. Integrated into root layout.
- **Toast Notification System** — Global `ToastProvider` context (`components/ToastProvider.tsx`) with CSS `toast-enter` animation. Three variants: success (green), error (red), info (dark). Positioned bottom-right with auto-dismiss after 3.5s.
- **Mobile Responsive Navbar** — Added hamburger menu (`aria-label="Toggle menu"`) for viewports < `md`, with dropdown containing all nav links. Auto-closes on route change. Desktop gap fixed from `gap-32` to `gap-16`.

#### Marketplace & Catalog
- **Add-to-Cart Modal** — Variant selector with real-time stock, quantity stepper, and price display on `/katalog`.
- **Cart / Checkout Page** — `/market` with contact info form, shipping destination search (debounced 800ms), RajaOngkir courier selection, order summary, and checkout flow.
- **Payment Page** — `/pembayaran/[id]` with QRIS placeholder, file upload to Supabase Storage, and payment proof submission.
- **Order History** — `/pesanan` showing transaction list with payment/shipping status badges, detail modal per order, and "Bayar Sekarang" CTA for unpaid orders.
- **User Profile** — `/profil` for editing name, WhatsApp number, and default shipping address. Logout clears local cart.

#### Admin Dashboard
- **Admin Transaction Manager** — Confirm payments and update shipping status.
- **Admin Product Manager** — Full CRUD for products + variants with image upload to Supabase Storage.

#### Performance
- **Preconnect & DNS Prefetch** — Added to `<head>` in `layout.tsx`:
  - `preconnect` → Supabase domain
  - `dns-prefetch` → RajaOngkir (`komerce.id`) and Google Images (`lh3.googleusercontent.com`)
- **Smooth Scroll** — `scroll-behavior: smooth` added to `globals.css`.

#### Infrastructure
- **Toast Animation CSS** — `@keyframes toast-enter` for slide-in bottom toast effect.

### Changed

- **Refactored Client Pages to Server Components** — Extracted all `'use client'` logic from 10 pages into separate `*Page.tsx` files, leaving `page.tsx` as a thin Server Component wrapper that imports the client file and exports metadata.
- **Replaced `alert()` Calls** — All user-facing `alert()` dialogs in `/katalog`, `/market`, `/register`, and `/pembayaran` replaced with non-blocking `showToast()` notifications.
- **Navbar Polish** — Fixed active state colors to `#d77723`, added click-outside dropdown close behavior, consistent Cart icon sizing, and proper `z-50` stacking.

### Fixed

- **Navbar Syntax Error** — Removed extra closing `</div>` in `components/Navbar.tsx` that was causing Next.js 16 build failure.
- **OpenGraph Type Error** — Removed invalid `openGraph.type: "product"` from `/katalog/[id]/page.tsx` (Next.js 16 only supports `article`, `website`, `book`, `profile`, etc.).
- **RajaOngkir Merge Conflict** — Preserved fixed shipping origin (`5467`) and added API input validation + response normalization.

### Deprecated
- *(none)*

### Removed
- *(none)*

### Security
- **Middleware Auth Guards** — Server-side session validation prevents direct URL access to protected pages without relying solely on client-side checks.

---

## How to Test This Branch

```bash
cd budiman-handicraft
npm install
npm run build   # should pass with 0 errors, 0 warnings
npm run dev     # open http://localhost:3000
```

### Automated Tests
Run the Playwright test suite (headless):
```bash
python scripts/with_server.py --server "npm run dev" --port 3000 -- python test_outputs/run_tests.py
```
Tests cover: homepage metadata, catalog modal, 404 branding, mobile navbar, middleware redirect, login metadata, and preconnect hints.

---

## Contributors
- Development team — Budiman Handicraft
