import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import appointmentsApi from "../api/appointments";
import adminApi from "../api/admin";
import { mapAppointmentsListFromApi, toISODateTime } from "../api/adapters";
import { useAuth } from "./AuthContext";

const AppointmentsContext = createContext(null);

export function AppointmentsProvider({ children }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // Patients/doctors get their own scoped list; admins use the admin
      // endpoint (the regular route only allows PATIENT/DOCTOR roles).
      const data =
        user.role === "admin"
          ? await adminApi.getAdminAppointments({ limit: 100 })
          : await appointmentsApi.getMyAppointments({ limit: 100 });
      setAppointments(mapAppointmentsListFromApi(data).appointments);
    } catch (err) {
      setAppointments([]);
      setError(err instanceof Error ? err.message : "Failed to load appointments.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load the caller's (patient/doctor) appointments whenever the auth user
  // changes — the backend scopes the list by role.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const bookAppointment = useCallback(
    async ({ doctorId, date, time, type, notes = "" }) => {
      // UI keeps date + time separate; the backend wants one ISO datetime.
      const scheduledAt = toISODateTime(date, time);
      const data = await appointmentsApi.createAppointment({
        doctorId,
        scheduledAt,
        type: type === "in-person" ? "IN_PERSON" : "VIDEO",
        notes,
      });
      const created = mapAppointmentsListFromApi({ appointments: [data.appointment ?? data] })
        .appointments[0];
      setAppointments((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const cancelAppointment = useCallback(
    async (id) => {
      const data = await appointmentsApi.updateAppointmentStatus(id, "CANCELLED");
      const updated = mapAppointmentsListFromApi({ appointments: [data.appointment ?? data] })
        .appointments[0];
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [],
  );

  const completeAppointment = useCallback(
    async (id) => {
      const data = await appointmentsApi.updateAppointmentStatus(id, "COMPLETED");
      const updated = mapAppointmentsListFromApi({ appointments: [data.appointment ?? data] })
        .appointments[0];
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [],
  );

  const confirmAppointment = useCallback(
    async (id) => {
      const data = await appointmentsApi.updateAppointmentStatus(id, "CONFIRMED");
      const updated = mapAppointmentsListFromApi({ appointments: [data.appointment ?? data] })
        .appointments[0];
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [],
  );

  const value = useMemo(
    () => ({
      appointments,
      isLoading,
      error,
      refresh,
      bookAppointment,
      cancelAppointment,
      completeAppointment,
      confirmAppointment,
    }),
    [appointments, isLoading, error, refresh, bookAppointment, cancelAppointment, completeAppointment, confirmAppointment],
  );

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error("useAppointments must be used within an AppointmentsProvider");
  return ctx;
}
