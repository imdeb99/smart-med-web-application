import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Menu,
  X,
  LogOut,
  UserCircle,
  ChevronDown,
  FlaskConical,
  Ambulance,
  Calculator,
  UserRound,
  Share2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ShareMenu from "./ShareMenu";

const navLinksByRole = {
  guest: [
    { label: "Home", to: "/" },
    { label: "Find a Doctor", to: "/patient/doctors" },
  ],
  patient: [
    { label: "Dashboard", to: "/patient/dashboard" },
    { label: "Find a Doctor", to: "/patient/doctors" },
    { label: "Appointments", to: "/patient/appointments" },
    { label: "Health Records", to: "/patient/records" },
  ],
  doctor: [
    { label: "Dashboard", to: "/doctor/dashboard" },
    { label: "Availability", to: "/doctor/availability" },
    { label: "Patients", to: "/doctor/patients" },
    { label: "Reviews", to: "/doctor/reviews" },
  ],
  admin: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Verify Doctors", to: "/admin/verify-doctors" },
    { label: "Manage Doctors", to: "/admin/doctors" },
    { label: "Manage Patients", to: "/admin/patients" },
    { label: "Lab Assistants", to: "/admin/lab-assistants" },
    { label: "Ambulance Fleet", to: "/admin/ambulances" },
    { label: "Transactions", to: "/admin/transactions" },
    { label: "Reports", to: "/admin/reports" },
  ],
};

// Patient-only service links. Logged-in users navigate straight to them;
// guests are sent to /login first (with the destination stashed in state).
const serviceLinks = [
  { label: "Home Sample Collection", to: "/patient/sample-collection", icon: FlaskConical },
  { label: "Ambulance Booking", to: "/patient/ambulance", icon: Ambulance },
  { label: "BMI Calculator", to: "/patient/bmi-calculator", icon: Calculator },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const role = user?.role || "guest";
  const links = navLinksByRole[role];

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    addToast("You have been logged out.", "info");
    navigate("/");
  };

  // "Protect on click": guests are redirected to /login with the intended
  // destination in state so the login page can send them back after signing in.
  const handleServiceClick = (e, to) => {
    setMenuOpen(false);
    setServicesOpen(false);
    if (user) return; // Logged in — let the Link navigate normally.
    e.preventDefault();
    navigate("/login", { state: { from: to } });
  };

  const handleShare = () => {
    setProfileOpen(false);
    setMenuOpen(false);
    setShareOpen(true);
  };

  const linkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "text-teal-700 bg-teal-50" : "text-gray-600 hover:text-teal-700 hover:bg-teal-50"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-teal-700 font-bold text-lg shrink-0">
          <span className="bg-teal-600 text-white rounded-xl p-1.5">
            <Stethoscope size={20} />
          </span>
          SMART-MED
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {role !== "doctor" &&
            role !== "admin" &&
            links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClasses}>
                {link.label}
              </NavLink>
            ))}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
              onClick={() => setServicesOpen((prev) => !prev)}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              aria-label="Services menu"
            >
              Services
              <ChevronDown size={14} />
            </button>
            {servicesOpen && (
              <div className="absolute left-0 top-full pt-1 w-56">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                  {serviceLinks.map(({ label, to, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={(e) => handleServiceClick(e, to)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label="Account menu"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <UserCircle size={18} className="text-teal-600" />
                {user.name}
                <span className="capitalize text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full ml-1">
                  {user.role}
                </span>
                <ChevronDown size={14} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full pt-1 w-56">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                    >
                      <UserRound size={15} />
                      Profile
                    </Link>
                    <button
                      onClick={handleShare}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                    >
                      <Share2 size={15} />
                      Share
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-teal-700 px-3 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-white">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "text-teal-700 bg-teal-50" : "text-gray-600 hover:bg-teal-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {serviceLinks.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={(e) => handleServiceClick(e, to)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-teal-50"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-teal-50"
                >
                  <UserRound size={15} />
                  Profile
                </Link>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-teal-50 w-full"
                >
                  <Share2 size={15} />
                  Share
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg w-full"
                >
                  <LogOut size={16} />
                  Logout ({user.name})
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-600 hover:text-teal-700 px-3 py-2 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-lg text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {shareOpen && <ShareMenu onClose={() => setShareOpen(false)} />}
    </header>
  );
}
