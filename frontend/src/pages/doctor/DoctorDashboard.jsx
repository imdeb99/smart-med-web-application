import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  CalendarCheck,
  Users,
  Wallet,
  Star,
  CalendarClock,
  FileText,
  CalendarX2,
  Loader2,
} from "lucide-react";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import AppointmentRow from "../../components/doctor/AppointmentRow";
import EmptyState from "../../components/shared/EmptyState";
import { useAppointments } from "../../context/AppointmentsContext";
import { useDoctors } from "../../context/DoctorsContext";
import { useToast } from "../../context/ToastContext";

// Local YYYY-MM-DD (matches the adapter's toISODate, which uses local time).
const now = new Date();
const TODAY_ISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const CURRENT_MONTH = TODAY_ISO.slice(0, 7);

export default function DoctorDashboard() {
  const { appointments, isLoading, error, completeAppointment, refresh } = useAppointments();
  const { currentDoctor } = useDoctors();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const myAppointments = useMemo(
    () => appointments.filter((a) => a.doctorId === currentDoctor?.id),
    [appointments, currentDoctor?.id],
  );

  const todaysAppointments = myAppointments
    .filter((a) => a.date === TODAY_ISO && a.status === "upcoming")
    .sort((a, b) => a.time.localeCompare(b.time));

  const uniquePatients = new Set(myAppointments.map((a) => a.patientId));

  const monthlyEarnings = myAppointments
    .filter((a) => a.status === "completed" && a.date.startsWith(CURRENT_MONTH))
    .reduce((sum, a) => sum + a.fee, 0);

  const totalEarnings = myAppointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.fee, 0);

  const stats = [
    {
      label: "Today's Appointments",
      value: isLoading ? "…" : todaysAppointments.length,
      icon: CalendarCheck,
      color: "bg-teal-50 text-teal-600",
    },
    {
      label: "Total Patients",
      value: isLoading ? "…" : uniquePatients.size,
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "This Month's Earnings",
      value: isLoading ? "…" : `৳${monthlyEarnings}`,
      icon: Wallet,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Average Rating",
      value: currentDoctor ? currentDoctor.rating : "—",
      icon: Star,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const handleWritePrescription = (appointment) => {
    navigate(`/doctor/prescriptions/${appointment.id}`);
  };

  const handleComplete = async (appointment) => {
    try {
      await completeAppointment(appointment.id);
      addToast("Appointment marked as completed.", "success");
    } catch (err) {
      addToast(err.message || "Could not complete the appointment.", "error");
    }
  };

  return (
    <DoctorLayout>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-3xl font-bold text-gray-800">
          {currentDoctor ? `Welcome, ${currentDoctor.name}` : "Doctor Dashboard"}
        </h1>
        {currentDoctor?.verified && (
          <BadgeCheck size={22} className="text-emerald-500" aria-label="Verified doctor" />
        )}
      </div>
      <p className="text-gray-500 mb-8">
        {currentDoctor
          ? `${currentDoctor.specialty} · Total lifetime earnings: ৳${totalEarnings}`
          : "Loading your profile..."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mt-10 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Link
          to="/doctor/availability"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center gap-3"
        >
          <div className="rounded-xl p-3 bg-teal-50 text-teal-600">
            <CalendarClock size={20} aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-gray-700">Manage Availability</span>
        </Link>
        <Link
          to="/doctor/patients"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center gap-3"
        >
          <div className="rounded-xl p-3 bg-emerald-50 text-emerald-600">
            <Users size={20} aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-gray-700">View Patients</span>
        </Link>
        <Link
          to="/doctor/reviews"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center gap-3"
        >
          <div className="rounded-xl p-3 bg-purple-50 text-purple-600">
            <Star size={20} aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-gray-700">View Reviews</span>
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mt-10 mb-4">Today's Appointments</h2>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin text-teal-600" aria-hidden="true" />
          <span className="text-sm">Loading appointments...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={CalendarX2}
            title="Could not load appointments"
            message={error}
            action={
              <button
                onClick={refresh}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                Try Again
              </button>
            }
          />
        </div>
      ) : todaysAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={CalendarX2}
            title="No appointments scheduled for today"
            message="You're all caught up. New bookings will appear here."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {todaysAppointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              actions={
                <>
                  <button
                    onClick={() => handleWritePrescription(appointment)}
                    className="flex items-center gap-1.5 text-xs font-medium bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <FileText size={13} aria-hidden="true" />
                    Write Prescription
                  </button>
                  <button
                    onClick={() => handleComplete(appointment)}
                    className="text-xs font-medium border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-teal-300 transition-colors"
                  >
                    Mark Completed
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </DoctorLayout>
  );

}
