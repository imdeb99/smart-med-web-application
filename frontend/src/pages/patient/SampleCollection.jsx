import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, CheckCircle2 } from "lucide-react";
import mockLabTests from "../../data/mockLabTests";
import { getNextDays } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import Modal from "../../components/shared/Modal";
import { Input } from "../../components/shared/Field";

const timeSlots = ["Morning (8AM - 11AM)", "Afternoon (12PM - 3PM)", "Evening (4PM - 7PM)"];

export default function SampleCollection() {
  const [selectedTests, setSelectedTests] = useState([]);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(timeSlots[0]);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const days = useMemo(() => getNextDays(7), []);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useFormValidation(
    { name: "", phone: "", addressLine: "", city: "" },
    {
      name: validators.required,
      phone: validators.phone,
      addressLine: validators.required,
      city: validators.required,
    }
  );

  const toggleTest = (id) => {
    setSelectedTests((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const total = mockLabTests
    .filter((t) => selectedTests.includes(t.id))
    .reduce((sum, t) => sum + t.price, 0);

  const canSubmit = selectedTests.length > 0 && date;

  const onSubmit = async () => {
    setSuccess(true);
    addToast("Sample collection scheduled!", "success");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-teal-50 text-teal-600 rounded-xl p-2.5">
          <FlaskConical size={22} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Home Sample Collection</h1>
      </div>
      <p className="text-gray-500 mb-8">Book lab tests and get your sample collected at home.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-6">
          <fieldset className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <legend className="text-sm font-semibold text-gray-700 mb-4">Select Tests</legend>
            {selectedTests.length === 0 && (
              <p className="text-xs text-amber-600 mb-2">Select at least one test to continue.</p>
            )}
            <div className="space-y-2">
              {mockLabTests.map((test) => (
                <label
                  key={test.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                    selectedTests.includes(test.id)
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => toggleTest(test.id)}
                      className="accent-teal-600 w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{test.name}</p>
                      <p className="text-xs text-gray-400">Sample: {test.sampleType}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">৳{test.price}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Collection Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="name"
                label="Full Name"
                placeholder="Full name"
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name ? errors.name : ""}
              />
              <Input
                type="tel"
                name="phone"
                label="Phone Number"
                placeholder="+880 1XXXXXXXXX"
                autoComplete="tel"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phone ? errors.phone : ""}
              />
              <Input
                name="addressLine"
                label="Address Line"
                placeholder="House, road, area"
                autoComplete="street-address"
                className="sm:col-span-2"
                value={values.addressLine}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.addressLine ? errors.addressLine : ""}
              />
              <Input
                name="city"
                label="City"
                placeholder="City"
                autoComplete="address-level2"
                value={values.city}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.city ? errors.city : ""}
              />
            </div>

            <h3 className="text-xs font-semibold text-gray-600 mt-5 mb-2">Preferred Date</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((day) => (
                <button
                  type="button"
                  key={day.iso}
                  onClick={() => setDate(day.iso)}
                  aria-pressed={date === day.iso}
                  className={`flex flex-col items-center justify-center min-w-14 rounded-lg border py-2 text-xs font-medium shrink-0 ${
                    date === day.iso
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  <span>{day.weekday}</span>
                  <span className="text-sm font-bold">{day.day}</span>
                </button>
              ))}
            </div>

            <h3 className="text-xs font-semibold text-gray-600 mt-5 mb-2">Preferred Time</h3>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSlot(s)}
                  aria-pressed={slot === s}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    slot === s
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Order Summary</h2>
            {selectedTests.length === 0 ? (
              <p className="text-sm text-gray-400">No tests selected yet.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {mockLabTests
                  .filter((t) => selectedTests.includes(t.id))
                  .map((t) => (
                    <div key={t.id} className="flex justify-between text-gray-600">
                      <span>{t.name}</span>
                      <span>৳{t.price}</span>
                    </div>
                  ))}
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-800 pt-4 mt-4 border-t border-gray-100">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full mt-5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              Schedule Collection
            </button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={success}
        onClose={() => navigate("/patient/dashboard")}
        title="Booking Confirmed"
        footer={
          <button
            onClick={() => navigate("/patient/dashboard")}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        }
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="bg-emerald-50 text-emerald-600 rounded-full p-3 mb-3">
            <CheckCircle2 size={28} aria-hidden="true" />
          </div>
          <p className="text-sm text-gray-600">
            Your sample collection has been scheduled. Our technician will visit your address
            during the selected time slot.
          </p>
        </div>
      </Modal>
    </div>
  );
}
