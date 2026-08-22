import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDoctors } from "../context/DoctorsContext";
import AvatarUpload from "../components/shared/AvatarUpload";

export default function Profile() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { addToast } = useToast();
  const { currentDoctor, updateOwnProfile } = useDoctors();

  // Initialize once from the real user record. `user` is loaded before this
  // page can render (ProtectedRoute waits for auth bootstrap), so no effect
  // needed — avoids the uncontrolled-input warning.
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bmdcId: currentDoctor?.bmdcId || "",
    specialty: currentDoctor?.specialty || "",
    bio: currentDoctor?.bio || "",
    consultationFee: currentDoctor?.fee ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      if (isDoctor) {
        // Name/phone are account fields; specialty/bio/fee are the profile.
        const account = await updateProfile({
          name: form.name,
          phone: form.phone || null,
        });
        if (!account.success) {
          throw new Error(account.error);
        }
        await updateOwnProfile({
          specialty: form.specialty,
          bio: form.bio,
          consultationFee: Number(form.consultationFee),
        });
      } else {
        const account = await updateProfile({
          name: form.name,
          phone: form.phone || null,
        });
        if (!account.success) {
          throw new Error(account.error);
        }
      }
      addToast("Profile updated.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save the profile.";
      setSaveError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
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
          <AvatarUpload
            name={user.name}
            src={user.avatar}
            sizeClass="w-16 h-16"
            onUpload={async (file) => {
              const newUrl = await uploadAvatar(file);
              addToast("Profile photo updated.", "success");
              return newUrl;
            }}
          />
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
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                disabled
                title="Email is your login identifier and cannot be changed."
                className={`${inputClass} bg-gray-50`}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClass} />
            </div>
            {isDoctor && (
              <>
                <div>
                  <label htmlFor="bmdcId" className="block text-sm font-medium text-gray-700 mb-1">
                    BMDC Registration ID
                  </label>
                  <input id="bmdcId" name="bmdcId" value={form.bmdcId} disabled className={`${inputClass} bg-gray-50`} />
                </div>
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty
                  </label>
                  <input id="specialty" name="specialty" value={form.specialty} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee (৳)
                  </label>
                  <input
                    id="consultationFee"
                    name="consultationFee"
                    type="number"
                    min="0"
                    value={form.consultationFee}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    value={form.bio}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <p className="text-xs text-gray-400">
              {isDoctor
                ? "Name, phone, specialty, bio and fee are saved to your account."
                : "Name and phone are saved to your account."}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Save size={16} aria-hidden="true" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
          {saveError && (
            <p role="alert" className="text-xs text-red-600">
              {saveError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
