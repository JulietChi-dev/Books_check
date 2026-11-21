# BooksCheck

> **The zero-clash booking manager and availability calendar for hotels and serviced apartments.**

BooksCheck is a focused web application designed for hotel and serviced apartment managers to record guest stays, inspect real-time availability in a month calendar, and maintain exact financial clarity.

---

## Core Invariant: Zero Overlapping Stays

BooksCheck guarantees that **no two active bookings ever overlap for the same apartment**.
- **Occupancy Rule**: A booking occupies the nights from check-in up to, but not including, check-out.
- **Same-Day Turnover**: Supported seamlessly without clashing (Check-out morning, Check-in afternoon).
- **Two-Tier Enforcement**:
  1. **Application Layer**: A single shared clash-check function validates every booking creation and update.
  2. **Database Layer**: A PostgreSQL exclusion constraint (`booking_no_overlap` via `btree_gist`) strictly blocks any race condition or concurrent overlap at the engine level.

---

## Features & Capabilities

### 1. Month Calendar Dashboard (`/`)
- **Visual Occupancy Grid**: Color-coded booking bars across apartments and days of the month.
  - 🟩 **Paid in full** (`✓ Paid`)
  - 🟨 **Owes balance** (`Bal: ₦...`)
- **Desk Controls**: Next/Previous month, "Today" quick jump, and PRD "Go to date" picker.
- **Same-Day Turnover**: Clear mid-day split visualization when a guest checks out and another checks in on the same date.
- **Real-Time 60s Refresh**: Automatic background refresh every 60 seconds and whenever the manager focuses the window.
- **Click-to-Book**: Click any free day to prefill a new booking for that apartment and date.

### 2. New Booking & Clash Validation (`/bookings/new`)
- Real-time overlap validation.
- Automatic night count and balance calculation using exact decimal arithmetic.
- Retry safety via unique `requestId` to protect against double-submits on unstable connections.
- Confirmation dialogs for unusual stays (e.g. past dates, same-day check-in/out, >30 nights).

### 3. Booking Details & Lifecycle (`/bookings/[id]`)
- Comprehensive overview: guest contact details, room info, nights, money totals, and notes.
- **Optimistic Concurrency**: Prevents accidental overwrites if another manager edits the same booking simultaneously (`loadedUpdatedAt`).
- **Cancellation**: Cancelling removes the stay from the calendar while preserving payments as held revenue.
- **Guarded Deletion**: Bookings can only be deleted if ₦0.00 has been paid, preventing accidental record loss.
- **Audit History**: Transparent timeline logging every change to dates, apartment, price, paid amount, or status.

### 4. Bookings Directory & Financial Filtering (`/bookings`)
- Filter by Year, Month, Status (`Active`, `Cancelled`, `All`), or `Unpaid only`.
- Instant search by guest name or phone number.
- High-level financial summary bar: Active bookings count, Total price, Total paid, Total balance owed, and Held on cancelled bookings.
- Sorting by check-in date or highest balance owed.

### 5. Company & Apartment Settings (`/settings`)
- **Company Profile**: Update business name, country, currency, time zone, address, and phone.
- **Currency Lock**: Currency is locked automatically once bookings exist to prevent ledger corruption.
- **Apartment Management**: Add, rename, or change room counts for up to 50 apartments. Deleting an apartment is strictly guarded and blocked if booking history exists.
- **Security**: Change login password (terminates all other active sessions) and change login email with verification link.

### 6. Mobile & Desktop Responsive Design
- Clean, responsive layout that adapts from 320px mobile phones to widescreen desktops.
- Horizontal touch-scrollable calendar grid on smaller viewports with fixed apartment headers.
- Multi-row mobile navigation header with easy thumb-friendly controls.

---

## Pinned Stack Versions (PRD 8.1)

All dependencies are strictly pinned to exact versions:

| Component / Package | Pinned Version | Purpose |
|---|---|---|
| **Node.js Runtime** | `22.14.0` | LTS runtime specified in `package.json` engines |
| **Next.js** | `15.1.7` | App Router framework |
| **React** | `19.0.0` | UI component runtime |
| **TypeScript** | `5.7.3` | Strict mode static typing |
| **Prisma** | `6.4.1` | Database CLI & ORM client |
| **PostgreSQL** | `16` | Database engine with `btree_gist` extension |
| **Zod** | `3.24.2` | Runtime schema validation |
| **Tailwind CSS** | `3.4.17` | Utility-first styling |
| **@node-rs/argon2** | `2.2.2` | Native Argon2id password hashing (with `node:crypto` scrypt fallback) |
| **Vitest** | `3.0.5` | Unit and integration testing |

---

## Getting Started

### Prerequisites
- Node.js `22.x` (LTS recommended)
- Docker (for local PostgreSQL with `btree_gist`), or a PostgreSQL instance (e.g., Supabase / Neon)

### 1. Installation
```bash
git clone <repo-url>
cd Books_check
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database connection strings:
- `DATABASE_URL`: Connection pooler URL (e.g. Supabase port 6543)
- `DIRECT_URL`: Direct migration URL (e.g. Supabase port 5432)
- `RESEND_API_KEY`: Transactional email delivery key

### 3. Local Database (Docker)
Start PostgreSQL with the `btree_gist` extension pre-loaded:
```bash
docker compose up -d
```

### 4. Database Migrations
Apply migrations to your database:
```bash
npx prisma migrate dev
```

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Assurance

### Run Unit Tests (74 Tests, Database-Free):
```bash
npm run test:unit
```
Covers:
- All 10 rows of the PRD 6.7 booking overlap specification.
- Exact decimal money arithmetic and balance calculations.
- Time zone handling (`Africa/Lagos`, `UTC`, `America/New_York`, `Pacific/Auckland`).
- Company registration, apartment rows, and booking validation schemas.
- Hashed single-use tokens (`VERIFY_EMAIL`, `CHANGE_EMAIL`, `RESET_PASSWORD`).

### Production Build Verification:
```bash
npm run build
```
Ensures 100% clean TypeScript compilation, linting, and prerendering across all 14 application routes with 0 errors.

---

## Operations & Health Check

- **Uptime Route**: `GET /health` returns JSON uptime status and timestamp for ping monitors.
- **Company Data Isolation**: Every read and write query scopes strictly to `companyId` extracted from the verified session user.

---

## License

Private repository. All rights reserved.
