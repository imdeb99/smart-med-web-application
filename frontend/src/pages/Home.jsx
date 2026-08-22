import { Link } from "react-router-dom";
import {
  Video,
  FlaskConical,
  Ambulance,
  FileHeart,
  CalendarClock,
  BadgeCheck,
  FileCheck2,
  Radio,
  ShieldCheck,
  Star,
  ArrowRight,
  HeartPulse,
  Users,
  Stethoscope,
  Clock4,
  Activity,
} from "lucide-react";
import { useDoctors } from "../context/DoctorsContext";

/* ------------------------------------------------------------------ */
/* Static content                                                       */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: CalendarClock,
    title: "Real-Time Appointment Booking",
    desc: "Book a slot the moment it opens. Live daily-capacity tracking lets you see exactly when an appointment is actually available.",
    badge: "NEW · LIVE",
    highlight: true,
  },
  {
    icon: Video,
    title: "Video Consultation",
    desc: "Connect with certified doctors instantly through secure, encrypted video calls.",
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

const techHighlights = [
  {
    icon: Radio,
    title: "Real-time Availability",
    desc: "Slot updates stream live, so the seat you book is the seat you get.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Verified Doctors",
    desc: "Every practitioner is vetted against BMDC records before joining.",
  },
  {
    icon: FileCheck2,
    title: "Instant PDF Confirmation",
    desc: "A booking ticket is generated the second your appointment is confirmed.",
  },
  {
    icon: Clock4,
    title: "Live Slot Tracking",
    desc: "Seats reserved go green-to-grey in real time across every clinic.",
  },
];

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

function EcgLine({ className = "" }) {
  return (
    <svg
      viewBox="0 0 400 120"
      fill="none"
      aria-hidden="true"
      className={`ecg-sweep ${className}`}
    >
      <path
        d="M0 60 H105 L112 60 L118 20 L124 100 L130 60 H180 L196 60 L205 34 L211 84 L220 60 H400"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilledStar() {
  return <Star size={15} className="text-amber-400 fill-amber-400" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function Home() {
  const { doctors } = useDoctors();
  const topDoctors = [...doctors]
    .filter((d) => d.verified)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div>
      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden bg-linear-to-br from-teal-700 via-teal-600 to-emerald-600">
        {/* Soft decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full">
              <ShieldCheck size={15} />
              BMDC Verified Doctors
            </span>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight">
              Your health, <span className="text-teal-100">one click away</span>
            </h1>

            <p className="mt-5 text-lg text-teal-50/90 max-w-lg">
              Book appointments, consult via video, order lab tests, and manage your
              health — all on one trusted telemedicine platform.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/patient/doctors"
                className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-teal-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Find a Doctor
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 hover:border-white/70 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <Link
              to="/ecg-demo"
              className="inline-flex items-center gap-2 text-sm text-teal-100/80 hover:text-white transition-colors mt-5"
            >
              <HeartPulse size={15} aria-hidden="true" />
              Try the ECG signal lab — synthetic waveform, real R-peak detection
            </Link>

            {/* Stats — big card style */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl px-4 py-5 text-center hover:bg-white/15 transition-colors"
                >
                  <p className="text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-teal-50/90 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — animated ECG visual */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-white/5 backdrop-blur border border-white/15 flex flex-col items-center justify-center overflow-hidden shadow-2xl shadow-teal-900/30">
              <HeartPulse size={56} className="text-emerald-200 mb-4" />
              <p className="text-white font-semibold tracking-wide">LIVE HEART SIGNAL</p>
              <p className="text-teal-100/70 text-xs mt-1">Smart-Med Monitoring</p>
              <EcgLine className="w-4/5 text-emerald-300 absolute bottom-6" />
            </div>

            {/* Floating rating card */}
            <div className="absolute -bottom-5 -left-2 sm:-left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
              <div className="bg-amber-50 text-amber-500 rounded-full p-2">
                <Star size={20} className="fill-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">4.8/5 Rating</p>
                <p className="text-xs text-gray-500">From 12,000+ reviews</p>
              </div>
            </div>

            {/* Floating availability pill */}
            <div className="absolute top-5 -right-2 sm:-right-4 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 border border-gray-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <p className="text-xs font-semibold text-gray-700">Live availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">
            Everything you need
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-800">
            One app for your whole health journey
          </h2>
          <p className="text-gray-500 mt-3">
            From virtual consultations to emergency services, SMART-MED covers your
            healthcare end to end.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, badge, highlight }) => (
            <article
              key={title}
              className={[
                "group rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl",
                highlight
                  ? "bg-linear-to-br from-teal-50 to-emerald-50 border-teal-200 shadow-md hover:border-teal-400"
                  : "bg-white border-gray-100 shadow-sm hover:shadow-xl hover:border-teal-300",
              ].join(" ")}
            >
              <div className="flex items-center justify-between mb-5">
                <div
                  className={[
                    "rounded-xl p-3.5 inline-flex transition-colors",
                    highlight ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon size={26} strokeWidth={2.2} />
                </div>
                {badge && (
                  <span className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    {badge}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-700 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{desc}</p>
            </article>
          ))}

          {/* Fill the final grid slot with a compact "and so much more" card */}
          <div className="flex flex-col justify-center items-center text-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/40 p-7">
            <Users size={28} className="text-teal-500 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">And so much more</h3>
            <p className="text-sm text-gray-500 mt-2">
              Prescriptions, reviews, and patient portals — built with care, delivered in
              real time.
            </p>
          </div>
        </div>
      </section>

      {/* ========================== TOP DOCTORS ========================== */}
      <section className="bg-linear-to-b from-gray-50 to-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">
                Trusted specialists
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-800">
                Top Rated Doctors
              </h2>
              <p className="text-gray-500 mt-3">
                Meet some of our highly rated, BMDC-verified specialists.
              </p>
            </div>
            <Link
              to="/patient/doctors"
              className="hidden sm:inline-flex items-center gap-1.5 text-teal-600 font-semibold hover:text-teal-700"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {topDoctors.map((doctor) => (
              <article
                key={doctor.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                {/* Avatar band */}
                <div className="h-24 bg-linear-to-br from-teal-500 to-emerald-500 flex items-end justify-center pb-0">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    loading="lazy"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white -mb-12 bg-white shadow-md"
                  />
                </div>

                <div className="pt-14 px-6 pb-6 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="font-bold text-gray-800 truncate">{doctor.name}</h3>
                    {doctor.verified && (
                      <BadgeCheck size={18} className="text-emerald-500 shrink-0" aria-label="Verified doctor" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-teal-600 mt-0.5">{doctor.specialty}</p>

                  <div className="flex items-center justify-center gap-3 mt-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 font-medium px-3 py-1 rounded-full">
                      <FilledStar />
                      <span className="font-bold text-gray-800">{doctor.rating}</span>
                      ({doctor.reviewsCount})
                    </span>
                    <span className="text-gray-500">{doctor.experienceYears}+ yrs</span>
                  </div>

                  <Link
                    to={`/patient/doctors/${doctor.id}`}
                    className="mt-6 inline-flex items-center gap-1.5 w-full justify-center text-white bg-teal-600 hover:bg-teal-700 font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    View Profile
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= ECG SIGNAL LAB ========================= */}
      <section className="bg-linear-to-b from-white to-gray-50 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — live mini waveform */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-teal-600/5 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <p className="text-sm font-semibold text-gray-700">Live R-peak detection</p>
                  </div>
                  <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">
                    PAN-TOMPKINS
                  </span>
                </div>

                <div className="relative h-40 bg-teal-50/40 rounded-2xl border border-teal-100 overflow-hidden flex items-center justify-center">
                  <EcgLine className="w-4/5 text-teal-500" />
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="bg-teal-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wide text-teal-600/70">Sampling</p>
                    <p className="text-lg font-bold text-teal-700">250 Hz</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wide text-emerald-600/70">Pipeline</p>
                    <p className="text-lg font-bold text-emerald-700">5-stage</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wide text-rose-600/70">BPM</p>
                    <p className="text-lg font-bold text-rose-700">Live</p>
                  </div>
                </div>
              </div>

              {/* Floating chip */}
              <div className="absolute -top-4 -right-2 sm:-right-4 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 border border-gray-100">
                <Activity size={15} className="text-rose-500" aria-hidden="true" />
                <p className="text-xs font-semibold text-gray-700">Synthetic signal · Real algorithm</p>
              </div>
            </div>

            {/* Right — copy */}
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 uppercase tracking-wider">
                <HeartPulse size={15} />
                Signal Processing Lab
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
                A real ECG pipeline, running in your browser
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                We synthesize a physiologically-shaped P-QRS-T waveform and run a genuine
                Pan-Tompkins–style R-peak detector on the raw samples — baseline removal,
                derivative, squaring, moving-window integration, adaptive threshold.
                The BPM you see is computed from detected peaks, not the slider.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Deterministic 250 Hz ECG synthesis — no hidden randomness",
                  "6-case unit test suite validating BPM recovery across 60–120 BPM",
                  "Interactive: drag the heart-rate slider and watch detection follow",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <BadgeCheck size={17} className="text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/ecg-demo"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Open the ECG Lab
                  <ArrowRight size={17} />
                </Link>
                <p className="text-xs text-gray-400 max-w-xs">
                  This is a research demo. With embedded-systems funding and research
                  support, we aim to take it to production-grade bedside monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BUILT FOR RELIABILITY ===================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="rounded-3xl bg-linear-to-br from-teal-800 to-emerald-700 px-6 sm:px-10 py-14 text-white relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 text-teal-100 text-xs font-semibold uppercase tracking-wider">
              <Stethoscope size={16} />
              Powered by Technology
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
              Built for reliability, engineered for care
            </h2>
            <p className="mt-3 text-teal-50/90">
              Every tap on SMART-MED runs on a real-time, secure backbone — so the
              availability you see is always the availability you get.
            </p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {techHighlights.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-colors"
              >
                <div className="bg-white/15 rounded-xl p-3 inline-flex mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-teal-50/90 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-24">
        <div className="bg-linear-to-br from-teal-600 to-emerald-600 rounded-3xl px-6 sm:px-12 py-16 md:py-20 text-center text-white shadow-xl shadow-teal-600/10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to take control of your health?
          </h2>
          <p className="mt-4 text-teal-50/90 max-w-xl mx-auto text-lg">
            Join thousands of patients who trust SMART-MED for accessible, reliable
            healthcare — your first step takes less than a minute.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-8 py-3.5 rounded-xl mt-8 hover:bg-teal-50 hover:-translate-y-0.5 transition-all shadow-lg"
          >
            Create Your Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}