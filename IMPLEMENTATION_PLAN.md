# Lead Manager: Implementation Plan (for Antigravity CLI)

Full-stack take-home for Meru Technosoft Pvt. Ltd. (Full Stack Developer screening).
Goal: a small, clean, fully working app plus a great README and commit history. Evaluation weights: Functionality 30%, Code quality 25%, Backend/API 15%, DB 10%, UI/UX 10%, Docs & Git 10%.

---

## 0. How to use this file with the agent

Give the agent this whole file once as context, then run **one phase at a time**:

> "Read IMPLEMENTATION_PLAN.md. Implement **Phase N only**. Follow the global rules. When done, run the phase's verification steps, show me the results, and make the commits listed. Do not start Phase N+1."

Review each phase (run it yourself) before moving on. You must be able to explain every part of the code in the interview, so read what the agent writes and ask it to simplify anything you don't understand.

---

## 1. Global rules (apply to every phase)

1. **Simple and done beats large and half-finished.** Do not add features outside this plan.
2. **Commit after every meaningful step** using Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`). Commits are small and each leaves the app working. Commit messages are suggested in each phase.
3. **Never commit secrets.** Only `.env.example` is committed; `.env` is in `.gitignore`.
4. **Validate on both sides.** The backend is the source of truth; the frontend validation is for UX.
5. **Handle errors gracefully.** API down, bad input, 404s, and server errors all produce a visible, friendly message (never a blank screen or a raw stack trace).
6. **Code quality:** small files, clear names, no duplicated logic (shared constants such as status/source lists live in one place per side), no dead code or leftover `console.log`.
7. **Consistent error format** from the API: `{ "error": { "message": string, "details"?: [{ "field": string, "message": string }] } }`.
8. After each phase: the app must start with the documented commands and the phase's acceptance checks must pass.

---

## 2. Tech stack (decided; mention the reasoning in the README)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript, React Router, plain CSS modules or Tailwind (pick one, keep it light) | Matches the company stack; fast dev loop |
| Backend | Node.js + Express + TypeScript | Matches the company stack; simple, explicit REST |
| DB | PostgreSQL + Prisma ORM | Relational schema, migrations, type safety, easy deploy (Render/Neon/Railway) |
| Validation | Zod (backend), Zod or plain functions (frontend) | One schema style, clear error messages |
| Auth (bonus) | bcrypt password hashes + JWT (Bearer token) | Simple, stateless |
| Tests (bonus) | Vitest + Supertest | Fast API tests |
| Local DB | `docker-compose.yml` with Postgres | One command to get a DB |

If Docker is a problem on the machine, allow `DATABASE_URL` to point at any Postgres and document it.

### Repo structure (monorepo)

```
lead-manager/
├── README.md
├── IMPLEMENTATION_PLAN.md
├── docker-compose.yml
├── .gitignore
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts            # starts the server
│   │   ├── app.ts              # builds the Express app (used by tests)
│   │   ├── config/env.ts       # validated env vars
│   │   ├── db/prisma.ts        # Prisma client singleton
│   │   ├── constants/leads.ts  # STATUSES, SOURCES
│   │   ├── routes/             # leads.routes.ts, auth.routes.ts
│   │   ├── controllers/        # thin: parse request, call service, respond
│   │   ├── services/           # business logic + DB access
│   │   ├── validation/         # zod schemas
│   │   ├── middleware/         # errorHandler, notFound, validate, auth
│   │   └── utils/              # AppError, asyncHandler
│   └── tests/
└── client/
    ├── .env.example
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx / App.tsx
        ├── api/                # http client + leads/auth functions
        ├── components/         # LeadTable, LeadForm, LeadModal, ConfirmDialog, SearchFilterBar, StatusBadge, Pagination, StatsBar, Toast
        ├── pages/              # LeadsPage, LoginPage, SignupPage
        ├── hooks/              # useLeads, useDebounce, useAuth
        ├── constants/leads.ts  # STATUSES, SOURCES (must match the server)
        ├── types/
        └── utils/validation.ts
```

---

## 3. Data model

```prisma
enum LeadStatus { NEW CONTACTED QUALIFIED LOST }
enum LeadSource { WEBSITE REFERRAL LINKEDIN COLD_CALL EMAIL_CAMPAIGN EVENT OTHER }

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
  userId    String?    // becomes required in Phase 6 (auth)
  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@index([userId, createdAt])
  @@unique([userId, email])   // no duplicate lead email per user (decide in Phase 1, document it)
}
```

Notes for the agent:
- Display labels ("Cold Call", "Email Campaign") are a frontend concern; the API uses the enum values.
- Index justification goes in the README (filter by status, list by user/date, name search uses `ILIKE`).
- Introduce `User` in Phase 1 (table exists, unused until Phase 6) to avoid a messy migration later.

---

## 4. REST API contract

Base path `/api`. JSON only. Status codes: 200, 201, 204, 400 (validation), 401, 404, 409 (duplicate), 500.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check `{ status: "ok" }` |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads?search=&status=&page=&limit=&sortBy=&order=` | List with filter/search/pagination/sort |
| GET | `/api/leads/:id` | Get one lead |
| PUT | `/api/leads/:id` | Update lead (full or partial fields; use PATCH semantics if preferred, but be consistent and document it) |
| DELETE | `/api/leads/:id` | Delete lead (204) |
| GET | `/api/leads/stats` | Count of leads per status (Phase 5) |
| POST | `/api/auth/signup` | Create user, return `{ user, token }` (Phase 6) |
| POST | `/api/auth/login` | Return `{ user, token }` (Phase 6) |
| GET | `/api/auth/me` | Current user (Phase 6) |

Register `/api/leads/stats` **before** `/api/leads/:id` so it isn't captured by the id route.

### Validation rules (identical on both sides)
- `name`: required, trimmed, 2–100 chars
- `email`: required, valid email, lowercased, max 254
- `phone`: required, 7–20 chars, digits plus optional `+ - ( )` and spaces
- `company`: required, trimmed, 1–100 chars
- `source`: required, must be one of the enum values
- `status`: optional on create (default NEW), must be one of the enum values
- List query: `page` ≥ 1 (default 1), `limit` 1–100 (default 10), `order` is `asc|desc`, `sortBy` is one of `name|createdAt|status|company`, `status` is an enum value or empty, `search` max 100 chars.
- Invalid UUID in `:id` returns 400 (not a 500).

---

## 5. Phases

Each phase lists: **Goal → Tasks → Acceptance criteria → Verify → Commits**.

### Phase 1: Project scaffolding & database

**Goal:** Empty-but-running monorepo with DB schema migrated.

**Tasks**
1. `git init`; create root `.gitignore` (node_modules, dist, `.env`, coverage, OS files), `README.md` stub.
2. `docker-compose.yml` with Postgres 16 (named volume, port 5432, env creds).
3. `server/`: init TypeScript + Express, install `express cors dotenv zod @prisma/client`, dev deps `prisma typescript tsx @types/*`. Scripts: `dev`, `build`, `start`, `prisma:migrate`, `prisma:studio`.
4. `server/.env.example`: `DATABASE_URL`, `PORT=4000`, `CLIENT_ORIGIN=http://localhost:5173`, `JWT_SECRET=change-me`, `JWT_EXPIRES_IN=7d`.
5. `config/env.ts` validates env with Zod and fails fast with a clear message.
6. Write `prisma/schema.prisma` from section 3; run the initial migration.
7. `app.ts` (CORS limited to `CLIENT_ORIGIN`, `express.json`, health route, notFound + error handler middleware) and `index.ts` (listen).
8. `utils/AppError.ts`, `middleware/errorHandler.ts` producing the standard error format (handle ZodError → 400, Prisma errors such as P2002 → 409, unknown → 500 without leaking internals).

**Acceptance:** `docker compose up -d` + `npm run dev` in `server/` starts; `GET /api/health` returns `{status:"ok"}`; unknown route returns JSON 404 in the standard format; tables exist in Postgres.

**Verify:** `curl localhost:4000/api/health`, `curl localhost:4000/api/nope`, open Prisma Studio.

**Commits:** `chore: init repo and docker-compose for postgres` · `feat(server): express app with env validation and error handling` · `feat(db): prisma schema for users and leads with initial migration`

---

### Phase 2: Backend: Leads CRUD, validation, search/filter

**Goal:** Complete, validated leads API (no auth yet; `userId` stays null).

**Tasks**
1. `constants/leads.ts` exporting status/source arrays; `validation/lead.schemas.ts` with `createLeadSchema`, `updateLeadSchema`, `listLeadsQuerySchema`, `idParamSchema`.
2. Generic `middleware/validate.ts` (validates `body`/`query`/`params`, returns 400 with `details` per field).
3. `services/lead.service.ts`: `create`, `list`, `getById`, `update`, `remove`. `list` supports: `search` (case-insensitive match on name, also email/company is fine, document it), `status` filter, pagination (`page`, `limit`), sorting (`sortBy`, `order`, default newest first), and returns `{ data, meta: { total, page, limit, totalPages } }`. Build this now so Phase 5 does not need to rewrite it.
4. Thin controllers + `routes/leads.routes.ts` mounted at `/api/leads`. Not-found → `AppError(404)`. Duplicate email (P2002) → 409 with a friendly message.
5. `asyncHandler` wrapper so no try/catch is repeated.

**Acceptance:** All endpoints in section 4 (except stats/auth) behave per the contract; bad input gives 400 with per-field details; nonexistent id gives 404; invalid id gives 400; search is case-insensitive; combined `search` + `status` filters work.

**Verify:** Run a `requests.http` (or curl script, commit it as `server/requests.http`) covering: create valid, create invalid email, create missing fields, list, search by name, filter by status, update status, delete, get deleted (404).

**Commits:** `feat(server): lead validation schemas and validate middleware` · `feat(server): lead service and CRUD endpoints` · `feat(server): search, status filter, pagination and sorting on list endpoint` · `docs(server): add http request samples`

---

### Phase 3: Frontend: Core features

**Goal:** All six required features working end-to-end in the UI.

**Tasks**
1. Scaffold `client/` with Vite React-TS; `client/.env.example` with `VITE_API_URL=http://localhost:4000/api`.
2. `api/http.ts`: small fetch wrapper that parses the standard error format, throws a typed `ApiError` (with field `details`), and shows a friendly "Cannot reach the server" message on network failure. `api/leads.ts` functions for list/create/update/delete.
3. `constants/leads.ts` and `utils/validation.ts` mirroring backend rules (same limits/messages).
4. Components:
   - `LeadTable`: columns Name, Email, Phone, Company, Source, Status (`StatusBadge` with distinct colours: New=blue, Contacted=amber, Qualified=green, Lost=red/grey), Actions (Edit/Delete). Include loading skeleton/spinner and an empty state ("No leads yet, add your first lead").
   - `LeadForm` inside `LeadModal`: used for both add and edit; inline field errors on blur/submit; submit disabled while saving; server `details` errors are mapped to fields.
   - `ConfirmDialog` for delete ("Delete {name}? This cannot be undone.").
   - `SearchFilterBar`: text search (debounced 300 ms via `useDebounce`) and status dropdown (All / New / Contacted / Qualified / Lost).
   - `Toast` for success and error feedback.
5. `LeadsPage` ties it together via a `useLeads` hook (fetch, refetch on filter change, handles loading/error state with a Retry button). Ensure race-safe fetching (ignore stale responses using AbortController).
6. Basic responsive layout (table scrolls horizontally on mobile or collapses to cards under ~640px).

**Acceptance:** Add, list, edit (including status change), delete with confirmation, search by name, and filter by status all work against the real API. Invalid input shows inline errors before any request is sent; server-side errors are displayed too. Stopping the API shows a clear error with Retry, not a crash.

**Verify:** Manual walkthrough of every required feature + stop the server and reload.

**Commits:** `chore(client): scaffold vite react app` · `feat(client): api layer with error handling` · `feat(client): leads table with status badges` · `feat(client): add/edit lead form with validation` · `feat(client): delete confirmation dialog` · `feat(client): debounced search and status filter` · `style(client): responsive layout and empty/loading states`

---

### Phase 4: Core polish & hardening (stop-and-check gate)

**Goal:** The core is solid before any bonus work.

**Tasks**
1. Audit against the required-features list in the PDF, one by one, and fix gaps.
2. Backend: add `helmet`, a basic rate limit (`express-rate-limit`) on write routes, request body size limit, and a request logger (`morgan`, dev only).
3. Frontend: handle double-submit, trim inputs, keyboard accessibility (Esc closes modal, focus trap or focus on first field, labels linked to inputs), consistent spacing/typography.
4. Remove dead code, unused deps, and console logs; run `tsc --noEmit` on both packages; add ESLint + Prettier configs and format everything (one `chore: format` commit).
5. Update README (draft): prerequisites, how to run locally, env vars, API table.

**Acceptance:** Zero TypeScript errors, zero lint errors, every required feature passes a manual re-test, a fresh clone runs by following only the README.

**Commits:** `chore: add eslint and prettier` · `feat(server): helmet, rate limiting and request logging` · `fix(client): accessibility and double-submit handling` · `docs: draft README with local setup`

---

### Phase 5: Bonus: Dashboard counts, sorting & pagination UI

**Goal:** Dashboard counts per status; usable pagination and sorting. (Server-side pagination and sorting already exist from Phase 2.)

**Tasks**
1. `GET /api/leads/stats` returns `{ total, byStatus: { NEW, CONTACTED, QUALIFIED, LOST } }` (use `groupBy`, fill missing statuses with 0). Registered before `/:id`.
2. Client: `StatsBar` showing Total + a card per status (clicking a card applies that status filter). Refresh stats after create/update/delete.
3. Client: `Pagination` component (Prev/Next, page X of Y, page-size selector 10/25/50), sortable column headers (Name, Company, Status, Created) with an asc/desc indicator, and reset to page 1 when search/filter changes. Optionally keep state in the URL query string.

**Acceptance:** Counts are accurate and update live; sorting and paging work together with search and filter; no off-by-one on the last page; deleting the last item on a page moves to the previous page.

**Commits:** `feat(server): lead status stats endpoint` · `feat(client): dashboard stats cards` · `feat(client): pagination and sortable columns`

---

### Phase 6: Bonus: Authentication (each user sees only their own leads)

**Goal:** Signup/login with per-user data isolation.

**Tasks**
1. Server: install `bcryptjs jsonwebtoken`. `validation/auth.schemas.ts` (name 2–100, email valid, password min 8 chars with at least one letter and one digit). `auth.service` (hash with cost 10+, generic "Invalid email or password" message on login failure, 409 on duplicate signup email). Routes: signup, login, me.
2. `middleware/auth.ts`: verifies Bearer JWT and sets `req.user = { id }`; 401 if missing or invalid.
3. **Protect all `/api/leads/*` routes.** Every service call takes `userId` and scopes queries with `where: { id, userId }` (a lead belonging to another user must return 404, not 403, to avoid leaking existence). Create sets `userId` from the token, never from the body.
4. Migration: make `Lead.userId` required (a dev DB reset is acceptable; note in the README).
5. Client: `LoginPage`, `SignupPage`, `useAuth` context (token in localStorage; mention the trade-off vs httpOnly cookies in the README), attach `Authorization` header in the http wrapper, auto-logout on 401, route guard for `LeadsPage`, header showing user name and a Logout button.

**Acceptance:** Two different accounts cannot see, edit, or delete each other's leads (verify by calling the API directly with each token); unauthenticated requests get 401; refresh keeps the session; logout clears it.

**Commits:** `feat(server): signup and login with hashed passwords and jwt` · `feat(server): auth middleware and per-user lead scoping` · `feat(db): make lead userId required` · `feat(client): login, signup and protected routes`

---

### Phase 7: Bonus: Automated API tests

**Goal:** Meaningful tests that prove the contract and data isolation.

**Tasks**
1. Install `vitest supertest @types/supertest`. Use a separate test database (`DATABASE_URL_TEST` or a `lead_manager_test` DB); reset tables between tests via a helper. Add `npm test` script. Tests import `app.ts` (not `index.ts`).
2. Cover at minimum:
   - Auth: signup success, duplicate email 409, weak password 400, login success/failure, `/me` with/without token
   - Leads: create valid (201), each validation failure (400 with details), list (pagination meta), search by name, filter by status, sort order, update status, delete (204) then get (404), invalid UUID (400)
   - Isolation: user B cannot read, update, or delete user A's lead (404); stats count only own leads
3. Add a CI workflow `.github/workflows/ci.yml` (Postgres service, install, typecheck, lint, test) if time permits.

**Acceptance:** `npm test` passes from a clean DB; tests are independent and deterministic.

**Commits:** `test(server): test harness with isolated database` · `test(server): auth and leads endpoint tests` · `test(server): data isolation tests` · `ci: github actions workflow`

---

### Phase 8: Bonus: Deployment

**Goal:** A live link in the README.

**Suggested setup (free tiers):** DB on Neon or Render Postgres; API on Render (web service); client on Vercel or Netlify.

**Tasks**
1. Server: `build` and `start` scripts; run `prisma migrate deploy` on release; set `CLIENT_ORIGIN` to the deployed client URL; set a strong `JWT_SECRET` in the host's env settings (never in the repo).
2. Client: set `VITE_API_URL` to the deployed API; add SPA fallback rewrite (`vercel.json` or `_redirects`).
3. Smoke-test the live app: sign up, create, edit, delete, search, refresh on a deep link.
4. Note that Render free instances sleep: mention in the README that the first request may take ~30–60 s.

**Acceptance:** The live URL works end-to-end; CORS correct; no secrets in the repo.

**Commits:** `chore: production build and migrate-deploy scripts` · `chore(client): spa rewrite config for hosting` · `docs: add live demo link`

---

### Phase 9: Documentation & final submission polish

**Goal:** README and Git history that score the final 10%.

**README must contain**
1. Title, one-paragraph description, screenshot or GIF, live demo link.
2. Features implemented (core + bonus) and what was deliberately cut and why.
3. **Tech stack and why** (short reasoning per choice).
4. **Run locally**: prerequisites, clone, `docker compose up -d`, copy `.env.example` → `.env` for server and client, `npx prisma migrate dev`, start server, start client, run tests.
5. Environment variables table.
6. API reference table (method, path, auth, description) with an example request/response and the error format.
7. Database schema overview and index rationale.
8. **Assumptions** (e.g. email unique per user, phone format is lenient, status/source lists, JWT in localStorage).
9. **What I'd improve with more time** (e.g. refresh tokens/httpOnly cookies, email verification, CSV import/export, activity history/notes per lead, e2e tests with Playwright, Docker for the whole stack, optimistic UI updates, full-text search).
10. **A short 2–3 line note** on what you're proud of or found tricky (write this yourself, in your own words).

**Final checklist**
- [ ] Fresh clone → follow README → app runs
- [ ] All required features (1–6) pass manual test
- [ ] No secrets or `.env` in repo or history (`git log -p | grep -i secret` sanity check)
- [ ] `.env.example` present in `server/` and `client/`
- [ ] Typecheck, lint, and tests all pass
- [ ] Commit history is meaningful and incremental (don't squash)
- [ ] Repo is **public**; the link is sent in a reply to the email thread (do not zip the code)

**Commits:** `docs: complete README` · `chore: final cleanup`

---

## 6. Time budget (target 6–8 hours)

| Phase | Estimate |
|---|---|
| 1 Scaffolding & DB | 45 min |
| 2 Backend CRUD | 75 min |
| 3 Frontend core | 120 min |
| 4 Polish | 45 min |
| 5 Stats/pagination UI | 45 min |
| 6 Auth | 75 min |
| 7 Tests | 45 min |
| 8 Deploy | 30 min |
| 9 Docs | 30 min |

If time runs short, cut in this order: Phase 8 (deploy), then Phase 7 CI, then Phase 5's URL-synced state. **Never cut Phase 4.** Say what you cut in the README.

---

## 7. Copy-paste prompt template for each phase

```
Context: Read IMPLEMENTATION_PLAN.md (global rules, stack, data model, API contract).
Task: Implement Phase <N> only, exactly as specified.
Rules: Keep code simple and readable; no extra features; follow the folder structure;
validate inputs; use the standard error format; commit in small steps using the
suggested commit messages.
When finished: run the verification steps, paste the output, list any deviations
from the plan with the reason, and stop. Do not start the next phase.
```
