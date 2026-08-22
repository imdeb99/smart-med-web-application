import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ShieldAlert } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Modal from "../../components/shared/Modal";
import TableShell from "../../components/shared/TableShell";
import { Input, Select, Textarea } from "../../components/shared/Field";
import { useDoctors } from "../../context/DoctorsContext";
import { useToast } from "../../context/ToastContext";
import { getAdminDailyCapacities, overrideAdminDailyCapacity } from "../../api/admin";
import { socket, joinCapacityRoom, leaveCapacityRoom } from "../../lib/socket";

const today = () => new Date().toISOString().slice(0, 10);

const capacityDate = (d) => (typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10));

export default function ManageDailyCapacity() {
  const { doctors } = useDoctors();
  const { addToast } = useToast();

  const [capacities, setCapacities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ date: "", doctorId: "" });
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [form, setForm] = useState({ totalCapacity: "", reason: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminDailyCapacities({
        ...(filters.date ? { date: filters.date } : {}),
        ...(filters.doctorId ? { doctorId: filters.doctorId } : {}),
        limit: 100,
      });
      setCapacities(data.capacities);
    } catch (err) {
      addToast(err.message || "Could not load daily capacities.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: join every displayed capacity room and apply live updates.
  // Depends only on the room signature so count updates don't churn joins.
  const roomSignature = capacities.map((c) => `${c.doctorId}:${capacityDate(c.date)}`).join("|");
  useEffect(() => {
    const rooms = capacities.map((c) => ({ doctorId: c.doctorId, date: capacityDate(c.date) }));
    rooms.forEach((r) => joinCapacityRoom(r.doctorId, r.date));

    const onUpdate = (payload) => {
      if (!payload?.capacity) return;
      const { doctorId, date } = payload;
      setCapacities((prev) =>
        prev.map((c) =>
          c.doctorId === doctorId && capacityDate(c.date) === date
            ? { ...c, booked: payload.capacity.booked, available: payload.capacity.available }
            : c
        )
      );
    };
    socket.on("capacity-update", onUpdate);

    return () => {
      rooms.forEach((r) => leaveCapacityRoom(r.doctorId, r.date));
      socket.off("capacity-update", onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomSignature]);

  const openOverride = (capacity) => {
    setOverrideTarget(capacity);
    setForm({ totalCapacity: String(capacity.totalCapacity), reason: "" });
  };

  const submitOverride = async (e) => {
    e.preventDefault();
    const newCapacity = Number(form.totalCapacity);
    if (!Number.isInteger(newCapacity) || newCapacity <= 0) {
      addToast("Capacity must be a positive whole number.", "error");
      return;
    }
    setSaving(true);
    try {
      await overrideAdminDailyCapacity(overrideTarget.id, {
        totalCapacity: newCapacity,
        reason: form.reason.trim() || undefined,
      });
      addToast("Capacity override applied.", "success");
      setOverrideTarget(null);
      await load();
    } catch (err) {
      addToast(err.message || "Could not apply the override.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Daily Capacity Override</h1>
          <p className="text-gray-500 mt-2">
            Review doctors' daily capacity and apply emergency overrides. Every override is audit-logged.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-6 flex flex-wrap items-end gap-4">
        <div className="w-56">
          <Select
            name="doctorId"
            label="Doctor"
            value={filters.doctorId}
            onChange={(e) => setFilters((f) => ({ ...f, doctorId: e.target.value }))}
          >
            <option value="">All doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Input
            type="date"
            name="date"
            label="Date"
            max={today()}
            value={filters.date}
            onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
        <button
          onClick={() => {
            setFilters({ date: "", doctorId: "" });
          }}
          className="text-sm font-medium text-teal-600 hover:underline px-2 py-2.5"
        >
          Clear filters
        </button>
      </div>

      <div className="mt-6">
        <TableShell
          headers={["Doctor", "Date", "Capacity", "Booked", "Available", "Start", "Avg Min", "Actions"]}
          emptyState={loading ? "Loading..." : "No capacity records found."}
        >
          {capacities.map((cap) => (
            <tr key={cap.id} className="border-b border-gray-50 last:border-0">
              <td className="px-5 py-3">
                <div className="font-medium text-gray-800">{cap.doctor?.user?.name}</div>
                <div className="text-xs text-gray-500">{cap.doctor?.specialty}</div>
              </td>
              <td className="px-5 py-3 text-gray-600">{capacityDate(cap.date)}</td>
              <td className="px-5 py-3 font-medium text-gray-800">{cap.totalCapacity}</td>
              <td className="px-5 py-3 text-gray-600">{cap.booked}</td>
              <td className="px-5 py-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    cap.available > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {cap.available}
                </span>
              </td>
              <td className="px-5 py-3 text-gray-600">{cap.startTime}</td>
              <td className="px-5 py-3 text-gray-600">{cap.avgDurationMin}</td>
              <td className="px-5 py-3">
                <button
                  onClick={() => openOverride(cap)}
                  className="flex items-center gap-1.5 text-xs font-medium border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <ShieldAlert size={13} aria-hidden="true" />
                  Override
                </button>
              </td>
            </tr>
          ))}
        </TableShell>
      </div>

      {/* Override modal */}
      <Modal
        isOpen={!!overrideTarget}
        onClose={() => setOverrideTarget(null)}
        title="Override Daily Capacity"
      >
        {overrideTarget && (
          <form onSubmit={submitOverride} noValidate className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800">
              <div className="flex items-center gap-2 font-medium mb-1">
                <CalendarDays size={15} aria-hidden="true" />
                {overrideTarget.doctor?.user?.name} — {capacityDate(overrideTarget.date)}
              </div>
              <p className="text-xs text-amber-700">
                Currently {overrideTarget.booked} booked / {overrideTarget.totalCapacity} total.
                Capacity cannot go below the booked count.
              </p>
            </div>
            <Input
              type="number"
              name="totalCapacity"
              label="New Total Capacity"
              min={Math.max(1, overrideTarget.booked)}
              value={form.totalCapacity}
              onChange={(e) => setForm((f) => ({ ...f, totalCapacity: e.target.value }))}
              required
            />
            <Textarea
              name="reason"
              label="Reason (optional)"
              placeholder="e.g. Emergency — hospital overflow, adding 5 extra slots"
              rows={3}
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {saving ? "Applying..." : "Apply Override"}
            </button>
          </form>
        )}
      </Modal>
    </AdminLayout>
  );
}
