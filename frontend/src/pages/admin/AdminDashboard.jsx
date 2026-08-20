import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Users,
  ShieldAlert,
  Wallet,
  ShieldCheck,
  FlaskConical,
  Ambulance,
  Receipt,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useDoctors } from "../../context/DoctorsContext";
import { usePatients } from "../../context/PatientsContext";
import mockTransactions from "../../data/mockTransactions";

const MONTH_LABELS = {
  "2026-03": "Mar",
  "2026-04": "Apr",
  "2026-05": "May",
  "2026-06": "Jun",
  "2026-07": "Jul",
  "2026-08": "Aug",
};

export default function AdminDashboard() {
  const { doctors } = useDoctors();
  const { patients } = usePatients();

  const pendingVerifications = doctors.filter((d) => !d.verified).length;
  const totalRevenue = mockTransactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const revenueByMonth = useMemo(() => {
    const totals = {};
    Object.keys(MONTH_LABELS).forEach((key) => (totals[key] = 0));
    mockTransactions
      .filter((t) => t.status === "paid")
      .forEach((t) => {
        const month = t.date.slice(0, 7);
        if (totals[month] !== undefined) totals[month] += t.amount;
      });
    return totals;
  }, []);

  const maxRevenue = Math.max(...Object.values(revenueByMonth), 1);

  const stats = [
    { label: "Total Doctors", value: doctors.length, icon: Stethoscope, color: "bg-teal-50 text-teal-600" },
    { label: "Total Patients", value: patients.length, icon: Users, color: "bg-emerald-50 text-emerald-600" },
    { label: "Pending Verifications", value: pendingVerifications, icon: ShieldAlert, color: "bg-amber-50 text-amber-600" },
    { label: "Total Revenue", value: `৳${totalRevenue.toLocaleString()}`, icon: Wallet, color: "bg-purple-50 text-purple-600" },
  ];

  const quickActions = [
    { label: "Verify Doctors", to: "/admin/verify-doctors", icon: ShieldCheck, color: "bg-teal-50 text-teal-600" },
    { label: "Manage Doctors", to: "/admin/doctors", icon: Stethoscope, color: "bg-emerald-50 text-emerald-600" },
    { label: "Manage Patients", to: "/admin/patients", icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Lab Assistants", to: "/admin/lab-assistants", icon: FlaskConical, color: "bg-amber-50 text-amber-600" },
    { label: "Ambulance Fleet", to: "/admin/ambulances", icon: Ambulance, color: "bg-red-50 text-red-600" },
    { label: "Transactions", to: "/admin/transactions", icon: Receipt, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Platform-wide overview of SMART-MED operations.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-6">Revenue Overview (last 6 months)</h2>
        <div className="flex items-end justify-between gap-3 h-48">
          {Object.entries(revenueByMonth).map(([month, amount]) => (
            <div key={month} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="text-xs font-medium text-gray-500">৳{amount.toLocaleString()}</span>
              <div
                className="w-full max-w-10 rounded-t-lg bg-teal-500"
                style={{ height: `${Math.max((amount / maxRevenue) * 100, 4)}%` }}
              />
              <span className="text-xs text-gray-400">{MONTH_LABELS[month]}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Demo chart based on mock transaction data.
        </p>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mt-10 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {quickActions.map(({ label, to, icon: Icon, color }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center gap-3"
          >
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon size={20} aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
