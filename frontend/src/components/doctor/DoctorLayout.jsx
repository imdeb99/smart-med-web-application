import { LayoutDashboard, CalendarClock, Users, Star } from "lucide-react";
import Sidebar from "../shared/Sidebar";

const doctorNavItems = [
  { label: "Dashboard", to: "/doctor/dashboard", icon: LayoutDashboard },
  { label: "Availability", to: "/doctor/availability", icon: CalendarClock },
  { label: "Patients", to: "/doctor/patients", icon: Users },
  { label: "Reviews", to: "/doctor/reviews", icon: Star },
];

export default function DoctorLayout({ children }) {
  return (
    <div className="max-w-7xl mx-auto flex">
      <Sidebar title="Doctor Panel" items={doctorNavItems} />
      <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-10">{children}</div>
    </div>
  );
}
