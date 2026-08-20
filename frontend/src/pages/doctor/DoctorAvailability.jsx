import { useState } from "react";
import { Plus, X, Save } from "lucide-react";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import { useToast } from "../../context/ToastContext";

const STORAGE_KEY = "smartmed_doctor_availability";

const defaultAvailability = {
  Monday: { active: true, slots: ["09:00 AM", "11:00 AM", "02:00 PM"] },
  Tuesday: { active: true, slots: ["10:00 AM", "01:00 PM"] },
  Wednesday: { active: false, slots: [] },
  Thursday: { active: true, slots: ["09:00 AM", "12:00 PM", "04:00 PM"] },
  Friday: { active: true, slots: ["09:00 AM", "10:30 AM"] },
  Saturday: { active: true, slots: ["11:00 AM"] },
  Sunday: { active: false, slots: [] },
};

const SLOT_RE = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i;

function loadAvailability() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultAvailability;
  } catch {
    return defaultAvailability;
  }
}

export default function DoctorAvailability() {
  const [availability, setAvailability] = useState(loadAvailability);
  const [drafts, setDrafts] = useState({});
  const [slotErrors, setSlotErrors] = useState({});
  const { addToast } = useToast();

  const toggleDay = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }));
  };

  const addSlot = (day) => {
    const value = drafts[day]?.trim();
    if (!value) {
      setSlotErrors((prev) => ({ ...prev, [day]: "Enter a time slot first." }));
      return;
    }
    if (!SLOT_RE.test(value)) {
      setSlotErrors((prev) => ({ ...prev, [day]: "Use a valid time like 09:00 AM." }));
      return;
    }
    if (availability[day].slots.includes(value)) {
      setSlotErrors((prev) => ({ ...prev, [day]: "This slot already exists." }));
      return;
    }
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], slots: [...prev[day].slots, value] },
    }));
    setDrafts((prev) => ({ ...prev, [day]: "" }));
    setSlotErrors((prev) => ({ ...prev, [day]: "" }));
  };

  const removeSlot = (day, slot) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], slots: prev[day].slots.filter((s) => s !== slot) },
    }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(availability));
    addToast("Availability updated successfully.", "success");
  };

  return (
    <DoctorLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Availability & Slots</h1>
          <p className="text-gray-500 mt-2">
            Set your weekly recurring schedule. Patients can only book within these slots.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Save size={16} aria-hidden="true" />
          Save Changes
        </button>
      </div>

      <div className="grid gap-4 mt-6">
        {Object.entries(availability).map(([day, { active, slots }]) => (
          <div
            key={day}
            className={`bg-white rounded-2xl border p-5 transition-colors ${
              active ? "border-gray-100" : "border-gray-100 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">{day}</h3>
              <button
                role="switch"
                aria-checked={active}
                aria-label={`${day} availability`}
                onClick={() => toggleDay(day)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  active ? "bg-teal-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {active && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {slots.length === 0 && (
                    <p className="text-xs text-gray-400">No slots added yet.</p>
                  )}
                  {slots.map((slot) => (
                    <span
                      key={slot}
                      className="flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg"
                    >
                      {slot}
                      <button onClick={() => removeSlot(day, slot)} aria-label={`Remove slot ${slot}`}>
                        <X size={12} aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex-1 max-w-40">
                    <label htmlFor={`slot-${day}`} className="sr-only">
                      Add a time slot for {day}
                    </label>
                    <input
                      id={`slot-${day}`}
                      type="text"
                      value={drafts[day] || ""}
                      onChange={(e) => {
                        setDrafts((prev) => ({ ...prev, [day]: e.target.value }));
                        if (slotErrors[day]) setSlotErrors((prev) => ({ ...prev, [day]: "" }));
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSlot(day))}
                      placeholder="e.g. 09:00 AM"
                      aria-invalid={slotErrors[day] ? true : undefined}
                      aria-describedby={slotErrors[day] ? `slot-${day}-error` : undefined}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 ${
                        slotErrors[day]
                          ? "border-red-300 focus:ring-red-300"
                          : "border-gray-200 focus:ring-teal-500 focus:border-teal-500"
                      }`}
                    />
                    {slotErrors[day] && (
                      <p id={`slot-${day}-error`} role="alert" className="text-xs text-red-600 mt-1">
                        {slotErrors[day]}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => addSlot(day)}
                    className="flex items-center gap-1 text-xs font-medium border border-teal-200 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors shrink-0"
                  >
                    <Plus size={13} aria-hidden="true" />
                    Add Slot
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </DoctorLayout>
  );
}
