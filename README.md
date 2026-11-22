# Lead Manager — Full-Stack CRM Dashboard

A clean, production-grade Lead Management application built with **React 18**, **Node.js/Express**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

---

## Architecture & Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS | Fast developer loop, type safety, responsive design with minimal bundle overhead. |
| **Backend** | Node.js, Express, TypeScript | Lightweight RESTful services with explicit middleware pipelines and strict validation. |
| **Database** | PostgreSQL 16 + Prisma ORM | Relational data integrity, schema migrations, type-safe query generation, and indexing. |
| **Security** | Helmet, Express Rate Limit | Comprehensive HTTP security headers, CORS origin restriction, and write route rate limiting. |
| **Validation** | Zod (Backend), Custom synchronizer (Frontend) | Symmetrical validation schemas preventing invalid payloads before DB persistence. |

---

## Project Structure (Monorepo)

```
lead-manager/
├── docker-compose.yml          # PostgreSQL 16 container definition
├── server/                     # Backend Express + Prisma application
│   ├── src/
│   │   ├── config/env.ts       # Zod-validated environment variables
│   │   ├── constants/leads.ts  # Enums (LeadStatus, LeadSource, Sort fields)
│   │   ├── controllers/        # Thin route controllers
│   │   ├── db/prisma.ts        # Prisma client singleton
│   │   ├── middleware/         # errorHandler, notFound, validate, rateLimiter
│   │   ├── routes/             # REST endpoints (/api/leads)
│   │   ├── services/           # Business logic & PostgreSQL transactions
│   │   ├── utils/              # AppError class & asyncHandler
│   │   └── validation/         # Zod schemas (create, update, list query)
│   └── prisma/
│       └── schema.prisma       # Database schema & migrations
└── client/                     # Frontend Vite + React application
    ├── src/
    │   ├── api/                # HTTP client & typed API functions
    │   ├── components/         # LeadTable, LeadForm, LeadModal, ConfirmDialog, etc.
    │   ├── constants/          # Mirrored status and source labels/styling
    │   ├── hooks/              # useLeads (AbortController race-safe), useDebounce
    │   ├── pages/              # LeadsPage dashboard
    │   └── utils/validation.ts # Client validation mirroring backend rules
```

---

## Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Docker & Docker Compose**: For local PostgreSQL container (or an external Postgres connection string)

### 1. Clone & Setup Database
```bash
# Clone the repository
git clone <repo-url>
cd lead-manager

# Start PostgreSQL with Docker Compose
docker compose up -d
```

### 2. Configure Environment Variables
Copy example files into real local environment files:
```bash
# Backend environment
cp server/.env.example server/.env

# Frontend environment
cp client/.env.example client/.env
```

### 3. Setup & Start Backend Server
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```
Backend will start on `http://localhost:4000`. Test health with:
```bash
curl http://localhost:4000/api/health
# {"status":"ok"}
```

### 4. Start Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Frontend dashboard will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`server/.env`)
| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/lead_manager?schema=public` | Connection URL for PostgreSQL |
| `PORT` | `4000` | Port for Express HTTP server |
| `NODE_ENV` | `development` | Runtime environment (`development`, `test`, `production`) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `JWT_SECRET` | `change-me` | Secret for authentication tokens (Phase 6) |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |

### Frontend (`client/.env`)
| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` | Base URL for REST API requests |

---

## REST API Reference

Base URL: `/api`

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Service liveness health check | `200` |
| `POST` | `/api/leads` | Create a new lead | `201`, `400`, `409`, `429` |
| `GET` | `/api/leads` | List leads (search, filter, sort, paginate) | `200`, `400` |
| `GET` | `/api/leads/:id` | Get single lead by UUID | `200`, `400`, `404` |
| `PUT` | `/api/leads/:id` | Update lead details (full or partial) | `200`, `400`, `404`, `409`, `429` |
| `DELETE` | `/api/leads/:id` | Delete lead by UUID | `204`, `400`, `404`, `429` |

### Query Parameters for `GET /api/leads`
- `search`: String (max 100 chars) — case-insensitive match on name, email, or company.
- `status`: String (`NEW`, `CONTACTED`, `QUALIFIED`, `LOST`) — filter by pipeline status.
- `sortBy`: String (`createdAt`, `name`, `status`, `company`) — default `createdAt`.
- `order`: String (`asc`, `desc`) — default `desc`.
- `page`: Integer (≥ 1) — default `1`.
- `limit`: Integer (1–100) — default `10`.

---

## Standard Error Format

All API errors return a uniform, predictable JSON payload:
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

## Code Quality & Verification Commands

```bash
# Backend checks
cd server
npm run lint      # ESLint static analysis (0 errors)
npm run format    # Prettier formatting
npm run build     # TypeScript compilation (0 errors)

# Frontend checks
cd client
npm run lint      # ESLint static analysis (0 errors)
npm run format    # Prettier formatting
npm run build     # TypeScript + Vite production build (0 errors)
```
