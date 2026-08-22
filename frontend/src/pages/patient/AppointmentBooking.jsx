import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Video, MapPin, BadgeCheck, Loader2, Users } from "lucide-react";
import { useDoctors } from "../../context/DoctorsContext";
import { getNextDays } from "../../utils/helpers";
import { getDoctorDailyCapacity } from "../../api/capacity";
import { socket, joinCapacityRoom, leaveCapacityRoom } from "../../lib/socket";

// Standard fallback slots shown while the doctor has no availability
// configured (the availability model doesn't exist on the backend yet).
const FALLBACK_SLOTS = ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "04:30 PM"];

export default function AppointmentBooking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { getDoctorById } = useDoctors();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => getNextDays(7), []);
  const [type, setType] = useState("video");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Real-time daily capacity for the selected doctor+date.
  const [capacity, setCapacity] = useState(null);
  const [capacityLoading, setCapacityLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const result = await getDoctorById(doctorId);
      if (!cancelled) {
        setDoctor(result);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [doctorId, getDoctorById]);

  // Fetch initial capacity + subscribe to live updates when a date is picked.
  useEffect(() => {
    if (!doctorId || !selectedDate) return undefined;

    let cancelled = false;
    setCapacityLoading(true);

    const fetchInitial = async () => {
      try {
        const data = await getDoctorDailyCapacity(doctorId, selectedDate);
        if (!cancelled) {
          setCapacity(data.capacity);
        }
      } catch {
        if (!cancelled) setCapacity(null);
      } finally {
        if (!cancelled) setCapacityLoading(false);
      }
    };
    fetchInitial();

    joinCapacityRoom(doctorId, selectedDate);
    const onUpdate = (payload) => {
      if (payload?.doctorId === doctorId && payload?.date === selectedDate) {
        setCapacity(payload.capacity);
      }
    };
    socket.on("capacity-update", onUpdate);

    return () => {
      cancelled = true;
      socket.off("capacity-update", onUpdate);
      leaveCapacityRoom(doctorId, selectedDate);
    };
  }, [doctorId, selectedDate]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-teal-600" aria-hidden="true" />
      </div>
    );
  }

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
  const availableSlots = doctor.availableSlots.length > 0 ? doctor.availableSlots : FALLBACK_SLOTS;

  const handleProceed = () => {
    if (!canProceed) return;
    navigate("/patient/checkout", {
      state: {
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctorAvatar: doctor.avatar,
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

        {/* Real-time capacity */}
        {selectedDate && (
          <div className="mt-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="bg-teal-50 text-teal-600 rounded-full p-2.5 shrink-0">
                <Users size={18} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Daily capacity for {selectedDate}</p>
                {capacityLoading && capacity === null ? (
                  <p className="text-sm font-medium text-gray-400">Loading availability...</p>
                ) : capacity ? (
                  <p className="text-sm font-medium text-gray-800">
                    <span className="text-teal-700 font-bold">{capacity.available}</span> of{" "}
                    {capacity.totalCapacity} slots available
                    {capacity.booked > 0 && (
                      <span className="text-gray-400 font-normal"> · {capacity.booked} booked</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-400">
                    No daily capacity configured for this date.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Slot picker */}
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-gray-700 mb-3">Select Time Slot</legend>
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((slot) => (
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
          {doctor.availableSlots.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">
              The doctor hasn't set availability yet — showing standard time slots.
            </p>
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
