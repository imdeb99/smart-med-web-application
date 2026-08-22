import {
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  Users,
  FlaskConical,
  Ambulance,
  Receipt,
  BarChart3,
  CalendarClock,
} from "lucide-react";
import Sidebar from "../shared/Sidebar";

const adminNavItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Verify Doctors", to: "/admin/verify-doctors", icon: ShieldCheck },
  { label: "Manage Doctors", to: "/admin/doctors", icon: Stethoscope },
  { label: "Manage Patients", to: "/admin/patients", icon: Users },
  { label: "Lab Assistants", to: "/admin/lab-assistants", icon: FlaskConical },
  { label: "Ambulance Fleet", to: "/admin/ambulances", icon: Ambulance },
  { label: "Daily Capacity", to: "/admin/daily-capacity", icon: CalendarClock },
  { label: "Transactions", to: "/admin/transactions", icon: Receipt },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  return (
    <div className="max-w-7xl mx-auto flex">
      <Sidebar title="Admin Panel" items={adminNavItems} />
      <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-10">{children}</div>
    </div>
  );
}
