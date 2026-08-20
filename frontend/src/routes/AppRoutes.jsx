import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RouteFallback from "../components/shared/RouteFallback";

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const Terms = lazy(() => import("../pages/Terms"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Profile = lazy(() => import("../pages/Profile"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const NotFound = lazy(() => import("../pages/NotFound"));

const PatientDashboard = lazy(() => import("../pages/patient/PatientDashboard"));
const DoctorListing = lazy(() => import("../pages/patient/DoctorListing"));
const DoctorProfile = lazy(() => import("../pages/patient/DoctorProfile"));
const AppointmentBooking = lazy(() => import("../pages/patient/AppointmentBooking"));
const Checkout = lazy(() => import("../pages/patient/Checkout"));
const VideoConsultation = lazy(() => import("../pages/patient/VideoConsultation"));
const PatientAppointments = lazy(() => import("../pages/patient/PatientAppointments"));
const HealthRecords = lazy(() => import("../pages/patient/HealthRecords"));
const SampleCollection = lazy(() => import("../pages/patient/SampleCollection"));
const AmbulanceBooking = lazy(() => import("../pages/patient/AmbulanceBooking"));
const BMICalculator = lazy(() => import("../pages/patient/BMICalculator"));

const DoctorDashboard = lazy(() => import("../pages/doctor/DoctorDashboard"));
const DoctorAvailability = lazy(() => import("../pages/doctor/DoctorAvailability"));
const DoctorPatients = lazy(() => import("../pages/doctor/DoctorPatients"));
const DoctorReviews = lazy(() => import("../pages/doctor/DoctorReviews"));
const PrescriptionWriting = lazy(() => import("../pages/doctor/PrescriptionWriting"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const DoctorVerification = lazy(() => import("../pages/admin/DoctorVerification"));
const ManageDoctors = lazy(() => import("../pages/admin/ManageDoctors"));
const ManagePatients = lazy(() => import("../pages/admin/ManagePatients"));
const ManageLabAssistants = lazy(() => import("../pages/admin/ManageLabAssistants"));
const ManageAmbulances = lazy(() => import("../pages/admin/ManageAmbulances"));
const Transactions = lazy(() => import("../pages/admin/Transactions"));
const Reports = lazy(() => import("../pages/admin/Reports"));

const protectedRoutes = [
  { path: "/profile", role: null, anyRole: true, Page: Profile },
  { path: "/patient/dashboard", role: "patient", Page: PatientDashboard },
  { path: "/patient/book/:doctorId", role: "patient", Page: AppointmentBooking },
  { path: "/patient/checkout", role: "patient", Page: Checkout },
  { path: "/patient/consultation/:appointmentId", role: "patient", Page: VideoConsultation },
  { path: "/patient/appointments", role: "patient", Page: PatientAppointments },
  { path: "/patient/records", role: "patient", Page: HealthRecords },
  { path: "/patient/sample-collection", role: "patient", Page: SampleCollection },
  { path: "/patient/ambulance", role: "patient", Page: AmbulanceBooking },
  { path: "/patient/bmi-calculator", role: "patient", Page: BMICalculator },
  { path: "/doctor/dashboard", role: "doctor", Page: DoctorDashboard },
  { path: "/doctor/availability", role: "doctor", Page: DoctorAvailability },
  { path: "/doctor/patients", role: "doctor", Page: DoctorPatients },
  { path: "/doctor/reviews", role: "doctor", Page: DoctorReviews },
  { path: "/doctor/prescriptions/:appointmentId", role: "doctor", Page: PrescriptionWriting },
  { path: "/admin/dashboard", role: "admin", Page: AdminDashboard },
  { path: "/admin/verify-doctors", role: "admin", Page: DoctorVerification },
  { path: "/admin/doctors", role: "admin", Page: ManageDoctors },
  { path: "/admin/patients", role: "admin", Page: ManagePatients },
  { path: "/admin/lab-assistants", role: "admin", Page: ManageLabAssistants },
  { path: "/admin/ambulances", role: "admin", Page: ManageAmbulances },
  { path: "/admin/transactions", role: "admin", Page: Transactions },
  { path: "/admin/reports", role: "admin", Page: Reports },
];

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />

        {/* Public browsing */}
        <Route path="/patient/doctors" element={<DoctorListing />} />
        <Route path="/patient/doctors/:id" element={<DoctorProfile />} />

        {/* Role-protected */}
        {protectedRoutes.map(({ path, role, anyRole, Page }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRole={role} anyRole={anyRole}>
                <Page />
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
