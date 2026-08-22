import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  FlaskConical,
  Ambulance,
  Calculator,
  FileHeart,
  CalendarCheck,
  History,
  ArrowRight,
  CalendarX2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useAppointments } from "../../context/AppointmentsContext";
import AppointmentCard from "../../components/shared/AppointmentCard";
import PageSkeleton from "../../components/shared/PageSkeleton";
import EmptyState from "../../components/shared/EmptyState";
import { Loader2 } from "lucide-react";

const quickActions = [
  { label: "Find a Doctor", to: "/patient/doctors", icon: Search, color: "bg-teal-50 text-teal-600" },
  { label: "Sample Collection", to: "/patient/sample-collection", icon: FlaskConical, color: "bg-emerald-50 text-emerald-600" },
  { label: "Book Ambulance", to: "/patient/ambulance", icon: Ambulance, color: "bg-red-50 text-red-600" },
  { label: "BMI Calculator", to: "/patient/bmi-calculator", icon: Calculator, color: "bg-amber-50 text-amber-600" },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const { appointments, isLoading } = useAppointments();
  const navigate = useNavigate();

  if (!user) return <PageSkeleton />;

  // The API list is already scoped to the logged-in patient.
  const myAppointments = appointments;
  const upcoming = myAppointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = myAppointments.filter((a) => a.status === "completed");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name || "there"} 👋</h1>
      <p className="text-gray-500 mt-2">Here's what's happening with your health today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-teal-50 text-teal-600 rounded-xl p-3">
            <CalendarCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{upcoming.length}</p>
            <p className="text-xs text-gray-500">Upcoming Appointments</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 rounded-xl p-3">
            <History size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{past.length}</p>
            <p className="text-xs text-gray-500">Past Visits</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 rounded-xl p-3">
            <FileHeart size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{past.length}</p>
            <p className="text-xs text-gray-500">Health Records</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mt-10 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map(({ label, to, icon: Icon, color }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center gap-3"
          >
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon size={20} aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
        <Link
          to="/patient/appointments"
          className="flex items-center gap-1.5 text-sm text-teal-600 font-medium hover:underline"
        >
          View all <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin text-teal-600" aria-hidden="true" />
          <span className="text-sm">Loading appointments...</span>
        </div>
      ) : upcoming.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={CalendarX2}
            title="No upcoming appointments"
            message="Find a doctor and book your first consultation to get started."
            action={
              <Link
                to="/patient/doctors"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                <Search size={16} aria-hidden="true" />
                Find a Doctor
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {upcoming.slice(0, 3).map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onJoin={() => navigate(`/patient/consultation/${appointment.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
