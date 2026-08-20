import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import useFormValidation, { validators } from "../hooks/useFormValidation";
import { Input, Textarea } from "../components/shared/Field";
import { CONTACT_EMAIL, CONTACT_PHONE } from "../utils/constants";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const { addToast } = useToast();
  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit } =
    useFormValidation(
      { name: "", email: "", message: "" },
      {
        name: validators.required,
        email: validators.email,
        message: (v) => {
          if (!v || !String(v).trim()) return "Message is required.";
          if (String(v).trim().length < 10) return "Message must be at least 10 characters.";
          return "";
        },
      }
    );

  const onSubmit = async () => {
    addToast("Message sent (demo). We'll get back to you soon!", "success");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Home
      </Link>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
          <p className="text-gray-500 mb-6">
            Have a question or feedback? Send us a message and we'll get back to you.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              name="name"
              label="Full Name"
              placeholder="Your name"
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name ? errors.name : ""}
            />
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
            />
            <Textarea
              name="message"
              label="Message"
              rows={5}
              placeholder="How can we help?"
              value={values.message}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.message ? errors.message : ""}
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              <Send size={16} aria-hidden="true" />
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 h-fit">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="bg-teal-50 text-teal-600 rounded-xl p-2.5 shrink-0">
                <Mail size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-gray-700 hover:text-teal-700">
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-teal-50 text-teal-600 rounded-xl p-2.5 shrink-0">
                <Phone size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="text-gray-700 hover:text-teal-700">
                  {CONTACT_PHONE}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-teal-50 text-teal-600 rounded-xl p-2.5 shrink-0">
                <MapPin size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-gray-700">Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
