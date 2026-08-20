import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Stethoscope, Mail, Lock, User, UserRound, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import { Input } from "../../components/shared/Field";
import mockUsers from "../../data/mockUsers";

const roles = [
  { key: "patient", label: "Patient", icon: User },
  { key: "doctor", label: "Doctor", icon: UserRound },
  { key: "admin", label: "Admin", icon: ShieldCheck },
];

export default function Login() {
  const [role, setRole] = useState("patient");
  const [formError, setFormError] = useState("");
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit, setValues } =
    useFormValidation(
      { email: "", password: "" },
      {
        email: validators.email,
        password: validators.required,
      }
    );

  const demoUser = mockUsers.find((u) => u.role === role);

  // Set when a guest tried to open a protected service and was sent here.
  const redirectTarget = location.state?.from;

  const fillDemoCredentials = () => {
    setFormError("");
    setValues({ email: demoUser.email, password: demoUser.password });
  };

  const onSubmit = async ({ email, password }) => {
    const result = login({ email, password, role });
    if (!result.success) {
      setFormError(result.error);
      addToast(result.error, "error");
      return;
    }
    addToast("Login successful. Welcome back!", "success");
    // Respect the original destination when available (e.g. a service link
    // clicked while logged out, or a deep-link guard).
    const from = location.state?.from;
    if (from && from !== "/login") {
      navigate(from, { replace: true });
    } else {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-linear-to-br from-teal-600 to-emerald-600 text-white p-10">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="bg-white/20 rounded-xl p-2">
            <Stethoscope size={22} />
          </span>
          SMART-MED
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-snug">
            Healthcare, simplified. <br /> Anytime, anywhere.
          </h2>
          <p className="mt-4 text-teal-50/90 max-w-md">
            Connect with verified doctors, book appointments, and manage your health records — all in one place.
          </p>
        </div>
        <p className="text-sm text-teal-50/70">© {new Date().getFullYear()} SMART-MED</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
          <p className="text-gray-500 mt-1 mb-6">Sign in to continue to your account.</p>

          {redirectTarget && (
            <div
              role="status"
              className="bg-teal-50 border border-teal-200 text-teal-800 rounded-xl px-4 py-3 text-sm mb-6"
            >
              Please log in or try our demo to access this feature.
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-6" role="group" aria-label="Account type">
            {roles.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                aria-pressed={role === key}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-sm font-medium transition-colors ${
                  role === key
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-500 hover:border-teal-300"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="you@example.com"
              icon={Mail}
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : ""}
            />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              icon={Lock}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ""}
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-teal-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Signing in..." : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>

          {formError && <p className="text-sm text-red-600 mt-4 text-center">{formError}</p>}

          <div className="text-xs text-gray-400 mt-4 text-center">
            Demo login: {demoUser?.email} / {demoUser?.password}{" "}
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-teal-600 font-medium hover:underline"
            >
              Autofill
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-teal-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
