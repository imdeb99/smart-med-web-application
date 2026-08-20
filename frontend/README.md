# SMART-MED — Frontend

React (Vite) + Tailwind CSS frontend for the SMART-MED telemedicine platform.
Everything runs on mock/dummy data in `src/data/` — there is no backend or
network calls in this build.

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Demo Login

Login (`/login`) validates against seeded accounts in `src/data/mockUsers.js`
via `AuthContext`. Use the "Autofill" button on the login page, or enter one
of these manually:

| Role    | Email                  | Password     |
|---------|-------------------------|--------------|
| Patient | `patient@smartmed.com` | `patient123` |
| Doctor  | `doctor@smartmed.com`  | `doctor123`  |
| Admin   | `admin@smartmed.com`   | `admin123`   |

Registering (`/register`) creates a new demo account (persisted to
`localStorage` for the session) and signs you in immediately.

## Folder Structure

```
src/
  components/
    shared/     Navbar, Footer, Modal, Toast, Loader, LoadingSkeleton, Card,
                 AppointmentCard, Sidebar
    patient/    DoctorCard
    doctor/     DoctorLayout, AppointmentRow
    admin/      AdminLayout
  pages/
    auth/       Login, Register, ForgotPassword
    patient/    Dashboard, doctor search/profile, booking, checkout, video
                 consultation, appointments, health records, sample
                 collection, ambulance booking, BMI calculator
    doctor/     Dashboard, availability, patients, prescriptions, reviews
    admin/      Dashboard, doctor verification, manage doctors/patients,
                 lab assistants, ambulance fleet, transactions, reports
  data/         mockDoctors, mockPatients, mockAppointments, mockUsers,
                 mockReviews, mockLabTests, mockLabAssistants, mockAmbulances,
                 mockTransactions
  context/      AuthContext (demo login + role/session state), plus
                 ToastContext, AppointmentsContext, PrescriptionsContext,
                 DoctorsContext, PatientsContext — the in-memory/localStorage
                 "backends" each page reads/writes against
  routes/       AppRoutes.jsx (role-based route groups), ProtectedRoute.jsx
  utils/        constants.js (demo patient/doctor ids), helpers.js
  App.jsx
  main.jsx
```

## Notes on Demo Mode

- All state (appointments, doctors, patients, prescriptions, accounts) is
  held in React Context and persisted to `localStorage`, seeded from the
  `mock*.js` files. There is no server — refreshing keeps your changes,
  clearing site data resets to the seed data.
- The patient dashboard always represents `pat-1` and the doctor dashboard
  always represents `doc-1` (see `utils/constants.js`), which line up with
  the seeded demo login accounts above. A newly *registered* patient/doctor
  account will still see `pat-1`/`doc-1`'s data, since there's no backend to
  create a fresh per-user dataset — wiring that up is a natural next step
  once a real backend exists.
- Tailwind CSS v4 is configured CSS-first via `@tailwindcss/vite` (see
  `vite.config.js` and `src/index.css`). `tailwind.config.js` is not required
  for the build; it's kept for editor tooling support.
