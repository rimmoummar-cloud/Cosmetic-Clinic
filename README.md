# Cosmetic Clinic CMS & Booking Platform

Full-stack project for a cosmetic clinic that pairs a public marketing site, an admin dashboard, and a headless CMS layer. The backend exposes REST APIs over PostgreSQL; the frontend (Next.js + Tailwind) renders the website, handles bookings, and provides a rich admin experience to manage services, pages, sections, and JSON-based content.

## Repository Layout

```
root/
├─ client/                     # Next.js 16 app (public site + admin dashboard)
│  └─ src/app/
│     ├─ (website)/...         # Marketing pages (home, services, about, contact)
│     ├─ (dashboard)/admin/... # Admin area (services, bookings, CMS, etc.)
│     └─ auth, components, data, layout, globals.css
├─ server/                     # Express + PostgreSQL API
│  ├─ config/db.js             # PostgreSQL connection (DATABASE_URL)
│  ├─ controllers/             # Business logic per domain
│  ├─ middleware/              # Auth/validation helpers
│  ├─ models/                  # DB queries for each resource
│  ├─ routes/                  # REST endpoints (mounted under /api)
│  ├─ utils/                   # Shared helpers
│  ├─ server.js                # Express bootstrap + route wiring
│  ├─ *.md                     # In-repo architecture and CMS docs
│  └─ .env                     # Backend env vars (sample)
├─ DataBase/database.sql       # SQL schema for all tables
└─ README.md                   # You are here
```

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide Icons, Sonner toasts.
- **Backend:** Node.js, Express 5, PostgreSQL (`pg`), Zod validation, CORS, Helmet & rate limiting (middleware), JWT & bcrypt scaffolding.
- **Dev Tooling:** Nodemon, TypeScript types in the client, dotenv for config.

## How It Works

### Backend (Express + PostgreSQL)
- `server.js` boots Express, applies CORS/JSON middleware, and mounts domain routes under `/api`.
- **Domain routes**
  - `/api/services`, `/api/categories`, `/api/bookings`, `/api/customers`, `/api/workingHoure`, `/api/boxConect`
  - **CMS core:** `/api/pages`, `/api/sections`, `/api/section-content`
- **Models** (in `server/models/`) encapsulate SQL against PostgreSQL (see `DataBase/database.sql` for schema). Key tables:
  - `categories`, `services`, `customers`, `bookings`, `working_hours`, `contact_messages`, `sent_emails`
  - CMS: `pages (uuid) -> sections (uuid, ordered, active flag) -> section_content (jsonb, versioned)`
- **Controllers** coordinate validation, DB access, and responses:
  - Pages: CRUD, slug lookup, publish toggle, and detailed page with sections/content.
  - Sections: CRUD, reorder, active toggle, per-page filtering, fetch with content.
  - Section content: CRUD with versioning, latest-only endpoint, history, revert, and field search.
- **Database connection** is configured in `config/db.js` via `DATABASE_URL` (SSL optional). `server/.env` holds local values.
- A `/test-db` endpoint verifies connectivity.

### Frontend (Next.js)
- **Public site** in `src/app/(website)/{home,services,about,contact}` uses Tailwind theming from `globals.css` (gold/cream palette).
- **Admin dashboard** in `src/app/(dashboard)/admin` shares a common sidebar/topbar layout (`layout.js`) with sections for services, categories, bookings, customers, reviews, messages, settings, and **CMS**.
- **CMS dashboard** (`/admin/cms`, file `client/src/app/(dashboard)/admin/cms/page.jsx`):
  - Lists pages as cards (name, slug, description) fetched from `GET /api/pages`.
  - Modal shows sections for a page from `GET /api/sections/page/:pageId`.
  - Second modal loads section content via `GET /api/section-content/section/:sectionId/latest`.
  - Renders a dynamic form from JSON (supports nested objects/arrays, add/remove items, boolean toggles).
  - Saves updates with `PUT /api/section-content/:id` (new version) and displays toasts + loading states.
- **Styling & UX:** Tailwind utility classes, gradients, rounded cards, responsive grid, loading skeletons, and modals with backdrop blur.
- **API base URL:** Defaults to `http://localhost:5000`; override with `NEXT_PUBLIC_API_BASE_URL` if the server runs elsewhere.

### Data Flow
1. Frontend requests data from the Express API (`/api/...`) using fetch; responses are JSON.
2. For the public site, content is pulled either by slug (`/api/pages/detailed/:slug`) or page/section endpoints.
3. Admin CMS uses paginated calls: pages → sections → latest section content; edits issue PUTs that persist to `section_content` with versioning.
4. Booking/customer/service flows follow standard CRUD patterns via their respective routes.

## Setup & Run Locally

### Prerequisites
- Node.js 18+ and npm.
- PostgreSQL running locally or a cloud instance.

### 1) Clone & install
```bash
# from repository root
cd server
npm install
cd ../client
npm install
```

### 2) Configure environment variables
Create `server/.env`:
```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require
PORT=5000
```
Optional for client (`client/.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 3) Create database schema
```bash
# adjust connection string/flags as needed
psql "<your connection string>" -f DataBase/database.sql
```

### 4) Run the backend
```bash
cd server
npm run dev    # or npm start for production
# API served at http://localhost:5000/api
```

### 5) Run the frontend
```bash
cd client
npm run dev
# Frontend at http://localhost:3000
# Admin dashboard at http://localhost:3000/admin
```

## Key API Endpoints (high level)

- **Pages:** `GET /api/pages`, `GET /api/pages/detailed/:slug`, `POST /api/pages`, `PUT /api/pages/:id`, `PATCH /api/pages/:id/toggle-active`, `DELETE /api/pages/:id`
- **Sections:** `GET /api/sections/page/:pageId`, `/active`, `POST /api/sections`, `PUT /api/sections/:id`, `PATCH /api/sections/:id/reorder|toggle-active`, `DELETE /api/sections/:id`
- **Section Content:** `GET /api/section-content/section/:sectionId/latest|history`, `POST /api/section-content`, `PUT /api/section-content/:id` (versioned), `POST /api/section-content/:sectionId/revert/:versionNumber`, `DELETE /api/section-content/:id`
- **Services/Categories/Bookings/Customers:** Standard CRUD under `/api/services`, `/api/categorie`, `/api/bookings`, `/api/customers`, `/api/workingHoure`, `/api/boxConect`

## Developer Notes

- Tailwind v4 is configured inline via `@theme` tokens in `client/src/app/(dashboard)/globals.css`.
- CMS content is stored as flexible JSONB; the admin UI will render whatever shape you provide (nested arrays/objects supported).
- Keep secrets out of version control; use `.env` files locally and platform secrets in production.
- For production, enable SSL in `config/db.js` if your provider requires it, and front a reverse proxy that enforces HTTPS and rate limits.
- Helpful reference docs in `server/ARCHITECTURE.md`, `CMS_API_DOCUMENTATION.md`, and `QUICK_START_GUIDE.md`.

## Contributing

1. Fork/branch from main.
2. Follow the coding style already in the repo (ES modules, Tailwind utilities).
3. Add tests or manual steps when touching critical logic (CMS content versioning, booking flows).
4. Open a PR describing changes and manual verification steps (`npm run dev` backend/frontend).

Enjoy building with the Cosmetic Clinic CMS! 🎉
