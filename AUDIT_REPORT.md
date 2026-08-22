# Context ↔ Page/Backend Audit — Orphaned References & Backend Gaps

**Date:** 2026-08-20 (second pass — after mock→real API migration)
**Scope:** All 6 contexts, all 38 context-consuming files, all 9 backend route modules

> **Method:** Static cross-reference — every `useXContext()` destructure compared against the context's actual Provider value; every called function checked against backend route files. No fixes applied.

---

## 1. Context Export Inventory

| Context | File | Provides |
|---|---|---|
| **AuthContext** | `context/AuthContext.jsx` | `user`, `isLoading`, `error`, `login`, `register`, `logout`, `updateProfile` |
| **DoctorsContext** | `context/DoctorsContext.jsx` | `doctors`, `isLoading`, `error`, `getDoctorById`, `updateOwnProfile`, `addDoctor`, `updateDoctor`, `deleteDoctor`, `currentDoctor` |
| **AppointmentsContext** | `context/AppointmentsContext.jsx` | `appointments`, `isLoading`, `error`, `refresh`, `bookAppointment`, `cancelAppointment`, `completeAppointment`, `confirmAppointment` |
| **PatientsContext** | `context/PatientsContext.jsx` | `patients`, `getPatientById`, `addPatient`, `updatePatient`, `deletePatient` — ⚠️ **still localStorage/mock-based** |
| **PrescriptionsContext** | `context/PrescriptionsContext.jsx` | `prescriptions`, `savePrescription`, `getPrescriptionByAppointment` — ⚠️ **still localStorage/mock-based** |
| **ToastContext** | `context/ToastContext.jsx` | `addToast` |

---

## 2. Page/Component → Context Destructures (all 38 files)

| File | Hook | Destructured |
|---|---|---|
| routes/ProtectedRoute | useAuth | user, isLoading |
| routes/PublicOnlyRoute | useAuth | user, isLoading |
| components/shared/Navbar | useAuth, useToast | user, logout / addToast |
| components/shared/ShareMenu | useToast | addToast |
| pages/Profile | useAuth, useToast, useDoctors | user, updateProfile / addToast / currentDoctor, updateOwnProfile |
| pages/auth/Login | useAuth, useToast | login / addToast |
| pages/auth/Register | useAuth, useToast | register / addToast |
| pages/auth/ForgotPassword | useToast | addToast |
| pages/Home | useDoctors | doctors |
| pages/Contact | useToast | addToast |
| pages/patient/DoctorListing | useDoctors | doctors, isLoading, error |
| pages/patient/DoctorProfile | useDoctors | getDoctorById |
| pages/patient/AppointmentBooking | useDoctors | getDoctorById |
| pages/patient/Checkout | useAppointments, useToast | bookAppointment / addToast |
| pages/patient/PatientAppointments | useAppointments, useToast | appointments, isLoading, error, cancelAppointment, refresh / addToast |
| pages/patient/PatientDashboard | useAuth, useAppointments | user / appointments, isLoading |
| pages/patient/HealthRecords | useAppointments, useToast | appointments, isLoading / addToast |
| pages/patient/VideoConsultation | useAppointments, useAuth | appointments / user |
| pages/patient/SampleCollection | useToast | addToast |
| pages/patient/AmbulanceBooking | useToast | addToast |
| pages/doctor/DoctorDashboard | useAppointments, useDoctors, useToast | appointments, isLoading, error, completeAppointment, refresh / currentDoctor / addToast |
| pages/doctor/DoctorPatients | useAppointments, useDoctors | appointments, isLoading, error, refresh / currentDoctor |
| pages/doctor/DoctorReviews | useDoctors | currentDoctor |
| pages/doctor/PrescriptionWriting | useAppointments, usePrescriptions, usePatients, useToast | appointments, completeAppointment / savePrescription, getPrescriptionByAppointment / getPatientById / addToast |
| pages/doctor/DoctorAvailability | useToast | addToast |
| pages/admin/AdminDashboard | useDoctors, usePatients | doctors / patients |
| pages/admin/DoctorVerification | useDoctors, useToast | **approveDoctor**, deleteDoctor / addToast |
| pages/admin/ManageDoctors | useDoctors, useToast | doctors, isLoading, error, addDoctor, updateDoctor, deleteDoctor / addToast |
| pages/admin/ManagePatients | usePatients, useToast | patients, addPatient, updatePatient, deletePatient / addToast |
| pages/admin/ManageLabAssistants | useToast | addToast |
| pages/admin/ManageAmbulances | useToast | addToast |
| pages/admin/Reports | useDoctors, useAppointments | doctors / appointments |
| contexts (internal) | useAuth | user (DoctorsContext, AppointmentsContext) |

---

## 3. Orphaned References — Context Missing (guaranteed crash if triggered)

| # | File:Line | Called Function | Exists in Context? | Trigger | Severity |
|---|---|---|---|---|---|
| 1 | `pages/admin/DoctorVerification.jsx:16` | `approveDoctor(doctor.id)` | ❌ **NO** | Clicking **Approve** on a pending doctor | **🔴 CRITICAL** — `TypeError: approveDoctor is not a function` |

**Every other destructured function exists in its context.** This is the only true orphaned reference in the codebase.

---

## 4. Full Comparison Table (Component → Function → Context → Backend)

| Component | Called Function | In Context? | Backend API? | Status |
|---|---|---|---|---|
| DoctorVerification | `approveDoctor` | ❌ | ✅ `PATCH /admin/doctors/:id/verification` | **🔴 CRITICAL crash** |
| DoctorVerification | `deleteDoctor` | ✅ | ✅ `DELETE /admin/doctors/:id` | 🟡 **Semantic mismatch** — reject does DELETE (permanent), should set REJECTED |
| ManageDoctors | `addDoctor` | ✅ | ✅ `POST /admin/doctors` | ✅ OK (wired this session) |
| ManageDoctors | `updateDoctor` | ✅ | ✅ `PATCH /admin/doctors/:id` | ✅ OK |
| ManageDoctors | `deleteDoctor` | ✅ | ✅ `DELETE /admin/doctors/:id` | ✅ OK |
| ManagePatients | `addPatient` | ✅ | ❌ | 🟠 **MISSING BACKEND** — localStorage only |
| ManagePatients | `updatePatient` | ✅ | ❌ | 🟠 **MISSING BACKEND** — localStorage only |
| ManagePatients | `deletePatient` | ✅ | ❌ | 🟠 **MISSING BACKEND** — localStorage only |
| PrescriptionWriting | `savePrescription` | ✅ | ⚠️ `POST /health-records` (flat shape, no medicines[]) | 🟠 **MISSING BACKEND integration** — localStorage only |
| PrescriptionWriting | `getPrescriptionByAppointment` | ✅ | ⚠️ `GET /health-records` (list, no per-appointment filter) | 🟠 **MISSING BACKEND integration** |
| PrescriptionWriting | `getPatientById` | ✅ (mock) | ❌ | 🟡 **Logic bug** — real UUID patient not found in mock list → "Appointment not found" |
| PrescriptionWriting | `completeAppointment` | ✅ | ✅ `PATCH /appointments/:id/status` | ✅ OK |
| Profile (doctor) | `updateOwnProfile` | ✅ | ✅ `PATCH /doctors/me/profile` | ✅ OK |
| Profile (both) | `updateProfile` | ✅ | ✅ `PATCH /auth/me` | ✅ OK |
| Checkout | `bookAppointment` | ✅ | ✅ `POST /appointments` | ✅ OK |
| PatientAppointments | `cancelAppointment` | ✅ | ✅ `PATCH /appointments/:id/status` | ✅ OK |
| DoctorDashboard | `completeAppointment` | ✅ | ✅ `PATCH /appointments/:id/status` | ✅ OK |
| Login / Register | `login` / `register` | ✅ | ✅ `POST /auth/login\|register` | ✅ OK |
| Navbar | `logout` | ✅ | n/a (client-side) | ✅ OK |
| All other pages (Listing, Profile, Booking, Cards, Dashboards) | read-only | ✅ | ✅ | ✅ OK |

---

## 5. Backend Route Coverage — Missing Routes by Page Action

**Backend endpoint inventory (all 9 modules, current):**

| Module | Routes |
|---|---|
| auth | POST /register, POST /login, GET /me, PATCH /me |
| doctors | GET /, GET /:id, PATCH /me/profile |
| appointments | POST /, GET /, PATCH /:id/status |
| healthRecords | POST /, GET / |
| reviews | GET /doctor/:doctorId, POST / |
| sampleCollection | POST /, GET /mine, GET /, PATCH /:id/assign |
| ambulance | POST /, GET /mine, GET /, PATCH /:id/assign |
| payments | POST /, GET / |
| admin | GET /dashboard, GET /users, GET/POST /doctors, PATCH/DELETE /doctors/:id, PATCH /doctors/:id/verification, GET /appointments, GET /payments |

**Page actions with NO backend route:**

| # | Page Action | Frontend File | Backend Support | Status |
|---|---|---|---|---|
| 1 | **Admin patient CRUD** (add/edit/delete) | `ManagePatients.jsx` | ❌ No route | 🟠 **MISSING BACKEND** — localStorage only |
| 2 | **Prescription save with medicines[]** | `PrescriptionWriting.jsx` | ⚠️ `POST /health-records` exists but no medicines[] array field (flat `prescriptionText`) | 🟠 **PARTIAL** — shape mismatch |
| 3 | **Prescription read by appointmentId** | `PrescriptionWriting.jsx` | ⚠️ `GET /health-records` — no query filter by appointment | 🟠 **PARTIAL** |
| 4 | **Lab assistant CRUD** | `ManageLabAssistants.jsx` | ❌ No route (Prisma model exists) | 🟠 **MISSING BACKEND** |
| 5 | **Ambulance fleet CRUD** | `ManageAmbulances.jsx` | ❌ No route (Prisma model exists) | 🟠 **MISSING BACKEND** |
| 6 | **Doctor availability** | `DoctorAvailability.jsx` | ❌ No route (known/accepted — "pore add hobe") | 🟠 **MISSING BACKEND** (accepted) |
| 7 | **Appointment reschedule** | `PatientAppointments.jsx` | ❌ No route — cancel + rebook workaround | 🟠 **MISSING BACKEND** (workaround) |
| 8 | **Patient profile read** (address/DOB/gender) | `Profile.jsx` | ⚠️ `PatientProfile` created but never read by any route | 🟡 **PARTIAL** |

---

## 6. Issue Categorization by Severity

### 🔴 CRITICAL (immediate crash on trigger)
1. **`DoctorVerification.jsx` Approve button** — calls `approveDoctor()` which does not exist in DoctorsContext → `TypeError` on click. (Approve is the page's primary action; any admin using Verify Doctors hits this instantly.)

### 🟠 MISSING BACKEND (feature gap — UI exists, backend has no support)
2. **ManagePatients CRUD** — add/edit/delete only persist to localStorage (`smartmed_patients`). No admin patient endpoints exist.
3. **Prescription write/read** — `savePrescription` → localStorage. Backend `POST /health-records` expects flat `prescriptionText`/`notes`; UI has structured `medicines[]`/`diagnosis`/`advice`. No GET-by-appointment filter.
4. **DoctorAvailability** — localStorage only (known/accepted).
5. **ManageLabAssistants / ManageAmbulances** — localStorage-based mock CRUD; Prisma models exist but no admin endpoints.
6. **Reschedule** — no endpoint; cancel+rebook workaround in place.

### 🟡 LOGIC / SEMANTIC (works but wrong behavior)
7. **DoctorVerification Reject** — calls `deleteDoctor` (permanent DELETE + user cascade) instead of setting `verificationStatus: "REJECTED"`. Destructive.
8. **PrescriptionWriting patient lookup** — `getPatientById` searches the **mock** PatientsContext list with the real appointment's **UUID** patient id → always null → page renders "Appointment not found". **The doctor prescription flow is broken against real data.**

---

## Recommended Fix Priority

1. **P0** — `approveDoctor` → wire to `setDoctorVerification(id, "VERIFIED")` (1-file crash fix)
2. **P0** — PrescriptionWriting: read patient from `appointment.patient` (API-embedded), drop mock lookup (unblocks prescription flow)
3. **P1** — Reject → `setDoctorVerification(id, "REJECTED")` instead of delete
4. **P1** — PrescriptionsContext → real `POST/GET /health-records` with adapter (medicines[] ↔ prescriptionText)
5. **P2** — Admin patient CRUD endpoints (+ wire ManagePatients)
6. **P2** — Lab assistant / ambulance admin CRUD endpoints
