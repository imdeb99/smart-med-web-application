import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarX } from "lucide-react";
import { useAppointments } from "../../context/AppointmentsContext";
import { DEMO_PATIENT_ID } from "../../utils/constants";
import { useDoctors } from "../../context/DoctorsContext";
import { useToast } from "../../context/ToastContext";
import { getNextDays, formatDate } from "../../utils/helpers";
import AppointmentCard from "../../components/shared/AppointmentCard";
import Modal from "../../components/shared/Modal";
import EmptyState from "../../components/shared/EmptyState";

export default function PatientAppointments() {
  const { appointments, cancelAppointment, rescheduleAppointment } = useAppointments();
  const { getDoctorById } = useDoctors();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState("upcoming");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [newSlot, setNewSlot] = useState(null);

  const days = useMemo(() => getNextDays(7), []);

  const myAppointments = appointments.filter((a) => a.patientId === DEMO_PATIENT_ID);
  const upcoming = myAppointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = myAppointments
    .filter((a) => a.status !== "upcoming")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const list = tab === "upcoming" ? upcoming : past;

  const openReschedule = (appointment) => {
    setRescheduleTarget(appointment);
    setNewDate(null);
    setNewSlot(null);
  };

  const confirmCancel = () => {
    cancelAppointment(cancelTarget.id);
    addToast("Appointment cancelled.", "info");
    setCancelTarget(null);
  };

  const confirmReschedule = () => {
    if (!newDate || !newSlot) return;
    rescheduleAppointment(rescheduleTarget.id, newDate, newSlot);
    addToast("Appointment rescheduled successfully.", "success");
    setRescheduleTarget(null);
  };

  const rescheduleDoctor = rescheduleTarget && getDoctorById(rescheduleTarget.doctorId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h1>
      <p className="text-gray-500 mb-6">Manage your upcoming and past consultations.</p>

      <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-6" role="group" aria-label="Appointment list">
        {["upcoming", "past"].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === key ? "bg-white text-teal-700 shadow-sm" : "text-gray-500"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            icon={CalendarX}
            title={`No ${tab} appointments`}
            message={
              tab === "upcoming"
                ? "Book a consultation with a verified doctor to see it here."
                : "Completed or cancelled appointments will appear here."
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={tab === "upcoming" ? () => setCancelTarget(appointment) : undefined}
              onReschedule={tab === "upcoming" ? () => openReschedule(appointment) : undefined}
              onJoin={
                tab === "upcoming"
                  ? () => navigate(`/patient/consultation/${appointment.id}`)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Appointment"
        footer={
          <>
            <button
              onClick={() => setCancelTarget(null)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Keep Appointment
            </button>
            <button
              onClick={confirmCancel}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Yes, Cancel
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel this appointment
          {cancelTarget && ` on ${formatDate(cancelTarget.date)} at ${cancelTarget.time}`}? This
          action cannot be undone.
        </p>
      </Modal>

      {/* Reschedule modal */}
      <Modal
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Appointment"
        footer={
          <>
            <button
              onClick={() => setRescheduleTarget(null)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={confirmReschedule}
              disabled={!newDate || !newSlot}
              className="px-4 py-2 text-sm font-medium bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg"
            >
              Confirm New Slot
            </button>
          </>
        }
      >
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Choose a new date and time for your appointment with{" "}
            <span className="font-medium text-gray-800">{rescheduleDoctor?.name}</span>.
          </p>

          <h4 className="text-xs font-semibold text-gray-600 mb-2">Select Date</h4>
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
            {days.map((day) => (
              <button
                key={day.iso}
                onClick={() => setNewDate(day.iso)}
                aria-pressed={newDate === day.iso}
                className={`flex flex-col items-center justify-center min-w-14 rounded-lg border py-2 text-xs font-medium shrink-0 ${
                  newDate === day.iso
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                <span>{day.weekday}</span>
                <span className="text-sm font-bold">{day.day}</span>
              </button>
            ))}
          </div>

          <h4 className="text-xs font-semibold text-gray-600 mb-2">Select Time</h4>
          {!rescheduleDoctor || rescheduleDoctor.availableSlots.length === 0 ? (
            <p className="text-sm text-gray-400">No slots available for this doctor.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {rescheduleDoctor.availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setNewSlot(slot)}
                  aria-pressed={newSlot === slot}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    newSlot === slot
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
