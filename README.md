# Lead Manager — Full-Stack CRM Dashboard

A clean, production-grade Lead Management application built with **React 18**, **Node.js/Express**, **TypeScript**, **PostgreSQL 16**, and **Prisma ORM**. Features strict multi-user data isolation, real-time pipeline status aggregations, debounced multi-field searching, server-side pagination, sortable columns, and an accessible, responsive SaaS dashboard.

---

## Visual Overview

### Main Dashboard (with Pipeline Statistics & Data Grid)
![Lead Manager Dashboard](docs/screenshots/dashboard.png)

### User Authentication (Sign In & Sign Up)
![Lead Manager Sign In](docs/screenshots/login.png)

---

## Features Implemented

### 1. Core Lead Management (100% Complete)
- **Add Leads**: Modal form with immediate inline validation and server error mapping (Name, Email, Phone, Company, Source, Status).
- **View Leads**: Clean data table with auto-generated contact initials avatar, email/phone links, and styled badges. Automatically collapses into responsive cards on mobile viewports (< 640px).
- **Edit Leads**: Form pre-population, partial updates, and validation error preservation.
- **Delete Leads**: Confirmation dialog (`ConfirmDialog`) preventing accidental deletions with loading state and toast feedback.
- **Debounced Search**: Multi-field search across lead name, email, and company with a 300ms debounce to eliminate unnecessary API requests.
- **Status Filtering**: Filter leads by pipeline status (`NEW`, `CONTACTED`, `QUALIFIED`, `LOST`).

### 2. Dashboard Statistics & UX Enhancements (Phase 5 Bonus)
- **Aggregated Metric Cards (`StatsBar`)**: Displays total leads and real-time counts broken down by status. Cards double as clickable quick-filters with an active indicator badge.
- **Live Sync**: Adding, editing, or deleting a lead immediately refreshes statistics without requiring a full page reload.
- **Server-Side Pagination (`Pagination`)**: Configurable page-size selector (10, 25, 50 leads per page), previous/next navigation, page information, and automatic page decrement when the last record on a page is deleted.
- **Sortable Columns**: Table headers for **Lead**, **Company**, **Status**, and **Created** date with visual ascending/descending directional indicators.
- **Automatic Filter Reset**: Search and status changes automatically reset the pagination pointer to page 1.

### 3. User Authentication & Per-User Data Isolation (Phase 6 Bonus)
- **Secure Password Hashing**: Passwords hashed using `bcryptjs` (salt cost 10).
- **JWT Authentication**: Stateless Bearer token authentication verified via centralized middleware (`requireAuth`).
- **Strict Data Isolation**: Every lead belongs to an authenticated user (`userId`). All queries and mutations are scoped strictly to `req.user.id`. The frontend cannot spoof or override `userId`.
- **404 Existence Leak Prevention**: Attempting to read, update, or delete a lead belonging to another user returns `404 Not Found` (never 403), preventing attackers from enumerating lead IDs across accounts.
- **Per-User Unique Emails**: `@@unique([userId, email])` ensures a user cannot duplicate a prospect, while different users can independently manage contacts at the same organization.
- **Session Persistence & Auto-Logout**: Tokens persist in `localStorage`, session automatically validates on mount via `/api/auth/me`, and any `401 Unauthorized` triggers an automatic logout.

### 4. Automated Testing & Quality Assurance (Phase 7 Bonus)
- **Vitest & Supertest Suite**: 36 automated unit and integration tests running against an isolated PostgreSQL test database (`lead_manager_test`).
- **Deterministic Reset**: Global `beforeEach` hook resets database tables cleanly between tests.
- **GitHub Actions CI (`.github/workflows/ci.yml`)**: Automated CI pipeline running PostgreSQL 16 container, Prisma migrations, linting, TypeScript type-checking, and the full test suite on push/pull request.

### 5. Production Deployment Preparation (Phase 8 Bonus)
- **Render Blueprint (`render.yaml`)**: Infrastructure-as-Code for deploying Node.js API with automated release migrations (`npm run prisma:deploy`).
- **SPA Fallbacks**: Configured [client/vercel.json](client/vercel.json) and [client/public/_redirects](client/public/_redirects) (`/* /index.html 200`) ensuring seamless deep-linking and reload support on Vercel or Netlify.
- **Flexible CORS**: Automatically parses single or comma-separated allowed origins from `CLIENT_ORIGIN`.

### 6. What Was Deliberately Deferred & Why
- **CSV Import / Export**: Deferred to keep full engineering focus on core data integrity, bulletproof tenant isolation, and comprehensive test coverage.
- **Per-Lead Activity Notes**: Activity timeline was cut to prioritize responsive UX and robust authentication.

---

## Tech Stack & Architecture Reasoning

| Component | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React 18, Vite | Instant Hot Module Replacement (HMR), minimal bundle size, and optimal runtime rendering performance. |
| **Language** | TypeScript (Strict) | End-to-end type safety between API interfaces, form states, and database models. |
| **Styling** | Tailwind CSS | Utility-first architecture allowing polished SaaS design, consistent typography, custom focus rings, and responsive layouts without bloated CSS bundles. |
| **Routing** | React Router 6 | Declarative client-side routing with route guards (`ProtectedRoute`) and deep-link persistence. |
| **Backend Runtime** | Node.js, Express | Lightweight REST architecture with composable middleware pipelines (`requireAuth`, `validate`, `writeRateLimiter`, `errorHandler`). |
| **Database & ORM** | PostgreSQL 16 + Prisma | ACID compliance, relational integrity, foreign key cascade deletes, and migration management. |
| **Testing** | Vitest, Supertest | Fast native ESM test runner with real HTTP assertions and PostgreSQL transaction isolation. |
| **Security** | Helmet, Express Rate Limit | Standard HTTP security headers, payload body size caps (10kb), and write-operation rate limiting. |

---

## Monorepo Folder Structure

```
lead-manager/
├── .github/workflows/ci.yml    # GitHub Actions automated test & build pipeline
├── docker-compose.yml          # PostgreSQL 16 local database definition
├── render.yaml                 # Render Blueprint specification for zero-config deploy
├── server/                     # Express + Prisma backend application
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema, models & indexes
│   │   └── migrations/         # Version-controlled SQL migrations
│   ├── src/
│   │   ├── config/env.ts       # Zod-validated environment configuration
│   │   ├── constants/leads.ts  # Lead status and source enums
│   │   ├── controllers/        # Thin HTTP controllers (auth, leads)
│   │   ├── db/prisma.ts        # Prisma client singleton
│   │   ├── middleware/         # auth, errorHandler, notFound, validate, rateLimiter
│   │   ├── routes/             # Express routers mounted at /api
│   │   ├── services/           # Scoped business logic & DB operations
│   │   ├── types/              # Express request augmentation
│   │   ├── utils/              # AppError custom error class & asyncHandler
│   │   └── validation/         # Zod request validation schemas
│   └── test/                   # Vitest automated test suite (36 tests)
│       ├── setup.ts            # Test DB initialization and reset hooks
│       ├── auth.test.ts        # Signup, login, password validation tests
│       ├── leads.test.ts       # CRUD, filtering, pagination, sorting tests
│       └── isolation.test.ts   # Multi-user data isolation & security tests
└── client/                     # Vite + React 18 frontend application
    ├── public/_redirects       # Netlify SPA routing fallback
    ├── vercel.json             # Vercel SPA routing rewrite rule
    └── src/
        ├── api/                # Fetch HTTP client with auto-JWT & auth interceptors
        ├── components/         # LeadTable, LeadForm, StatsBar, Pagination, Dialogs
        ├── context/            # AuthProvider & ToastProvider contexts
        ├── hooks/              # useAuth, useLeads (AbortController race-safe), useToast
        ├── pages/              # LeadsPage, LoginPage, SignupPage
        ├── types/              # TypeScript models for Lead, User, Stats, Pagination
        └── utils/validation.ts # Client form validation mirroring backend rules
```

---

## Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Docker & Docker Compose**: For running the local PostgreSQL 16 container

### 1. Clone the Repository
```bash
git clone <repository-url>
cd lead-manager
```

### 2. Start PostgreSQL Container
```bash
docker compose up -d
```
*PostgreSQL 16 will start healthy on `localhost:5432`.*

### 3. Configure Environment Variables
Copy the example environment files for both server and client:
```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

### 4. Setup Backend & Run Database Migrations
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```
*The backend server will start on `http://localhost:4000`.*  
Verify health:
```bash
curl http://localhost:4000/api/health
# Response: {"status":"ok"}
```

### 5. Setup & Start Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
*The React application will be accessible at `http://localhost:5173`.*

---

## Running Automated Tests

The backend test suite executes 36 automated unit and integration tests against a dedicated, isolated test database (`lead_manager_test`).

```bash
cd server

# Run full Vitest test suite once
npm test

# Run Vitest in interactive watch mode
npm run test:watch
```

---

## Environment Variables Reference

### Backend (`server/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/lead_manager?schema=public` | PostgreSQL connection URL |
| `DATABASE_URL_TEST` | `postgresql://postgres:postgres@localhost:5432/lead_manager_test?schema=public` | Isolated test database connection string |
| `PORT` | `4000` | Port for the Express server |
| `NODE_ENV` | `development` | Environment mode (`development`, `test`, `production`) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origins (comma-separated in production) |
| `JWT_SECRET` | `change-me-to-a-secure-secret-key-in-production` | Secret key used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Lifetime of issued JWT tokens |

### Frontend (`client/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` | Base URL of the backend REST API |

---

## REST API Reference

All requests and responses use JSON. Unauthenticated requests to protected endpoints return `401 Unauthorized`.

| Method | Endpoint | Auth | Description | Status Codes |
|---|---|:---:|---|---|
| `GET` | `/api/health` | No | Liveness health check | `200` |
| `POST` | `/api/auth/signup` | No | Register user; returns `{ user, token }` | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | No | Authenticate user; returns `{ user, token }` | `200`, `400`, `401` |
| `GET` | `/api/auth/me` | Yes | Get authenticated user profile | `200`, `401` |
| `GET` | `/api/leads` | Yes | List leads with search, filter, sort, and pagination | `200`, `400`, `401` |
| `POST` | `/api/leads` | Yes | Create a new lead for authenticated user | `201`, `400`, `401`, `409` |
| `GET` | `/api/leads/stats` | Yes | Get count of leads grouped by status and total | `200`, `401` |
| `GET` | `/api/leads/:id` | Yes | Get lead details by UUID | `200`, `400`, `401`, `404` |
| `PUT` | `/api/leads/:id` | Yes | Update lead fields (full or partial) | `200`, `400`, `401`, `404`, `409` |
| `DELETE` | `/api/leads/:id` | Yes | Delete lead by UUID | `204`, `400`, `401`, `404` |

### Query Parameters for `GET /api/leads`
- `search` (string, max 100): Case-insensitive search matching name, email, or company.
- `status` (string): Filter by enum value (`NEW`, `CONTACTED`, `QUALIFIED`, `LOST`).
- `sortBy` (string): Field to sort by (`createdAt`, `name`, `company`, `status`). Default: `createdAt`.
- `order` (string): Sort direction (`asc` or `desc`). Default: `desc`.
- `page` (integer, ≥ 1): Page number. Default: `1`.
- `limit` (integer, 1–100): Items per page. Default: `10`.

### Standard Response & Error Format
All API errors return a uniform, predictable JSON envelope:
```json
{
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

---

## Database Schema & Index Rationale

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  leads        Lead[]
}

model Lead {
  id        String     @id @default(uuid())
  name      String
  email     String
  phone     String
  company   String
  source    LeadSource
  status    LeadStatus @default(NEW)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@index([userId, createdAt])
  @@unique([userId, email])
}
```

### Index Rationale:
1. **`@@index([userId, status])`**: Optimizes status filtering queries and the dashboard `groupBy` status count aggregations on the `StatsBar`, scoped per user.
2. **`@@index([userId, createdAt])`**: Eliminates expensive sequential scans for the default reverse-chronological list view, sorting, and pagination per user.
3. **`@@unique([userId, email])`**: Enforces prospect email uniqueness scoped per user. Different sales representatives can independently manage contacts at the same organization without collision.
4. **`onDelete: Cascade`**: Maintains referential database integrity; deleting a user account automatically cleans up associated leads.

---

## Assumptions & Design Trade-offs

1. **Email Uniqueness per User**: Enforcing email uniqueness per `userId` rather than globally across the database. This reflects real-world multi-tenant CRMs where different accounts track contacts at the same client organization.
2. **Flexible International Phone Format**: In compliance with the specification, phone numbers are validated for minimum 7 digits and allowed characters (`+ - ( )` and spaces) to accommodate diverse international formats without artificial regional restrictions.
3. **JWT in `localStorage`**: Chosen for client-side simplicity in Single Page Applications. In enterprise financial/medical deployments, `httpOnly`, `SameSite=Strict`, `Secure` cookie-based sessions with short-lived tokens and refresh rotation would be preferred to mitigate XSS exposure.
4. **Resilient HTTP Client**: The frontend API wrapper automatically normalizes base URLs (stripping redundant slashes or appending `/api` if omitted), preventing deployment URL configuration errors.

---

## What I'd Improve With More Time

1. **Token Refresh Rotation & `httpOnly` Cookies**: Move authentication tokens from `localStorage` into secure `httpOnly` cookies with rotating refresh tokens for enhanced XSS defense.
2. **CSV Bulk Import / Export**: Provide bulk CSV upload with client-side preview, validation, and batch database creation, plus CSV export with active filters.
3. **Activity Timeline & Lead Notes**: Add a relational `Note` and `Activity` log tracking stage transitions and timestamped interactions for each lead.
4. **Optimistic UI Updates**: Apply UI state updates immediately upon action with background rollback on failure for instant perceived speed.
5. **Full-Text Search (PostgreSQL `tsvector`)**: Upgrade substring queries (`ILIKE`/`contains`) to PostgreSQL full-text search indexes with ranked relevancy.

---

## Engineering Challenges & Reflections

> Building the multi-user data isolation boundary was one of the most rewarding aspects of this project. It was essential to ensure that when User B attempts to access a lead belonging to User A, the API strictly returns a `404 Not Found` rather than a `403 Forbidden`, thereby completely eliminating lead ID enumeration or existence leakage. Combining this with race-safe fetching in React via `AbortController` and writing 36 deterministic integration tests against an isolated PostgreSQL database provided confidence in the stability and security of the entire application.

---

## Verification Commands & Quality Checklist

```bash
# Backend checks
cd server
npm test          # 36 automated tests pass (Vitest + Supertest)
npm run lint      # ESLint static analysis (0 errors, 0 warnings)
npm run build     # TypeScript compilation (0 errors)

# Frontend checks
cd ../client
npm run lint      # ESLint static analysis (0 errors, 0 warnings)
npm run build     # TypeScript + Vite production build (0 errors)
```

---

## License

This project was built for the **Meru Technosoft Pvt. Ltd. Full Stack Developer** technical screening evaluation.
