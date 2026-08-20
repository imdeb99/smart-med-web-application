import { Link } from "react-router-dom";
import {
  Stethoscope,
  Video,
  FlaskConical,
  Ambulance,
  FileHeart,
  ShieldCheck,
  Star,
  ArrowRight,
} from "lucide-react";
import { useDoctors } from "../context/DoctorsContext";
import DoctorCard from "../components/patient/DoctorCard";

const features = [
  {
    icon: Video,
    title: "Video Consultation",
    desc: "Connect with certified doctors instantly through secure video calls.",
  },
  {
    icon: FlaskConical,
    title: "Home Sample Collection",
    desc: "Book lab tests and get samples collected right from your doorstep.",
  },
  {
    icon: Ambulance,
    title: "Ambulance Booking",
    desc: "Request an ambulance in emergencies with real-time ETA tracking.",
  },
  {
    icon: FileHeart,
    title: "Digital Health Records",
    desc: "Keep all your prescriptions and medical history organized in one place.",
  },
];

const stats = [
  { label: "Verified Doctors", value: "500+" },
  { label: "Consultations Completed", value: "50K+" },
  { label: "Patient Rating", value: "4.8/5" },
  { label: "Support", value: "24/7" },
];

export default function Home() {
  const { doctors } = useDoctors();
  const topDoctors = [...doctors]
    .filter((d) => d.verified)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-b from-teal-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
              <ShieldCheck size={14} />
              BMDC Verified Doctors
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Your health, <span className="text-teal-600">one click away</span>
            </h1>
            <p className="text-gray-500 mt-4 text-lg max-w-lg">
              Book appointments, consult via video, order lab tests, and manage your health
              records — all on one trusted telemedicine platform.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/patient/doctors"
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Find a Doctor
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 bg-white border border-gray-200 hover:border-teal-300 text-gray-700 font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-teal-700">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="w-full max-w-sm aspect-square rounded-3xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-xl">
              <Stethoscope size={140} className="text-white/90" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 border border-gray-100">
              <div className="bg-emerald-50 text-emerald-600 rounded-full p-2">
                <Star size={18} className="fill-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">4.8/5 Rating</p>
                <p className="text-xs text-gray-500">From 12,000+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Everything you need, in one app</h2>
          <p className="text-gray-500 mt-3">
            From virtual consultations to emergency services, SMART-MED covers your healthcare
            journey end to end.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="bg-teal-50 text-teal-600 rounded-xl p-3 inline-flex mb-4">
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-500 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Doctors */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Top Rated Doctors</h2>
              <p className="text-gray-500 mt-2">Meet some of our highly rated, verified specialists.</p>
            </div>
            <Link
              to="/patient/doctors"
              className="hidden sm:flex items-center gap-1.5 text-teal-600 font-medium hover:underline"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-linear-to-br from-teal-600 to-emerald-600 rounded-3xl px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to take control of your health?</h2>
          <p className="mt-3 text-teal-50/90 max-w-xl mx-auto">
            Join thousands of patients who trust SMART-MED for accessible, reliable healthcare.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-medium px-6 py-3 rounded-xl mt-6 hover:bg-teal-50 transition-colors"
          >
            Create Your Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
