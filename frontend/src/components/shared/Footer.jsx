import { Link } from "react-router-dom";
import { Stethoscope, Mail, Phone } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE } from "../../utils/constants";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-bold text-lg mb-3">
            <span className="bg-teal-600 text-white rounded-xl p-1.5">
              <Stethoscope size={18} />
            </span>
            SMART-MED
          </div>
          <p className="text-sm text-gray-500">
            Trusted telemedicine platform connecting patients with verified doctors, anytime, anywhere.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-teal-700">Home</Link></li>
            <li><Link to="/patient/doctors" className="hover:text-teal-700">Find a Doctor</Link></li>
            <li><Link to="/about" className="hover:text-teal-700">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-teal-700">Contact Us</Link></li>
            <li><Link to="/terms" className="hover:text-teal-700">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-teal-700">Privacy Policy</Link></li>
            <li><Link to="/login" className="hover:text-teal-700">Login</Link></li>
            <li><Link to="/register" className="hover:text-teal-700">Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Services</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>Video Consultation</li>
            <li>Home Sample Collection</li>
            <li>Ambulance Booking</li>
            <li>Digital Health Records</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Contact Us</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <Mail size={15} className="text-teal-600" />
              {CONTACT_EMAIL}
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-teal-600" />
              {CONTACT_PHONE}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} SMART-MED. All rights reserved.
      </div>
    </footer>
  );
}
