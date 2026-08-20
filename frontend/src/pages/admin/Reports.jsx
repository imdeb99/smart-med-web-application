import { useMemo } from "react";
import { Star, BarChart3 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import EmptyState from "../../components/shared/EmptyState";
import { useDoctors } from "../../context/DoctorsContext";
import { useAppointments } from "../../context/AppointmentsContext";
import mockTransactions from "../../data/mockTransactions";

const MONTH_LABELS = {
  "2026-03": "Mar",
  "2026-04": "Apr",
  "2026-05": "May",
  "2026-06": "Jun",
  "2026-07": "Jul",
  "2026-08": "Aug",
};

const STATUS_COLORS = {
  upcoming: "bg-teal-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-400",
};

export default function Reports() {
  const { doctors } = useDoctors();
  const { appointments } = useAppointments();

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
  const hasRevenue = Object.values(revenueByMonth).some((v) => v > 0);

  const specialtyBreakdown = useMemo(() => {
    const counts = {};
    appointments.forEach((a) => {
      const doctor = doctors.find((d) => d.id === a.doctorId);
      if (!doctor) return;
      counts[doctor.specialty] = (counts[doctor.specialty] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [appointments, doctors]);
  const maxSpecialtyCount = Math.max(...specialtyBreakdown.map(([, c]) => c), 1);

  const statusBreakdown = useMemo(() => {
    const counts = { upcoming: 0, completed: 0, cancelled: 0 };
    appointments.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    });
    return counts;
  }, [appointments]);
  const totalAppointments = appointments.length || 1;

  const topDoctors = useMemo(
    () => [...doctors].sort((a, b) => b.rating - a.rating).slice(0, 5),
    [doctors]
  );

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
      <p className="text-gray-500 mb-8">Platform performance at a glance.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-6">Revenue Trend</h2>
          {!hasRevenue ? (
            <EmptyState icon={BarChart3} title="No revenue data yet" />
          ) : (
            <div className="flex items-end justify-between gap-3 h-44">
              {Object.entries(revenueByMonth).map(([month, amount]) => (
                <div key={month} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                  <span className="text-xs font-medium text-gray-500">৳{amount.toLocaleString()}</span>
                  <div
                    className="w-full max-w-9 rounded-t-lg bg-teal-500"
                    style={{ height: `${Math.max((amount / maxRevenue) * 100, 4)}%` }}
                  />
                  <span className="text-xs text-gray-400">{MONTH_LABELS[month]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-6">Appointments by Specialty</h2>
          {specialtyBreakdown.length === 0 ? (
            <EmptyState icon={BarChart3} title="No appointment data yet" />
          ) : (
            <div className="space-y-3">
              {specialtyBreakdown.map(([specialty, count]) => (
                <div key={specialty} className="flex items-center gap-3 text-xs">
                  <span className="w-32 text-gray-600 truncate shrink-0">{specialty}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${(count / maxSpecialtyCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-gray-400 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-6">Appointment Status Breakdown</h2>
          {totalAppointments === 1 ? (
            <EmptyState icon={BarChart3} title="No appointment data yet" />
          ) : (
            <>
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-4">
                {Object.entries(statusBreakdown).map(([status, count]) => (
                  <div
                    key={status}
                    className={STATUS_COLORS[status]}
                    style={{ width: `${(count / totalAppointments) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                {Object.entries(statusBreakdown).map(([status, count]) => (
                  <span key={status} className="flex items-center gap-1.5 capitalize">
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
                    {status} ({count})
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Rated Doctors</h2>
          {topDoctors.length === 0 ? (
            <EmptyState icon={Star} title="No doctors yet" />
          ) : (
            <div className="space-y-3">
              {topDoctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center gap-3">
                  <img src={doctor.avatar} alt={doctor.name} loading="lazy" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doctor.name}</p>
                    <p className="text-xs text-gray-500">{doctor.specialty}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-500 shrink-0">
                    <Star size={13} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                    {doctor.rating}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
