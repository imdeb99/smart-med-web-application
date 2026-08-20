import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { usePatients } from "../context/PatientsContext";
import { useDoctors } from "../context/DoctorsContext";
import { DEMO_PATIENT_ID, DEMO_DOCTOR_ID } from "../utils/constants";

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { patients } = usePatients();
  const { doctors } = useDoctors();

  // Demo mode: the profile is backed by the logged-in user record plus the
  // fixed demo patient/doctor record (see utils/constants.js).
  const linkedPatient = patients.find((p) => p.id === DEMO_PATIENT_ID);
  const linkedDoctor = doctors.find((d) => d.id === DEMO_DOCTOR_ID);

  const [form, setForm] = useState(() => {
    if (!user) return {};
    if (user.role === "doctor") {
      return {
        name: user.name || "",
        email: user.email || "",
        phone: linkedDoctor?.phone || "",
        bmdcId: linkedDoctor?.bmdcId || "",
        specialty: linkedDoctor?.specialty || "",
      };
    }
    return {
      name: user.name || "",
      email: user.email || "",
      phone: linkedPatient?.phone || "",
      address: linkedPatient?.address || "",
    };
  });

  if (!user) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-gray-600">Please log in to view your profile.</p>
        <Link to="/login" className="text-teal-600 hover:underline mt-3 inline-block">
          Go to login
        </Link>
      </div>
    );
  }

  const isDoctor = user.role === "doctor";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    addToast("Profile updated (saved locally for this session).", "success");
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Home
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
          <div className="bg-teal-50 text-teal-600 rounded-full p-3">
            <UserCircle size={32} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-sm text-gray-500 capitalize">
              {user.role} account · {user.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClass} />
            </div>
            {isDoctor ? (
              <>
                <div>
                  <label htmlFor="bmdcId" className="block text-sm font-medium text-gray-700 mb-1">
                    BMDC Registration ID
                  </label>
                  <input id="bmdcId" name="bmdcId" value={form.bmdcId} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty
                  </label>
                  <input id="specialty" name="specialty" value={form.specialty} onChange={handleChange} className={inputClass} />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input id="address" name="address" value={form.address} onChange={handleChange} className={inputClass} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <p className="text-xs text-gray-400">
              Demo mode: changes are saved locally in this session only — no backend yet.
            </p>
            <button
              type="submit"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Save size={16} aria-hidden="true" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
