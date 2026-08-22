import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, User, UserRound, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import { Input, Select } from "../../components/shared/Field";
import { specialties } from "../../data/mockDoctors";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  dob: "",
  gender: "Female",
  specialty: specialties[0],
  bmdcId: "",
  qualification: "",
  experienceYears: "",
  consultationFee: "",
};

// Backend requires min 8 chars (see backend/src/modules/auth/auth.routes.js).
const min8 = validators.minLength(8);

export default function Register() {
  const [accountType, setAccountType] = useState("patient");
  const [formError, setFormError] = useState("");
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } =
    useFormValidation(initialForm, {
      name: validators.required,
      email: validators.email,
      phone: validators.phone,
      password: min8,
      confirmPassword: (v, allValues) =>
        v !== allValues.password ? "Passwords do not match." : "",
      ...(accountType === "doctor"
        ? {
            bmdcId: validators.required,
            qualification: validators.required,
            experienceYears: validators.number,
            consultationFee: validators.number,
          }
        : {}),
    });

  const onSubmit = async (form) => {
    setFormError("");
    const result = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: accountType.toUpperCase(), // backend expects PATIENT|DOCTOR
      ...(accountType === "doctor"
        ? {
            specialty: form.specialty,
            bmdcId: form.bmdcId,
            bio: form.qualification,
            consultationFee: Number(form.consultationFee),
          }
        : {
            dob: form.dob || null,
            gender: form.gender,
          }),
    });

    if (!result.success) {
      setFormError(result.error);
      addToast(result.error, "error");
      return;
    }

    setFormError("");
    addToast("Account created successfully!", "success");
    navigate(`/${accountType}/dashboard`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Link to="/" className="flex items-center gap-2 text-teal-700 font-bold text-lg mb-6">
          <span className="bg-teal-600 text-white rounded-xl p-1.5">
            <Stethoscope size={20} />
          </span>
          SMART-MED
        </Link>

        <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
        <p className="text-gray-500 mt-1 mb-6">Join SMART-MED as a patient or a doctor.</p>

        <div className="grid grid-cols-2 gap-2 mb-6" role="group" aria-label="Account type">
          <button
            type="button"
            onClick={() => setAccountType("patient")}
            aria-pressed={accountType === "patient"}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${
              accountType === "patient"
                ? "border-teal-600 bg-teal-50 text-teal-700"
                : "border-gray-200 text-gray-500 hover:border-teal-300"
            }`}
          >
            <User size={18} />
            I'm a Patient
          </button>
          <button
            type="button"
            onClick={() => setAccountType("doctor")}
            aria-pressed={accountType === "doctor"}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors ${
              accountType === "doctor"
                ? "border-teal-600 bg-teal-50 text-teal-700"
                : "border-gray-200 text-gray-500 hover:border-teal-300"
            }`}
          >
            <UserRound size={18} />
            I'm a Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
              disabled={submitting}
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
              disabled={submitting}
            />
          </div>

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ""}
            disabled={submitting}
          />

          {accountType === "patient" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                name="dob"
                label="Date of Birth"
                value={values.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={submitting}
              />
              <Select
                name="gender"
                label="Gender"
                value={values.gender}
                onChange={handleChange}
                disabled={submitting}
              >
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </Select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  name="specialty"
                  label="Specialty"
                  value={values.specialty}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  {specialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <Input
                  name="bmdcId"
                  label="BMDC Registration ID"
                  placeholder="e.g. A-58231"
                  value={values.bmdcId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.bmdcId ? errors.bmdcId : ""}
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  name="qualification"
                  label="Qualification"
                  placeholder="e.g. MBBS, FCPS"
                  value={values.qualification}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.qualification ? errors.qualification : ""}
                  disabled={submitting}
                />
                <Input
                  type="number"
                  name="consultationFee"
                  label="Consultation Fee (৳)"
                  placeholder="e.g. 1000"
                  min={0}
                  value={values.consultationFee}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.consultationFee ? errors.consultationFee : ""}
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  name="experienceYears"
                  label="Years of Experience"
                  placeholder="e.g. 5"
                  min={0}
                  value={values.experienceYears}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.experienceYears ? errors.experienceYears : ""}
                  disabled={submitting}
                />
              </div>
              <p className="text-xs text-gray-400">
                Your BMDC ID will be verified by our admin team before your profile goes live.
              </p>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ""}
              disabled={submitting}
            />
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword ? errors.confirmPassword : ""}
              disabled={submitting}
            />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
