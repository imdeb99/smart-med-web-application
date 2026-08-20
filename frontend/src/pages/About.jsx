import { Link } from "react-router-dom";
import { ArrowLeft, HeartHandshake, Users, GraduationCap, Stethoscope } from "lucide-react";

const pillars = [
  {
    icon: Stethoscope,
    title: "Verified Care",
    desc: "Every doctor is checked against BMDC registration before their profile goes live.",
  },
  {
    icon: HeartHandshake,
    title: "Patient First",
    desc: "From booking to follow-up, every feature is built around the patient's journey.",
  },
  {
    icon: Users,
    title: "Built for Bangladesh",
    desc: "Localized for the way healthcare actually works here — from bKash payments to home visits.",
  },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 mb-6"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Home
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">About SMART-MED</h1>

        <div className="bg-teal-50 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-teal-800 mb-2">Our Mission</h2>
          <p className="text-sm text-teal-900/80 leading-relaxed">
            To make quality healthcare accessible to every person in Bangladesh — connecting them
            with verified doctors, home sample collection, and emergency services, all from their
            phone.
          </p>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">What SMART-MED Does</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          SMART-MED is a telemedicine platform that brings the whole healthcare journey into one
          place. Patients can browse verified specialists, book video or in-person consultations,
          pay securely, keep digital health records, order home sample collection, and call an
          ambulance in an emergency. Doctors get a dedicated workspace to manage their
          availability, patients, prescriptions, and reviews.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="bg-teal-50 text-teal-600 rounded-xl p-2.5 inline-flex mb-3">
                <Icon size={20} aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-5 flex items-start gap-3">
          <GraduationCap size={20} className="text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-1">University Project</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              SMART-MED is a student team project built to demonstrate a full-stack telemedicine
              platform — a working frontend prototype with mock data, designed to be connected to a
              real backend in a future phase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
