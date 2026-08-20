import { useState } from "react";
import { Ambulance, MapPin, Phone, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import { Input } from "../../components/shared/Field";

const ambulanceTypes = [
  { id: "basic", label: "Basic", desc: "Standard transport with first-aid" },
  { id: "icu", label: "ICU", desc: "Life support & critical care equipped" },
  { id: "freezer", label: "Freezer", desc: "For deceased body transport" },
];

const mockDrivers = [
  { name: "Md. Jasim Uddin", vehicle: "Dhaka Metro-GA 11-2234", phone: "+8801722334455", eta: "8 mins" },
  { name: "Abul Kalam", vehicle: "Dhaka Metro-HA 09-8871", phone: "+8801811223399", eta: "6 mins" },
];

export default function AmbulanceBooking() {
  const [type, setType] = useState("basic");
  const [stage, setStage] = useState("idle"); // idle | searching | assigned
  const [driver, setDriver] = useState(null);
  const { addToast } = useToast();

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormValidation(
    { pickup: "", drop: "" },
    {
      pickup: validators.required,
      drop: validators.required,
    }
  );

  const handleSubmitForm = async () => {
    setStage("searching");
    setTimeout(() => {
      const assigned = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
      setDriver(assigned);
      setStage("assigned");
      addToast("Ambulance assigned!", "success");
    }, 2000);
  };

  const handleCancelRequest = () => {
    setStage("idle");
    setDriver(null);
    addToast("Ambulance request cancelled.", "info");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-red-50 text-red-600 rounded-xl p-2.5">
          <Ambulance size={22} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Ambulance Booking</h1>
      </div>
      <p className="text-gray-500 mb-8">Request emergency ambulance service with live tracking.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center min-h-72 text-gray-400 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,118,110,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,0.08) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <MapPin size={40} className="text-teal-500 relative z-10" aria-hidden="true" />
          <p className="text-sm mt-2 relative z-10">Live map preview (mock)</p>
          {stage === "assigned" && (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full mt-3 relative z-10">
              ETA: {driver?.eta}
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {stage !== "assigned" ? (
            <form onSubmit={handleSubmit(handleSubmitForm)} noValidate className="space-y-4">
              <Input
                name="pickup"
                label="Pickup Location"
                placeholder="e.g. House 12, Road 5, Dhanmondi"
                autoComplete="street-address"
                value={values.pickup}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.pickup ? errors.pickup : ""}
                disabled={stage === "searching"}
              />
              <Input
                name="drop"
                label="Drop Location (Hospital)"
                placeholder="e.g. Square Hospital, Dhaka"
                autoComplete="off"
                value={values.drop}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.drop ? errors.drop : ""}
                disabled={stage === "searching"}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ambulance Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {ambulanceTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={stage === "searching"}
                      onClick={() => setType(t.id)}
                      aria-pressed={type === t.id}
                      className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                        type === t.id
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-500 hover:border-red-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {ambulanceTypes.find((t) => t.id === type)?.desc}
                </p>
              </div>

              <button
                type="submit"
                disabled={stage === "searching"}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                {stage === "searching" ? (
                  <>
                    <span className="animate-spin rounded-full border-2 border-white/30 border-t-white w-4 h-4" aria-hidden="true" />
                    Searching for ambulance...
                  </>
                ) : (
                  "Request Ambulance"
                )}
              </button>
            </form>
          ) : (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Ambulance Assigned</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-semibold">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{driver.name}</p>
                  <p className="text-xs text-gray-500">{driver.vehicle}</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-4">
                <span>Estimated Arrival</span>
                <span className="font-semibold">{driver.eta}</span>
              </div>
              <div className="flex gap-3">
                <a
                  href={`tel:${driver.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  <Phone size={16} aria-hidden="true" />
                  Call Driver
                </a>
                <button
                  onClick={handleCancelRequest}
                  className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  <X size={16} aria-hidden="true" />
                  Cancel Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
