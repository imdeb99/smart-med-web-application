import { useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import { Input } from "../../components/shared/Field";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } =
    useFormValidation(
      { email: "" },
      { email: validators.email }
    );

  const onSubmit = async () => {
    setSent(true);
    addToast("Password reset link sent (demo).", "success");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Link to="/" className="flex items-center gap-2 text-teal-700 font-bold text-lg mb-6">
          <span className="bg-teal-600 text-white rounded-xl p-1.5">
            <Stethoscope size={20} />
          </span>
          SMART-MED
        </Link>

        <h1 className="text-2xl font-bold text-gray-800">Forgot password?</h1>
        <p className="text-gray-500 mt-1 mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm">
            If an account exists for <span className="font-medium">{values.email}</span>, a reset link
            has been sent.
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <Link
          to="/login"
          className="flex items-center gap-1.5 justify-center text-sm text-teal-600 hover:underline mt-6"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </div>
  );
}
