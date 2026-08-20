import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Video, MapPin, BadgeCheck } from "lucide-react";
import { useDoctors } from "../../context/DoctorsContext";
import { getNextDays } from "../../utils/helpers";

export default function AppointmentBooking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { getDoctorById } = useDoctors();
  const doctor = getDoctorById(doctorId);

  const days = useMemo(() => getNextDays(7), []);
  const [type, setType] = useState("video");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!doctor) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-gray-600">Doctor not found.</p>
        <Link to="/patient/doctors" className="text-teal-600 hover:underline mt-3 inline-block">
          Back to doctor listing
        </Link>
      </div>
    );
  }

  const canProceed = selectedDate && selectedSlot;

  const handleProceed = () => {
    if (!canProceed) return;
    navigate("/patient/checkout", {
      state: {
        doctorId: doctor.id,
        date: selectedDate,
        time: selectedSlot,
        type,
        fee: doctor.fee,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to={`/patient/doctors/${doctor.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to profile
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <img src={doctor.avatar} alt={doctor.name} className="w-14 h-14 rounded-full object-cover" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-gray-800">{doctor.name}</h1>
              {doctor.verified && (
                <BadgeCheck size={15} className="text-emerald-500" aria-label="Verified doctor" />
              )}
            </div>
            <p className="text-sm text-teal-600">{doctor.specialty}</p>
          </div>
        </div>

        {/* Consultation type */}
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-gray-700 mb-3">Consultation Type</legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("video")}
              aria-pressed={type === "video"}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${
                type === "video"
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-gray-200 text-gray-500 hover:border-teal-300"
              }`}
            >
              <Video size={16} aria-hidden="true" />
              Video Consultation
            </button>
            <button
              type="button"
              onClick={() => setType("in-person")}
              aria-pressed={type === "in-person"}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${
                type === "in-person"
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-gray-200 text-gray-500 hover:border-teal-300"
              }`}
            >
              <MapPin size={16} aria-hidden="true" />
              In-person Visit
            </button>
          </div>
        </fieldset>

        {/* Date picker */}
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-gray-700 mb-3">Select Date</legend>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                type="button"
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                aria-pressed={selectedDate === day.iso}
                className={`flex flex-col items-center justify-center min-w-16 rounded-xl border py-3 text-sm font-medium transition-colors shrink-0 ${
                  selectedDate === day.iso
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-500 hover:border-teal-300"
                }`}
              >
                <span className="text-xs">{day.weekday}</span>
                <span className="text-lg font-bold">{day.day}</span>
                <span className="text-xs">{day.month}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Slot picker */}
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-gray-700 mb-3">Select Time Slot</legend>
          {doctor.availableSlots.length === 0 ? (
            <p className="text-sm text-gray-400">No time slots available for this doctor.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {doctor.availableSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  aria-pressed={selectedSlot === slot}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedSlot === slot
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-gray-200 text-gray-500 hover:border-teal-300"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </fieldset>

        {/* Summary */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 rounded-xl p-4">
          <div>
            <p className="text-xs text-gray-500">Consultation Fee</p>
            <p className="text-lg font-bold text-gray-800">৳{doctor.fee}</p>
          </div>
          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
