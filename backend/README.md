# SMART-MED Backend

REST API for SMART-MED, a healthcare telemedicine platform.
Node.js + Express + PostgreSQL (Supabase) + Prisma ORM 5.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, PORT
npx prisma migrate dev # applies migrations using DIRECT_URL (port 5432, direct connection)
npm run seed           # seeds real doctors/patients + lab assistants/ambulances (idempotent)
npm run dev            # start the API
```

> **Important:** The Prisma datasource uses two connections:
> - `DATABASE_URL` — the Supabase **pooled** connection (port 6543, `pgbouncer=true`) used by the app at runtime.
> - `DIRECT_URL` — the Supabase **direct** connection (port 5432), used **only** for migrations.
>
> Always run `npx prisma migrate dev` / `npx prisma migrate deploy` so they resolve `DIRECT_URL`.
> The default port is **4000** (macOS AirPlay/ControlCenter occupies 5000).

## Environment variables

| Variable        | Required | Description                                   |
| --------------- | -------- | --------------------------------------------- |
| `DATABASE_URL`  | Yes      | Supabase pooled connection (port 6543)        |
| `DIRECT_URL`    | Yes      | Supabase direct connection (port 5432) — migrations only |
| `JWT_SECRET`    | Yes      | Secret for signing access tokens              |
| `PORT`          | Yes      | API port (default 4000)                       |
| `CLIENT_ORIGIN` | No       | Allowed CORS origin (default `http://localhost:5173`) |

## Auth

- `POST /api/auth/register` — create a `PATIENT` or `DOCTOR` account. Doctors get a `PENDING` profile until an admin verifies them.
- `POST /api/auth/login` — returns `{ user, token }`. Send the token as `Authorization: Bearer <token>`.
- `GET /api/auth/me` — current user.
- Login is rate-limited (10 attempts / 15 min / IP).

All responses use the shape `{ success: boolean, data: any, error: { message, details? } | null }`.
Passwords are hashed with bcrypt; tokens are JWT access tokens (no refresh tokens in this MVP).

## Endpoints

| Method | Path | Auth | Role | Description |
| ------ | ---- | ---- | ---- | ----------- |
| GET    | `/api/health` | — | — | Health check |
| POST   | `/api/auth/register` | — | — | Register patient or doctor |
| POST   | `/api/auth/login` | — | — | Login (rate limited) |
| GET    | `/api/auth/me` | ✅ | any | Current user |
| GET    | `/api/doctors` | — | — | List/search verified doctors (query: `specialty`, `search`, `verificationStatus`*, `page`, `limit`) |
| GET    | `/api/doctors/:id` | — | — | Doctor profile |
| PATCH  | `/api/doctors/me/profile` | ✅ | DOCTOR | Update own profile (specialty, bio, consultationFee) |
| POST   | `/api/appointments` | ✅ | PATIENT | Book appointment with verified doctor |
| GET    | `/api/appointments` | ✅ | PATIENT/DOCTOR | List own appointments (query: `status`, `page`, `limit`) |
| PATCH  | `/api/appointments/:id/status` | ✅ | PATIENT/DOCTOR | Doctor: confirm/complete/cancel; Patient: cancel only |
| POST   | `/api/health-records` | ✅ | DOCTOR | Create record for own appointment (one per appointment) |
| GET    | `/api/health-records` | ✅ | PATIENT/DOCTOR | List own records |
| GET    | `/api/reviews/doctor/:doctorId` | — | — | List a doctor's reviews (+ average rating) |
| POST   | `/api/reviews` | ✅ | PATIENT | Review a doctor after a completed appointment (once per doctor) |
| POST   | `/api/sample-collections` | ✅ | PATIENT | Request home sample collection |
| GET    | `/api/sample-collections/mine` | ✅ | PATIENT | List own requests |
| GET    | `/api/sample-collections` | ✅ | ADMIN | List all requests |
| PATCH  | `/api/sample-collections/:id/assign` | ✅ | ADMIN | Assign lab assistant |
| POST   | `/api/ambulance-bookings` | ✅ | PATIENT | Request ambulance |
| GET    | `/api/ambulance-bookings/mine` | ✅ | PATIENT | List own bookings |
| GET    | `/api/ambulance-bookings` | ✅ | ADMIN | List all bookings |
| PATCH  | `/api/ambulance-bookings/:id/assign` | ✅ | ADMIN | Assign ambulance (marks it BUSY) |
| POST   | `/api/payments` | ✅ | PATIENT | Create payment record (mock gateway, no real money) |
| GET    | `/api/payments` | ✅ | PATIENT | List own payments |
| GET    | `/api/admin/dashboard` | ✅ | ADMIN | Aggregates: user/appointment counts, revenue |
| GET    | `/api/admin/users` | ✅ | ADMIN | List users (query: `role`, `page`, `limit`) |
| GET    | `/api/admin/appointments` | ✅ | ADMIN | List all appointments |
| GET    | `/api/admin/payments` | ✅ | ADMIN | List all payments |
| PATCH  | `/api/admin/doctors/:id/verification` | ✅ | ADMIN | Verify/reject a doctor |

\* `verificationStatus` filter on `GET /api/doctors` is admin-only; otherwise the public list returns only `VERIFIED` doctors.

## Seed data (dev only)

`npm run seed` creates real accounts (log in with password `password123`):

- **Doctors:** sarah@clinic.com (Cardiology, VERIFIED), nusrat@clinic.com (Dermatology, VERIFIED), mahmudul@clinic.com (Pediatrics, VERIFIED), farhana@clinic.com (Gynecology, PENDING), tanvir@clinic.com (Orthopedics, VERIFIED)
- **Patients:** rahim@mail.com, salma@mail.com, kamal@mail.com
- 2 lab assistants and 3 ambulances (BASIC/ICU/FREEZER)
- A completed sample appointment chain (appointment + health record + review + payment) for Rahim with Dr. Sarah Khan

Demo mode remains frontend-only (mock data, no backend calls) — this API serves real registered users only.
